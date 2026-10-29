#!/usr/bin/env python3
"""
build_home_values_json.py

Converts the Zillow Research ZHVI county-level CSV
(County_zhvi_uc_sfrcondo_tier_0_33_0_67_sm_sa_month.csv — smoothed,
seasonally adjusted, all-home mid-tier home value) into:

  1. data/home-values.json
     All-states pattern, keyed by FIPS. Per county: latest ZHVI value plus
     1-year and 5-year deltas only — the full ~300-column monthly time
     series is intentionally discarded. Always contains every county the
     source CSV has data for; --states never truncates this file (see
     "county-index-out" below for the file --states does control).

  2. meta/home-affordability-counties-index.json
     Lightweight route-generation index (fips, sizeRank, slug, name, state)
     for whichever counties are currently selected for publishing. This is
     the file --states controls — home-values.json stays the complete
     benchmark dataset regardless of which states you're rolling out this
     week, so the dataset file's contents never silently depend on the
     last rollout batch you ran.

Usage:
    python build_home_values_json.py \\
        --input County_zhvi_uc_sfrcondo_tier_0_33_0_67_sm_sa_month.csv \\
        --home-values-out data/home-values.json \\
        --county-index-out meta/home-affordability-counties-index.json

    # Rollout batch: index only Ohio and Texas's counties.
    # home-values.json still gets every county with data.
    python build_home_values_json.py --input ... --states ohio,texas

    # State abbreviations work too, case-insensitive:
    python build_home_values_json.py --input ... --states OH,TX

    # Omit --states to index every county in every state (e.g. initial setup).
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# US state abbreviation -> full name -> slug.
# The source CSV's "State"/"StateName" columns are both two-letter
# abbreviations (verified against the actual file header — there is no full
# state name column), so this mapping is required to produce a stateSlug
# that matches the site's existing /data/states/<slug>.json file names.
# ---------------------------------------------------------------------------
STATE_ABBR_TO_NAME: dict[str, str] = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut",
    "DE": "Delaware", "DC": "District of Columbia", "FL": "Florida",
    "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois",
    "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky",
    "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota",
    "MS": "Mississippi", "MO": "Missouri", "MT": "Montana",
    "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire",
    "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio",
    "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania",
    "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota",
    "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont",
    "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming",
}

DATE_COL_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

REQUIRED_COLUMNS = {
    "RegionType", "State", "StateCodeFIPS", "MunicipalCodeFIPS",
    "RegionName", "SizeRank",
}


def slugify(name: str) -> str:
    """'New York' -> 'new-york'. Matches the site's existing state-slug style."""
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


# slug -> abbreviation, built from STATE_ABBR_TO_NAME so the two mappings
# can never drift out of sync with each other.
STATE_SLUG_TO_ABBR: dict[str, str] = {
    slugify(name): abbr for abbr, name in STATE_ABBR_TO_NAME.items()
}


def resolve_state_slugs(raw_states: str) -> set[str]:
    """
    Parses a comma-separated --states value where each entry may be a
    two-letter abbreviation ("OH") or a slug ("ohio"), case-insensitive,
    into the set of canonical state slugs used throughout this pipeline.
    Fails loudly on anything unrecognized rather than silently producing
    an empty or partial batch.
    """
    resolved: set[str] = set()
    unrecognized: list[str] = []

    for raw in raw_states.split(","):
        entry = raw.strip()
        if not entry:
            continue
        lowered = entry.lower()
        if entry.upper() in STATE_ABBR_TO_NAME:
            resolved.add(slugify(STATE_ABBR_TO_NAME[entry.upper()]))
        elif lowered in STATE_SLUG_TO_ABBR:
            resolved.add(lowered)
        else:
            unrecognized.append(entry)

    if unrecognized:
        raise ValueError(
            f"Unrecognized --states value(s): {unrecognized}. "
            f"Use a two-letter state abbreviation (OH) or a slug (ohio)."
        )
    if not resolved:
        raise ValueError("--states was given but contained no usable state names.")

    return resolved


def build_fips(state_fips: str, municipal_fips: str) -> str:
    """
    Zero-pad and concatenate into a 5-character FIPS string.
    Always a string — never int() this, leading zeros are load-bearing
    (e.g. Alabama's 01xxx counties).
    """
    fips = state_fips.strip().zfill(2) + municipal_fips.strip().zfill(3)
    if len(fips) != 5 or not fips.isdigit():
        raise ValueError(
            f"Malformed FIPS built from state={state_fips!r} "
            f"municipal={municipal_fips!r} -> {fips!r}"
        )
    return fips


def get_date_columns(fieldnames: list[str]) -> list[str]:
    """All YYYY-MM-DD columns, sorted chronologically."""
    date_cols = [c for c in fieldnames if DATE_COL_RE.match(c)]
    if not date_cols:
        raise ValueError("No date-formatted columns found in the CSV header.")
    return sorted(date_cols, key=lambda c: date.fromisoformat(c))


def same_month_previous_year(target: date, date_cols: list[str], years: int) -> str | None:
    """
    The column for the same calendar month, `years` years before `target`
    — e.g. latest=2026-08-31, years=1 -> the 2025-08 column, whatever exact
    day-of-month that column uses. Returns None if that month isn't present
    (rather than falling back to a neighboring month, which would silently
    mislabel a value as "one year ago" when it isn't).
    """
    want_year = target.year - years
    matches = [
        c for c in date_cols
        if date.fromisoformat(c).year == want_year
        and date.fromisoformat(c).month == target.month
    ]
    return matches[0] if matches else None


def parse_size_rank(row: dict[str, str]) -> int:
    raw = (row.get("SizeRank") or "").strip()
    region = row.get("RegionName", "<unknown>")
    if not raw:
        raise ValueError(f"Missing SizeRank for {region!r}")
    try:
        return int(raw)
    except ValueError as exc:
        raise ValueError(f"Invalid SizeRank {raw!r} for {region!r}") from exc


def pct_change(old: float | None, new: float | None) -> float | None:
    if old is None or new is None or old == 0:
        return None
    return round((new - old) / old, 4)


def to_float_or_none(raw: str | None) -> float | None:
    if raw is None or raw.strip() == "":
        return None
    try:
        return float(raw)
    except ValueError:
        return None


def to_rounded_dollars_or_none(raw: str | None) -> float | None:
    """
    ZHVI ships with sub-cent decimal precision (e.g. 296380.7820668407),
    which is spurious — the underlying model isn't accurate to the cent.
    Round to the nearest whole dollar so the JSON doesn't imply false
    precision (same principle CLAUDE.md applies elsewhere to derived data).
    """
    value = to_float_or_none(raw)
    return None if value is None else round(value)


def convert(input_path: Path) -> tuple[dict[str, Any], list[dict[str, Any]]]:
    """
    Returns (home_values_doc, all_county_records). home_values_doc always
    contains every county with data — callers apply --states only when
    building the county index, not here.
    """
    with input_path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        fieldnames = reader.fieldnames or []

        missing_columns = REQUIRED_COLUMNS - set(fieldnames)
        if missing_columns:
            raise ValueError(
                f"Missing required Zillow CSV columns: {sorted(missing_columns)}"
            )

        date_cols = get_date_columns(fieldnames)
        latest_col = date_cols[-1]
        latest_date = date.fromisoformat(latest_col)

        one_year_col = same_month_previous_year(latest_date, date_cols, 1)
        five_year_col = same_month_previous_year(latest_date, date_cols, 5)
        # A missing individual county value is expected and becomes null.
        # A missing *column* means the dataset's shape changed (e.g. Zillow
        # altered the file), which would otherwise silently null out the
        # 1yr/5yr fields for every one of ~3,000 counties. Fail loudly
        # instead of degrading the whole output contract quietly.
        if one_year_col is None:
            raise ValueError(
                f"No same-month column found for one year before {latest_col}. "
                f"The output contract promises oneYearAgoValue/oneYearChangePct "
                f"for every county — refusing to generate a file that can't "
                f"honor it."
            )
        if five_year_col is None:
            raise ValueError(
                f"No same-month column found for five years before {latest_col}. "
                f"The output contract promises fiveYearAgoValue/fiveYearChangePct "
                f"for every county — refusing to generate a file that can't "
                f"honor it."
            )

        rows = [r for r in reader if r.get("RegionType") == "county"]

        if not rows:
            raise ValueError("No county rows found in the Zillow CSV.")
        # Roughly 3,143 US counties exist; this file has had ~3,071 with
        # ZHVI coverage. A much smaller count likely means the wrong Zillow
        # export was supplied (e.g. state- or metro-level data instead of
        # county-level) rather than a real change in coverage.
        MIN_EXPECTED_COUNTIES = 2500
        if len(rows) < MIN_EXPECTED_COUNTIES:
            raise ValueError(
                f"Expected at least {MIN_EXPECTED_COUNTIES} county rows "
                f"(there are ~3,143 US counties), but found only {len(rows)}. "
                f"Check that the correct Zillow county-level CSV was supplied."
            )
        print(f"Found {len(rows)} county rows in source CSV.", file=sys.stderr)

    rows.sort(key=parse_size_rank)

    counties: list[dict[str, Any]] = []
    seen_fips: set[str] = set()
    skipped_unmapped_state = 0

    for row in rows:
        state_abbr = row["State"].strip().upper()
        state_name = STATE_ABBR_TO_NAME.get(state_abbr)
        if state_name is None:
            # Defensive: a state code the mapping doesn't cover (e.g. a
            # territory). Skip rather than write a bad stateSlug, and
            # report the count so it can't silently disappear unnoticed.
            skipped_unmapped_state += 1
            continue

        fips = build_fips(row["StateCodeFIPS"], row["MunicipalCodeFIPS"])
        if fips in seen_fips:
            raise ValueError(
                f"Duplicate FIPS {fips!r} encountered for {row['RegionName']!r} "
                f"— FIPS must be unique, this indicates a source-data problem."
            )
        seen_fips.add(fips)

        latest_value = to_rounded_dollars_or_none(row.get(latest_col))
        one_year_value = (
            to_rounded_dollars_or_none(row.get(one_year_col))
            if one_year_col else None
        )
        five_year_value = (
            to_rounded_dollars_or_none(row.get(five_year_col))
            if five_year_col else None
        )

        counties.append({
            "fips": fips,
            "sizeRank": parse_size_rank(row),
            "name": row["RegionName"].strip(),
            "stateSlug": slugify(state_name),
            "latestValue": latest_value,
            "oneYearAgoValue": one_year_value,
            "oneYearChangePct": pct_change(one_year_value, latest_value),
            "fiveYearAgoValue": five_year_value,
            "fiveYearChangePct": pct_change(five_year_value, latest_value),
        })

    if skipped_unmapped_state:
        print(
            f"Warning: skipped {skipped_unmapped_state} row(s) with an "
            f"unrecognized state code (not in STATE_ABBR_TO_NAME).",
            file=sys.stderr,
        )

    missing_latest = sum(1 for c in counties if c["latestValue"] is None)
    if missing_latest:
        print(
            f"Note: {missing_latest} of {len(counties)} counties have no "
            f"ZHVI value for {latest_col} — written as null "
            f"(render as 'Data not available', per CLAUDE.md).",
            file=sys.stderr,
        )

    home_values_doc = {
        "dataAsOf": latest_col,
        "lastUpdated": datetime.now(timezone.utc).date().isoformat(),
        "officialSourceUrl": "https://www.zillow.com/research/data/",
        "officialSourceLabel": (
            "Zillow Research ZHVI — smoothed, seasonally adjusted, "
            "all-home mid-tier"
        ),
        "counties": counties,
    }

    return home_values_doc, counties


def build_county_index(
    counties: list[dict[str, Any]], state_slugs: set[str] | None
) -> list[dict[str, Any]]:
    """
    The county subset selected for the current rollout batch, by state.
    Unlike home-values.json, this is the file --states is meant to control.

    This function only knows state, SizeRank, and county name — it does NOT
    know whether a state's property-tax page exists, whether Ahrefs demand
    clears the agreed threshold, or whether the SERP has been checked. Those
    are the actual publishing-eligibility gates (see CLAUDE.md's rollout
    phasing) and are handled outside this data-conversion script. Treat this
    output as "candidates for the next batch," not "approved for publish."
    """
    subset = (
        [c for c in counties if c["stateSlug"] in state_slugs]
        if state_slugs is not None
        else counties
    )
    return [
        {
            "fips": c["fips"],
            "sizeRank": c["sizeRank"],
            "slug": slugify(c["name"]),
            "name": c["name"],
            "stateSlug": c["stateSlug"],
        }
        for c in subset
    ]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument(
        "--input", required=True, type=Path,
        help="Path to the Zillow ZHVI county CSV.",
    )
    parser.add_argument(
        "--home-values-out", type=Path,
        default=Path("data/home-values.json"),
        help="Output path for the full ZHVI benchmark data file (never truncated by --limit).",
    )
    parser.add_argument(
        "--county-index-out", type=Path,
        default=Path("meta/home-affordability-counties-index.json"),
        help="Output path for the route-generation index (this is what --states controls).",
    )
    parser.add_argument(
        "--states", type=str, default=None,
        help=(
            "Comma-separated states to include in the county INDEX (route "
            "generation) for this rollout batch, e.g. 'ohio,texas' or "
            "'OH,TX' (case-insensitive, either form works). "
            "home-values.json always contains the full dataset regardless "
            "of this flag. Omit to index every state's counties."
        ),
    )
    args = parser.parse_args()

    if not args.input.exists():
        parser.error(f"Input file not found: {args.input}")

    state_slugs: set[str] | None = None
    if args.states is not None:
        try:
            state_slugs = resolve_state_slugs(args.states)
        except ValueError as exc:
            parser.error(str(exc))

    home_values_doc, all_counties = convert(args.input)
    index_entries = build_county_index(all_counties, state_slugs)

    if state_slugs is not None:
        found_slugs = {c["stateSlug"] for c in index_entries}
        missing_slugs = state_slugs - found_slugs
        if missing_slugs:
            missing_display = sorted(STATE_SLUG_TO_ABBR.get(s, s) for s in missing_slugs)
            print(
                f"Warning: no counties found for requested state(s): "
                f"{missing_display}. Check spelling, or the source CSV may "
                f"not cover them.",
                file=sys.stderr,
            )

    args.home_values_out.parent.mkdir(parents=True, exist_ok=True)
    args.county_index_out.parent.mkdir(parents=True, exist_ok=True)

    with args.home_values_out.open("w", encoding="utf-8") as f:
        json.dump(home_values_doc, f, indent=2, ensure_ascii=False)
        f.write("\n")

    with args.county_index_out.open("w", encoding="utf-8") as f:
        json.dump(index_entries, f, indent=2, ensure_ascii=False)
        f.write("\n")

    print(
        f"Wrote {len(home_values_doc['counties'])} counties (full dataset) "
        f"to {args.home_values_out}"
    )
    states_display = (
        f"(states: {sorted(STATE_SLUG_TO_ABBR.get(s, s) for s in state_slugs)}) "
        if state_slugs is not None else ""
    )
    print(
        f"Wrote {len(index_entries)} entries {states_display}"
        f"to {args.county_index_out}"
    )


if __name__ == "__main__":
    main()