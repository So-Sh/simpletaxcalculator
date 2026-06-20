"""
build_property_tax_json.py

Converts the Tax Foundation county-level property tax CSV
(https://taxfoundation.org/data/all/state/property-taxes-by-state-county/)
into a single property-tax.json file, following the same
"one JSON file for all states" pattern used by gas-tax.json
and capital-gains.json in simpletaxcalculator.app.

Usage:
    python3 build_property_tax_json.py <input_csv> <output_json>

Notes on source data quirks handled here:
  - UTF-8 BOM on the header row (utf-8-sig)
  - County names have a trailing space before the comma-separated state
    (e.g. "Autauga County, Alabama" arrives pre-split as two CSV columns,
    but the County column itself has no trailing space issue once parsed
    via csv.reader; State column may have a leading space)
  - "n/a" strings in numeric columns -> stored as None (JSON null)
  - "-" as a literal placeholder for missing Median Property Taxes Paid
    (e.g. Denali Borough, AK) -> stored as None
  - The $199 floor: Census/Tax Foundation top-codes very low medians at
    199, meaning "less than $200" rather than a precise figure. We flag
    this explicitly with an `isFloorValue` boolean per county so the
    frontend can render "Less than $200" instead of "$199".
  - FIPS codes are kept as zero-padded strings (e.g. "01001"), never cast
    to int, to avoid losing the leading zero.
  - District of Columbia appears as both the "state" and its own single
    "county" row, matching how Tax Foundation reports it.
"""

import csv
import json
import sys
from collections import defaultdict
from pathlib import Path

# Tax Foundation's "less than $200" top-coding floor value, in dollars.
MEDIAN_TAX_FLOOR = 199

# State name -> (slug, USPS abbreviation). Used to match the slug/abbreviation
# convention already used in states-index.json and the per-state sales-tax files.
STATE_INFO = {
    "Alabama": ("alabama", "AL"),
    "Alaska": ("alaska", "AK"),
    "Arizona": ("arizona", "AZ"),
    "Arkansas": ("arkansas", "AR"),
    "California": ("california", "CA"),
    "Colorado": ("colorado", "CO"),
    "Connecticut": ("connecticut", "CT"),
    "Delaware": ("delaware", "DE"),
    "District of Columbia": ("district-of-columbia", "DC"),
    "Florida": ("florida", "FL"),
    "Georgia": ("georgia", "GA"),
    "Hawaii": ("hawaii", "HI"),
    "Idaho": ("idaho", "ID"),
    "Illinois": ("illinois", "IL"),
    "Indiana": ("indiana", "IN"),
    "Iowa": ("iowa", "IA"),
    "Kansas": ("kansas", "KS"),
    "Kentucky": ("kentucky", "KY"),
    "Louisiana": ("louisiana", "LA"),
    "Maine": ("maine", "ME"),
    "Maryland": ("maryland", "MD"),
    "Massachusetts": ("massachusetts", "MA"),
    "Michigan": ("michigan", "MI"),
    "Minnesota": ("minnesota", "MN"),
    "Mississippi": ("mississippi", "MS"),
    "Missouri": ("missouri", "MO"),
    "Montana": ("montana", "MT"),
    "Nebraska": ("nebraska", "NE"),
    "Nevada": ("nevada", "NV"),
    "New Hampshire": ("new-hampshire", "NH"),
    "New Jersey": ("new-jersey", "NJ"),
    "New Mexico": ("new-mexico", "NM"),
    "New York": ("new-york", "NY"),
    "North Carolina": ("north-carolina", "NC"),
    "North Dakota": ("north-dakota", "ND"),
    "Ohio": ("ohio", "OH"),
    "Oklahoma": ("oklahoma", "OK"),
    "Oregon": ("oregon", "OR"),
    "Pennsylvania": ("pennsylvania", "PA"),
    "Rhode Island": ("rhode-island", "RI"),
    "South Carolina": ("south-carolina", "SC"),
    "South Dakota": ("south-dakota", "SD"),
    "Tennessee": ("tennessee", "TN"),
    "Texas": ("texas", "TX"),
    "Utah": ("utah", "UT"),
    "Vermont": ("vermont", "VT"),
    "Virginia": ("virginia", "VA"),
    "Washington": ("washington", "WA"),
    "West Virginia": ("west-virginia", "WV"),
    "Wisconsin": ("wisconsin", "WI"),
    "Wyoming": ("wyoming", "WY"),
}


def parse_dollar(raw: str):
    """Parse the 'Median Property Taxes Paid' column.

    Returns (value, is_floor) where value is an int or None.
    """
    raw = raw.strip()
    if raw == "" or raw.lower() == "n/a" or raw == "-":
        return None, False
    value = int(float(raw))
    return value, value == MEDIAN_TAX_FLOOR


def parse_rate(raw: str):
    """Parse 'Effective tax rate (2024)', given as a percent (e.g. 0.28 = 0.28%).

    Tax Foundation reports this column as a percentage value, not a decimal
    fraction (Jefferson County, AL = 0.58 means 0.58%, not 58%). We store it
    as a true decimal fraction (0.0058) under medianEffectiveRate so it is
    usable directly in rate x value math, consistent with how rates.state is
    stored as a decimal fraction (e.g. 0.04) in the sales-tax files.
    """
    raw = raw.strip()
    if raw == "" or raw.lower() == "n/a" or raw == "-":
        return None
    return round(float(raw) / 100, 6)


def parse_pct_change(raw: str):
    """Parse the inflation-adjusted % change column. Returns float or None."""
    raw = raw.strip()
    if raw == "" or raw.lower() == "n/a" or raw == "-":
        return None
    return float(raw)


def build(input_csv: Path, output_json: Path) -> None:
    states = defaultdict(list)
    row_count = 0
    skipped_states = set()

    with input_csv.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        header = next(reader)  # noqa: F841 (kept for clarity/debugging)

        for row in reader:
            if not row or len(row) < 6:
                continue

            fips, county_raw, state_raw, median_raw, rate_raw, pct_change_raw = row[:6]

            fips = fips.strip()
            county_name = county_raw.strip()
            state_name = state_raw.strip()

            if state_name not in STATE_INFO:
                skipped_states.add(state_name)
                continue

            median_tax_paid, is_floor = parse_dollar(median_raw)
            median_effective_rate = parse_rate(rate_raw)
            pct_change_inflation_adjusted = parse_pct_change(pct_change_raw)

            states[state_name].append(
                {
                    "fips": fips,
                    "name": county_name,
                    "medianTaxPaid": median_tax_paid,
                    "isFloorValue": is_floor,
                    "medianEffectiveRate": median_effective_rate,
                    "pctChangeInflationAdjusted": pct_change_inflation_adjusted,
                }
            )
            row_count += 1

    if skipped_states:
        print(f"WARNING: skipped unrecognized state names: {skipped_states}", file=sys.stderr)

    output_states = []
    for state_name, (slug, abbreviation) in STATE_INFO.items():
        counties = states.get(state_name, [])
        # Keep county order stable and predictable: sort by FIPS code.
        counties.sort(key=lambda c: c["fips"])

        output_states.append(
            {
                "slug": slug,
                "name": state_name,
                "abbreviation": abbreviation,
                "customIntro": "",
                "formula": "",
                "faqs": [],
                "relatedTools": [],
                "countyCount": len(counties),
                "counties": counties,
            }
        )

    output = {
        "lastUpdated": "June 2026",
        "dataAsOf": "2024 (American Community Survey 1-year estimates)",
        "officialSourceUrl": "https://taxfoundation.org/data/all/state/property-taxes-by-state-county/",
        "officialSourceLabel": "Tax Foundation — Property Taxes by State and County, 2024",
        "secondarySourceUrl": "https://www.census.gov/programs-surveys/acs",
        "secondarySourceLabel": "U.S. Census Bureau — American Community Survey (underlying data, tables B25103, B25082, B25090)",
        "notes": {
            "medianEffectiveRate": (
                "The median effective property tax rate paid by owner-occupied "
                "households in this county, calculated as total real estate taxes "
                "paid divided by total home value (US Census Bureau, 2024 American "
                "Community Survey). This is an empirical median across actual "
                "homeowner-reported tax bills, not a statutory mill rate — it "
                "excludes property taxes paid by businesses, renters, and others, "
                "and actual bills vary by assessed value, exemptions, and local levies."
            ),
            "medianTaxPaid": (
                "Median annual property tax amount actually paid by owner-occupied "
                "households in this county, in dollars, per the 2024 ACS."
            ),
            "isFloorValue": (
                "When true, the Census/Tax Foundation data top-codes this county's "
                "median tax paid at $199, meaning the true figure is 'less than $200' "
                "rather than a precise number. Render as 'Less than $200', not '$199'."
            ),
            "pctChangeInflationAdjusted": (
                "Inflation-adjusted percent change in property taxes paid between "
                "2023 and 2024. Null when Tax Foundation reported the value as n/a, "
                "typically due to small sample sizes in low-population counties."
            ),
            "nullValues": (
                "A null medianTaxPaid, medianEffectiveRate, or "
                "pctChangeInflationAdjusted means Tax Foundation reported 'n/a' or "
                "no value for this county, generally due to small ACS sample sizes "
                "in low-population counties. Render as 'Data not available' rather "
                "than 0 or a blank."
            ),
            "districtOfColumbia": (
                "DC is reported as a single state-equivalent row in the source data, "
                "matching Tax Foundation's convention of excluding DC from state "
                "rankings while still reporting its figures."
            ),
        },
        "states": output_states,
    }

    output_json.parent.mkdir(parents=True, exist_ok=True)
    with output_json.open("w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)
        f.write("\n")

    total_counties = sum(s["countyCount"] for s in output_states)
    states_with_data = sum(1 for s in output_states if s["countyCount"] > 0)
    states_missing = [s["name"] for s in output_states if s["countyCount"] == 0]
    null_rate_counties = sum(
        1
        for s in output_states
        for c in s["counties"]
        if c["medianEffectiveRate"] is None
    )
    floor_counties = sum(
        1 for s in output_states for c in s["counties"] if c["isFloorValue"]
    )

    print(f"Parsed {row_count} county rows from CSV.")
    print(f"Wrote {total_counties} counties across {states_with_data} states/DC to {output_json}")
    print(f"Counties with null medianEffectiveRate (n/a in source): {null_rate_counties}")
    print(f"Counties at the $199 floor value: {floor_counties}")
    if states_missing:
        print(f"WARNING: states with zero counties in output: {states_missing}", file=sys.stderr)


if __name__ == "__main__":
    script_dir = Path(__file__).resolve().parent
    
    input_file = script_dir / "data-2024.csv"
    output_file = script_dir / "property-tax.json"    
    build(input_file, output_file)