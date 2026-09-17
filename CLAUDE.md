CLAUDE.md — simpletaxcalculator.app
This file is the source of truth for AI-assisted development on this project. Always read this before writing code, creating components, or suggesting architecture changes.

Related files:
- CONTENT.md — blog strategy, author assignment, SEO/content rules
- TEAM.md — team bios, roles, credentials, byline rules

Project overview
simpletaxcalculator.app is a US-focused tax calculator suite targeting ad revenue through high-RPM finance traffic. The business model is display ads (Ezoic → Mediavine) on high-intent tax tool pages. No user accounts, no database, no backend — all calculation logic runs in the browser.

Legal entity: Kobina AB (Sweden)
Target market: United States
Monetization: Display ads (AdSense → Journey by Mediavine at 1K sessions/mo → Mediavine at 50K sessions/mo)
Goal: $500/month in ad revenue within 12 months of launch

Tax types — current status
Sales Tax — LIVE, all 50 states
Gas Tax — LIVE, all 50 states
Capital Gains Tax — LIVE, all 50 states (added outside original roadmap, due to strong keyword fit)
Property Tax — IN PROGRESS. Branded "Property Tax Estimator," not "Calculator" (see Naming conventions below). Built on Tax Foundation county-level data (2024 ACS vintage). Not yet linked live on homepage.
Inheritance Tax — NEXT CANDIDATE. Strong fit: genuine state-by-state variance (only PA, NJ, KY, NE, MD, IA levy one), cheap "does my state have inheritance tax" pages for the other ~44 states, Easy KD on several state-level keywords (e.g. "inheritance tax california," "pa inheritance tax"). Fits existing state-hub architecture. IMPORTANT — no-tax state pages must not be thin "No, [state] doesn't have this" dead ends: each must cover federal estate tax exposure (applies regardless of state) and the cross-state scenario (inheriting from someone domiciled in a state that does levy inheritance tax, e.g. PA/NJ). This is a content requirement for launch, not a nice-to-have — build it into the page template/data shape from the start rather than retrofitting after a thin-content flag.

Original Phase 1 priority order (sales → property → inheritance → gas → self-employment) has been superseded by actual build order and keyword research above. Treat the list above as current, not the phase table further down, which is kept for historical city/state sequencing reference only.

Domain
Primary domain: simpletaxcalculator.app
TLD rationale: .app signals an interactive tool experience, not a blog.

URL structure — state/tax-type hierarchy, subfolders only, never subdomains:

simpletaxcalculator.app/ohio                         ← state hub (all Ohio tax tools)
simpletaxcalculator.app/ohio/sales-tax               ← state + tax-type page
simpletaxcalculator.app/ohio/property-tax
simpletaxcalculator.app/ohio/sales-tax/columbus      ← city page (phase 3)
simpletaxcalculator.app/sales-tax                    ← national pillar (tax-type level)
simpletaxcalculator.app/property-tax                 ← national pillar
Why state/tax-type and not tax-type/state: With multiple tax types live, the state hub at /ohio/ becomes a genuine authority page linking to every calculator available for that state. Users think geographically first. Google rewards topical depth per state. A /ohio/ hub with several spokes is a stronger signal than disconnected tax-type silos.

Compare States feature (planned)
simpletaxcalculator.app/compare/california-vs-texas       ← side-by-side state comparison

A side-by-side comparison page type, built from the same all-states JSON files (property-tax.json, gas-tax.json, capital-gains.json) already used by individual state pages — no new data sourcing required. Targets high-intent comparison queries (e.g. "moving from California to Texas taxes") that no current page type serves. Slug convention: /compare/[state-a]-vs-[state-b], alphabetical by slug to avoid duplicate permutations (california-vs-texas, never also texas-vs-california). Links to both states' individual hub pages to strengthen internal linking between state hubs.

URL slug convention — state name only, never keyword-stuffed: /ohio not /ohio-sales-tax-calculator The H1 and title tag carry the keyword signal. The slug serves the hierarchy.

Never use subdomains — ohio.simpletaxcalculator.app dilutes domain authority.

Naming conventions — "Calculator" vs "Estimator"
Use "Calculator" only for tax types with a deterministic, exact formula given clean inputs: Sales Tax, Gas Tax. Price × rate = exact tax owed; no judgment calls.

Use "Estimator" for tax types where the output is necessarily approximate — based on medians, averages, brackets, or assumptions rather than an exact statutory rate applied to a known input: Property Tax Estimator (median effective rate from Census ACS data, not a statutory mill rate — see CONTENT.md and property-tax.json notes for full rationale).

Apply this test going forward to any new tax type before naming it: if two people with identical inputs would get the same tax bill in reality, it's a Calculator. If the result is a reasonable estimate that could differ from an individual's actual bill (due to exemptions, brackets, local assessment, filing status, etc.), it's an Estimator. Capital Gains and Inheritance Tax should be evaluated against this test before their page titles are finalized — both involve assumptions (holding period, filing status, exemption thresholds, heir relationship class) that arguably make "Estimator" the more honest label. This has not yet been decided/applied retroactively to the live Capital Gains pages — flag for review.

The "Estimator" distinction must be carried consistently through: page H1, meta title, URL slug context, the shared TaxCalculator component's copy (button label, results phrasing), the FormulaExplainer's formula wording (e.g. "Median effective rate × home value ≈ estimated annual property tax," not "= tax owed"), and the DisclaimerBanner (which may need a tax-type-specific addendum explaining why the result is an estimate, not a generic disclaimer alone).

Tech stack
Layer	Choice	Notes
Framework	Next.js (App Router)	Same stack as mactools.pro and vorna.ai
Styling	Tailwind CSS v4	@theme {} in globals.css — no tailwind.config.ts
UI components	shadcn/ui	For base primitives only
Data layer	JSON — file structure depends on data density, see Data architecture below
Hosting	Vercel	Free tier sufficient initially
Analytics	Google Search Console + GA4	GSC is mandatory for pSEO feedback loop
Ads	AdSense → Journey by Mediavine → Mediavine	Journey requires only 1K sessions/mo — apply immediately at that threshold
CMS	None	No blog CMS. Content lives in JSON + MDX

Data architecture
Core rule: file structure is determined by data density per state, not by tax type as a category. This was implicit in early builds and is now explicit:

Per-state JSON files — use when content is editorial-heavy
One file per state, e.g. data/states/ohio.json. Used by: Sales Tax.
Each state's tax-type object contains rich, unique-per-state content: customIntro, multiple faqs, scenarios, taxFreeWeekends, relatedTools. A single state's sales-tax object can run 50-60+ lines. At scale across many tax types, a single master file would be unwieldy, and editorial content benefits from scoped git diffs (editing Ohio touches only ohio.json).

Single all-states JSON file — use when content is uniform/numeric
One file covering all states, e.g. data/gas-tax.json, data/capital-gains.json, data/property-tax.json. Used by: Gas Tax, Capital Gains Tax, Property Tax.
Per-state content here is mostly structured numeric data (rates, county tables) rather than unique prose. A single file keeps bulk data refreshes (e.g. re-importing an updated annual dataset) as one clean diff instead of needing merge logic across 50 files. Editorial fields (customIntro, faqs) can still exist per state inside this single file if they're being hand-written — the file is one JSON document, not one file per state — but the deciding factor is whether the data refreshes mechanically in bulk (single file) or is maintained by hand per state (per-state files).

When adding a new tax type, decide which pattern applies before writing any code. Ask: "If I get an updated dataset next year, am I re-importing into one file, or hand-editing many files?" That answer determines the structure.

Research pages — digital PR content type
/research/ pages are a distinct content type from tax-type pillar/state pages: standalone, data-driven pages built from existing all-states JSON files (property-tax.json, gas-tax.json, capital-gains.json) and packaged for outside pickup — local journalists, other finance sites, directories. Purpose is backlink acquisition, not direct search traffic. Examples: /research/most-expensive-property-tax-counties, /research/highest-gas-tax-states.

Rules:
- Built from data already in hand — no new data sourcing just for a research page.
- Each page needs a clear, pitchable headline finding (a ranking, a record, a year-over-year shift), not a generic restatement of the dataset.
- Lives at /research/[slug], outside the [state]/[taxType] hierarchy — these are not pSEO pages and shouldn't be treated as state-hub spokes.
- Must still link back into relevant /[state]/[taxType] pages to pass authority once it earns links.
- Author: Ray (data research, not interpretation — see CONTENT.md).


data/
  states/
    ohio.json                ← sales-tax data, per-state pattern
    arizona.json
    ...
  gas-tax.json                ← all-states pattern
  capital-gains.json          ← all-states pattern
  property-tax.json           ← all-states pattern
  meta/
    states-index.json         ← lightweight index: slug, name, abbreviation, available tax types
                                  used for route generation and state directory grids only
                                  never load full state files just to render a list
average_combined is abolished. Never add it back to state JSON files or the TaxTypeData interface. The county/city dropdown in TaxCalculator gives users the precise rate they need. Averages are misleading on a YMYL tool and serve no user need. The only place representative combined rates appear is the hardcoded comparison table on the national pillar pages, defined as constants in the page file itself.

Per-state file shape (sales tax pattern)
{
  "slug": "ohio",
  "name": "Ohio",
  "abbreviation": "OH",
  "taxTypes": {
    "sales-tax": {
      "customIntro": "...",
      "officialSourceUrl": "...",
      "officialSourceLabel": "...",
      "rates": {
        "state": 0.0575
      },
      "counties": [{ "name": "Franklin County (Columbus)", "rate": 0.075 }],
      "lastUpdated": "May 2026",
      "formula": "Price x 0.075 = sales tax owed",
      "example": { "price": 20000, "tax": 1500, "total": 21500 },
      "scenarios": [{ "label": "Used car purchase", "price": 12000, "tax": 900 }],
      "taxFreeWeekends": [{ "name": "...", "dates": "...", "items": "..." }],
      "faqs": [{ "question": "...", "answer": "..." }],
      "relatedTools": [{ "label": "...", "href": "..." }]
    }
  }
}
All-states file shape (gas tax / capital gains / property tax pattern)
{
  "lastUpdated": "June 2026",
  "dataAsOf": "...",                          // be explicit about vintage — see Data sourcing & vintage rules below
  "officialSourceUrl": "...",
  "officialSourceLabel": "...",
  "secondarySourceUrl": "...",                 // optional, e.g. underlying Census tables behind a third-party analysis
  "secondarySourceLabel": "...",
  "notes": {
    // per-field explanations of what each figure actually means — see Data sourcing & vintage rules
  },
  "states": [
    {
      "slug": "alabama",
      "name": "Alabama",
      "abbreviation": "AL",
      "customIntro": "...",                    // can still be hand-written even in an all-states file
      "formula": "...",
      "faqs": [...],
      "relatedTools": [...],
      "counties": [
        { "fips": "01001", "name": "Autauga County", /* ...numeric fields... */ }
      ]
    }
  ]
}
states-index.json shape
[
  {
    "slug": "ohio",
    "name": "Ohio",
    "abbreviation": "OH",
    "availableTaxTypes": ["sales-tax"]
  }
]
availableTaxTypes drives route generation and the state hub page. Never list a tax type as available if the data object is incomplete.

Data sourcing & vintage rules
Learned from the Property Tax Estimator build — apply to all future datasets:

1. Always state the data's actual vintage explicitly, and distinguish it from the publish/lastUpdated date. dataAsOf is when the underlying survey/data was collected (e.g. "2024 (American Community Survey 1-year estimates)"); lastUpdated is when this file/page was last touched. These are never the same thing for derived datasets and both must be shown to the user — burying the real vintage in a footnote while a page title implies the current year is a YMYL accuracy risk.

2. Trace the full sourcing chain, not just the immediate source. If a dataset is "Tax Foundation analysis of Census ACS data," cite both — the primary data source (Census, specific table IDs if known) and the organization that compiled/calculated it. The /editorial-policy page and any officialSourceLabel field should reflect the full chain.

3. Distinguish statutory rates from empirical/derived rates explicitly in the notes object. A statutory rate (sales tax, gas tax excise rate) is exact and deterministic. An empirical rate (property tax median effective rate = total taxes paid / total home value, from survey data) is a real-world average that will differ from any individual's actual bill. This distinction drives the Calculator vs Estimator naming decision above and must be spelled out in plain language in the relevant notes.medianEffectiveRate-style field, not just implied.

4. Handle data quality artifacts explicitly, don't silently round or drop them:
   - Top-coded/floor values (e.g. Census suppressing precise figures below a threshold, like the $199 property tax floor meaning "less than $200") — flag with a boolean (isFloorValue) and render distinct copy, never the literal floor number as if precise.
   - Missing values (n/a, due to small sample sizes in low-population counties) — store as null, render as "Data not available," never as 0 or blank.
   - IDs that look numeric but aren't (FIPS codes) — always store and handle as zero-padded strings, never cast to int/number, or leading zeros are silently lost.

5. Before publishing any blog or page content tied to a dataset, check whether a newer version of that dataset actually exists (e.g. Census ACS releases on a predictable annual schedule — 1-year estimates roughly each September for the prior year, 5-year estimates each December). Don't assume "this is the latest" without checking; do assume the data is at least several months old by the time any annual survey-based dataset is publicly available.

6. lastUpdated and lastAudited are different claims and must not be conflated. lastUpdated (per file/page) means the data values changed. lastAudited means the data was checked against the source and confirmed still accurate, whether or not anything changed. Maintain a global lastAudited.json keyed by state/tax-type, updated every quarterly audit regardless of whether rates moved. UI copy should say "Rates verified accurate as of [lastAudited date]" rather than tying user-facing freshness language strictly to lastUpdated, which can go stale-looking even when the underlying rate is still correct.

App router file structure
app/
  layout.tsx
  page.tsx                              ← homepage
  globals.css
  sitemap.ts                            ← auto-generated
  [state]/
    page.tsx                            ← state hub
    [taxType]/
      page.tsx                          ← calculator/estimator page
      [city]/
        page.tsx                        ← city page (phase 3)
  sales-tax/
    page.tsx                            ← national pillar
  property-tax/
    page.tsx
  capital-gains/
    page.tsx
  gas-tax/
    page.tsx
  inheritance-tax/
    page.tsx                            ← planned, see Tax types — current status
  self-employment-tax/
    page.tsx                            ← planned as single standalone page, see Tax types — current status

components/
  layout/
    Navbar.tsx
    Footer.tsx
    ToolPageLayout.tsx
  tax/
    TaxCalculator.tsx                   ← shared component; needs variant prop for Calculator vs Estimator copy (see Naming conventions)
    DisclaimerBanner.tsx
    LastUpdatedBadge.tsx
    FormulaExplainer.tsx
    RateTable.tsx
    ExampleScenarios.tsx
    TaxFreeWeekends.tsx
    FaqAccordion.tsx
    RelatedTools.tsx

data/
  states/
    ohio.json                           ← per-state pattern (sales tax)
    arizona.json
    pennsylvania.json
    florida.json
    texas.json
    california.json
    ... (all 50 states)
  gas-tax.json                          ← all-states pattern
  capital-gains.json                    ← all-states pattern
  property-tax.json                     ← all-states pattern
  meta/
    states-index.json

lib/
  types.ts
  rates.ts                              ← getStateData(), getTaxTypeData(), getAllStates()
  schema.ts
  metadata.ts

scripts/
  build_property_tax_json.py            ← converts Tax Foundation CSV → property-tax.json

public/
  favicon-*.png
  apple-touch-icon.png
  og-image.png
  robots.txt
TypeScript interfaces
// lib/types.ts

export interface StateMeta {
  slug: string
  name: string
  abbreviation: string
  availableTaxTypes: string[]
}

export interface TaxTypeData {
  // injected by lib/rates.ts — not stored in JSON
  stateName: string
  stateSlug: string
  taxType: string
  // stored in JSON
  customIntro: string
  rates: { state: number }                      // state-only rate — no average_combined. For non-statutory tax types (e.g. property tax), use a clearly-named field instead (e.g. medianEffectiveRate), never reuse `rates.state` for a different meaning.
  counties: { name: string; rate: number }[]
  lastUpdated: string
  formula: string
  example: { price: number; tax: number; total: number }
  scenarios: { label: string; price: number; tax: number }[]
  taxFreeWeekends: { name: string; dates: string; items: string }[]
  faqs: { question: string; answer: string }[]
  relatedTools: { label: string; href: string }[]
}

export interface StateFile {
  slug: string
  name: string
  abbreviation: string
  taxTypes: Record<string, Omit<TaxTypeData, 'stateName' | 'stateSlug' | 'taxType'>>
}
Component architecture
Core principle
Every section of a tool page is a standalone reusable component accepting props. State pages are pure compositions of components fed by state JSON data. No business logic in page files — pages are layouts, components are logic. Same components render for national pillar pages and state-specific pages, regardless of whether the tax type is a Calculator or an Estimator (see Naming conventions for how that distinction is carried as props/copy, not as separate components).

Page template
// app/[state]/[taxType]/page.tsx
export default async function StateTaxPage({ params }) {
  const { state, taxType } = await params
  const data = getTaxTypeData(state, taxType)
  if (!data) notFound()

  return (
    <ToolPageLayout>
      <TaxCalculator rates={data.rates} counties={data.counties}
                     stateName={data.stateName} lastUpdated={data.lastUpdated} />
      <DisclaimerBanner lastUpdated={data.lastUpdated} />
      <FormulaExplainer formula={data.formula} example={data.example} />
      <RateTable rows={data.counties} caption={`${data.stateName} county rates`} />
      <ExampleScenarios scenarios={data.scenarios} stateName={data.stateName} />
      <TaxFreeWeekends stateName={data.stateName} events={data.taxFreeWeekends} />
      <FaqAccordion faqs={data.faqs} />
      <RelatedTools links={data.relatedTools} />
    </ToolPageLayout>
  )
}
State hub pattern
// app/[state]/page.tsx
// Shows all available tax tools for this state
// Each availableTaxType renders as a card linking to /[state]/[taxType]
SEO strategy
YMYL compliance (non-negotiable)
Every tool page must include:

DisclaimerBanner immediately below calculator — never in footer
lastUpdated near the Calculate button ("Rates updated for May 2026")
Schema: FAQPage + WebApplication on every page
Disclaimer copy (use exactly):

This calculator is for informational purposes only and does not constitute tax advice. Consult a qualified tax professional for your specific situation.

For Estimator-type pages (see Naming conventions), consider a tax-type-specific addendum to this disclaimer explaining why the figure is an estimate (e.g. based on county median data, not a statutory rate) — the generic disclaimer alone doesn't convey the specific reason results may differ from an individual's actual bill.

Trust pages (required before launch)
/about — founder name, bio, rate verification methodology: "We audit all rates quarterly against official state Department of Revenue websites and update within 48 hours of any published change." Should also reflect founder framing accurately — see TEAM.md.

/editorial-policy — sources, update frequency, correction policy. Must reflect full sourcing chains per Data sourcing & vintage rules above (e.g. "U.S. Census Bureau (American Community Survey) via Tax Foundation analysis," not just the secondary source alone).

JSON-LD schema
// WebApplication
{ "@type": "WebApplication", "applicationCategory": "FinanceApplication",
  "operatingSystem": "All", "offers": { "@type": "Offer", "price": "0" } }

// FAQPage — generated from faqs[] array in state JSON
Dynamic sitemap
app/sitemap.ts reads states-index.json and generates:

/[state] for every state in the index
/[state]/[taxType] for every availableTaxType per state
Backlink strategy — pSEO ceiling and the blog's role
pSEO alone is sufficient to reach Journey by Mediavine (1K sessions/mo) by capturing low-competition long-tail and county/city-level queries, where domain authority matters less. It is likely NOT sufficient on its own to reach 50K sessions/mo against established competitors (TaxJar, Avalara, SmartAsset, NerdWallet, Calculator.net) on head-term keywords, because calculator/tool pages structurally don't earn backlinks — nobody links to a calculator. The blog exists specifically to earn the backlinks that raise domain authority and lift pSEO pages out of position 50-90 territory. Full blog strategy, author assignment, and content rules live in CONTENT.md — read it before planning or writing any blog content.

National pillar URLs
Phase 1 — National pillars (months 1–2)
Page	URL	Target keyword
Sales Tax	/sales-tax	sales tax calculator
Property Tax	/property-tax	property tax calculator
Gas Tax	/gas-tax	gas tax by state
Capital Gains Tax	/capital-gains	capital gains tax calculator
Inheritance Tax	/inheritance-tax	inheritance tax calculator (planned)
Self-Employment Tax	/self-employment-tax	self employment tax calculator (planned, single page — see Tax types — current status)
Phase 2 — State clusters (months 3–6)
State	KD	Volume	Notes
Ohio	Easy	>10,000	Best ratio — launch first
Arizona	Medium	>1,000	Easy city-level keywords
Pennsylvania	Easy	>1,000	Low competition; also a real inheritance-tax state — overlap opportunity for cross-linking
Missouri	Medium	>1,000	791 keyword ideas
Florida	Hard	>10,000	After DR established
Texas	Hard	>10,000	After DR established
California	Hard	>10,000	Phase 3 only
Keywords to target: [state] [tax type], [state] [tax type] calculator, [state] [tax type] rate, [state] [tax type] by county, [state] tax free weekend

Keywords to avoid: login, registration, filing, exemption form — government process keywords with high bounce, poor monetization.

Meta title: [State] Sales Tax Calculator 2026 — simpletaxcalculator.app
Meta description: Calculate [State] sales tax instantly. Includes county rates, real examples, and [State]'s [X]% average combined rate. Rates updated for May 2026.

Phase 3 — City pages (months 7–12)
/ohio/sales-tax/columbus
/ohio/sales-tax/cleveland
/arizona/sales-tax/phoenix
Build only for Easy KD city keywords confirmed in Ahrefs. Note: true city/county-level precision is also the main gap in the current Property Tax Estimator (Tax Foundation data is county-level only) — county pages may need to ship before true city pages for property tax specifically.

Internal linking rules
[state]/[taxType] links to /[state] hub and /[taxType] national pillar
State hub links to all available tax types for that state
RelatedTools links to geographically logical neighboring states
Never orphan a page — every page reachable within 2 clicks from homepage
Blog posts must link to relevant calculator/estimator pages, and calculator pages should link back to relevant blog posts once published — see CONTENT.md for specifics
Ad placement strategy
Placement	Unit	Notes
Above tool	Leaderboard (728×90)	Desktop only
Below disclaimer	Rectangle (300×250)	Near tool
Sticky sidebar	Sticky (300×600)	Desktop only
Below FAQ	Rectangle (300×250)	End of content
Mobile interstitial	Avoid	Google penalty risk on YMYL
Do not place ads above the calculator on mobile.

## Home Affordability Estimator — NEW

### What this is
Per-county "how much house can I afford" pages, built as long-tail spokes off
county-level home value data (Zillow ZHVI). Deliberately **not** a single
general affordability calculator — that's a saturated, off-topic vertical
(Zillow, Bankrate, NerdWallet, SmartAsset) where a new site has no DA
advantage. This follows the same long-tail logic already proven by the
state/tax-type pSEO strategy, at county granularity, using data that's
natively county-level with no synthetic step required.

Naming: **Estimator**, not Calculator (see Naming conventions above). The
result depends on stated assumptions (mortgage rate, down payment, DTI
ratio, insurance, PMI), so it fails the "identical inputs → identical
real-world bill" test outright.

### Core model: income in, price out
The page must answer the keyword it targets. "How much house can I afford"
means income is the input and home price is the output — not the reverse.

**MVP scope boundary — state this explicitly so it doesn't drift:**
No debt-to-income input in MVP. The 28% ratio is applied to gross household
income only, as a simplified housing-cost rule of thumb. Existing debts
(car loans, student loans, credit cards, etc.) are not modeled. Do not add
a debt input without a deliberate scope decision — this is exactly the kind
of "obviously we should add X" creep that turns an estimator into a full
mortgage calculator one field at a time.

**The equation.** Let:
```
P = home price (unknown, solving for this)
D = down payment %          (0.20 or 0.10)
r = annual mortgage rate    (from mortgage-assumptions.json)
T = county effective property-tax rate (from property-tax.json)
I = insurance assumption %  (from mortgage-assumptions.json)
M = PMI assumption % of loan amount, applied only when D < 0.20
A = annual household income (user input)
d = DTI ratio = 0.28
```
Monthly costs, all proportional to P or to the loan amount P×(1−D):
```
monthly P&I        = P × (1 − D) × mortgageFactor(r, 30yr)
monthly tax         = P × T / 12
monthly insurance   = P × I / 12
monthly PMI         = P × (1 − D) × M / 12     (only if D < 0.20)
```
Setting total monthly housing cost equal to the monthly housing budget:
```
A × d / 12 = P × [ (1 − D) × mortgageFactor + T/12 + I/12 + (1 − D) × M/12 ]
```
This is linear in P, so **solve algebraically** — divide both sides by the
bracketed coefficient to get P directly. Do not implement an iterative
solver for the MVP; the cost components are all proportional to price, so
there's nothing to iterate. Only revisit this if a future assumption
introduces genuine non-linearity (e.g., tiered PMI rates by LTV band) —
note that possibility here so a future session doesn't need to rediscover
it, but don't build for it now.

Then estimated affordable home price = P from the equation above, and
estimated monthly payment = A × d / 12 (by construction).

**Secondary calculation (the ZHVI benchmark):** run the same cost formula
forward (not solving for P — P is already known, it's the county's ZHVI
value) to answer "what income would a household need for the typical home
here":
```
monthly housing cost for ZHVI value = ZHVI × [(1−D)×mortgageFactor + T/12 + I/12 + (1−D)×M/12]
required annual income = monthly housing cost × 12 / d
```
ZHVI is a **benchmark for comparison, never an input to the primary
affordability calculation.** This was the fundamental fix from the first
draft — previously ZHVI drove the calculation and income was absent
entirely, which didn't match the search intent the page targets. Keep this
as a stated architectural decision, not just an implementation detail.

Together, one page produces:
- estimated affordable home price (from user's income)
- county typical home value (ZHVI)
- difference and % above/below
- income needed for the typical home
- estimated monthly payment, both for the user's estimate and for the
  typical home
- effective property tax rate used
- 1-year / 5-year ZHVI change

That's several independently derived, genuinely county-specific facts per
page, not just one number with the county name swapped in — the real
argument for defensibility at ~3,000 pages, stronger than "different
numbers per page" alone.

### Differentiator vs. competitors
`property-tax.json` already has a real per-county effective rate, joined by
FIPS, instead of a single national assumption. **Don't claim this makes the
estimator "more accurate than Bankrate/NerdWallet/SmartAsset"** — that's an
unverified comparative claim about how competitors' calculators actually
work internally. The defensible framing: this gives the estimator a
county-specific property-tax input rather than a national-average
assumption, which makes the property-tax component more geographically
specific — and creates a strong internal-link opportunity back to
`/[state]/[county]/property-tax`.

### URL structure
```
/[state]/home-affordability            ← state pillar (mirrors other tax-type pillars)
/[state]/home-affordability/[county]   ← long-tail spoke (mirrors planned city-page pattern)
```
Target keywords: "home affordability [county]", "how much house can I afford
in [county]", "income needed to buy a house in [county]".

**Open item before finalizing page copy:** verify actual SERP intent for
these terms on a sample of counties (calculator-intent vs. purely
informational) rather than assuming the conventional affordability-tool
shape matches search intent everywhere.

### Data architecture
Three separate files — different sources, different refresh cadences,
consistent with the existing per-file decision rule.

**`data/home-values.json` — ZHVI benchmark data.** All-states pattern
(uniform/numeric). Source: Zillow Research, ZHVI (smoothed, seasonally
adjusted, all-home mid-tier, 35th–65th percentile "typical home value" —
state this precisely, it is not literally the median). Free for public use
with clear attribution required per Zillow's published research-data
terms — looser than Zillow's listings/API/MLS terms, don't conflate them.
```json
{
  "dataAsOf": "2026-08-31",
  "officialSourceUrl": "https://www.zillow.com/research/data/",
  "officialSourceLabel": "Zillow Research (ZHVI, smoothed, seasonally adjusted)",
  "counties": [
    {
      "fips": "39049",
      "sizeRank": 123,
      "name": "Franklin County",
      "stateSlug": "ohio",
      "latestValue": 268400,
      "oneYearAgoValue": 254100,
      "oneYearChangePct": 0.0563,
      "fiveYearAgoValue": 198700,
      "fiveYearChangePct": 0.3508
    }
  ]
}
```
Keep `sizeRank` — it's free from the source CSV and is the rollout-phasing
signal below; don't discard it during conversion. Never ship the full 300+
column monthly time series into this file — compute the fields above at
build time and discard the rest. Missing counties (~72 of 3,143 — no Zillow
coverage) → `null`, render as "Data not available," never `0`.

**`data/mortgage-assumptions.json`** — small, global, not per-county.
Refreshed monthly; `dataAsOf` must name the specific week's rate.
```json
{
  "rate": 0.0665,
  "rateSource": "Freddie Mac PMMS, 30-year fixed, national average",
  "rateSourceUrl": "https://www.freddiemac.com/pmms",
  "dataAsOf": "2026-09-11",
  "lastUpdated": "2026-09-16",
  "insuranceAssumptionPct": 0.0035,
  "insuranceAssumptionLabel": "Estimated at 0.35% of home value annually — a national assumption, not county-specific. Actual premiums vary by location, coverage, and deductible.",
  "pmiAssumptionPct": 0.006,
  "pmiAssumptionLabel": "PMI assumption: 0.6% of loan amount annually, applied only when down payment is below 20%. A national simplifying assumption; actual PMI varies by loan-to-value ratio, lender, and credit profile. Do not extrapolate this rate to down payment options beyond the 20%/10% toggle.",
  "downPaymentOptionsPct": [0.20, 0.10],
  "dtiRatio": 0.28
}
```
Add an entry to the existing `lastAudited.json` mechanism alongside tax
rates.

**`meta/home-affordability-counties-index.json`** — lightweight index (fips,
sizeRank, slug, name, state) for route generation only. Never load the full
`home-values.json` just to render a list.

### Component architecture
Keep the pure-math component ignorant of Zillow entirely — it should not
know what ZHVI is:

```
HomeAffordabilityCalculator   (pure math: solves the equation above in
                                both directions — income → price, and
                                price → required income)
        ↓
CountyAffordabilityContent    (page-level: calls the calculator twice —
                                once for user input, once for the county's
                                ZHVI value — and merges in property-tax rate,
                                ZHVI 1yr/5yr change, and the benchmark
                                comparison)
```
This preserves the existing "components are logic, pages are layout"
principle — the first draft violated it by letting the calculator component
know about Zillow directly.

### Page content plan
```
H1: How Much House Can I Afford in Franklin County, Ohio?

Home Affordability Estimator
  Annual household income: [input]
  Down payment: 20% / 10% [toggle]
  Mortgage rate assumption: 6.65% — Freddie Mac PMMS, September 11, 2026
  Estimated property tax: based on Franklin County's 1.53% effective rate
  Insurance assumption: 0.35% of home value/year (national assumption)
  PMI assumption: 0.6% of loan amount/year — shown only if down payment < 20%

  → Estimated affordable home price: $XXX,XXX
  → Estimated monthly payment: $X,XXX

Compared with the county's typical home value
  Typical home value (Zillow ZHVI): $268,400
  1-year change: +5.6%   5-year change: +35.1%
  Your estimated affordable home price is $XX,XXX [below/above] the
  county's typical home value.

What income is needed for a typical Franklin County home?
  Based on the same assumptions, a household would need approximately
  $XX,XXX in annual income to support the typical $268,400 home at a 28%
  housing-cost ratio.

Franklin County property taxes
  Effective property tax rate: 1.53% [link to /ohio/property-tax page]

How we estimate this
  Show the actual equation, per the existing formula-section rule. State
  the 28% ratio explicitly as a rule-of-thumb assumption, not an
  underwriting model — it doesn't account for other debt, credit score,
  HOA, utilities, maintenance, or lender-specific DTI requirements. State
  the MVP scope boundary (no debt input) here too.
```

### Wording rules (YMYL)
- "Estimated affordable home price," never "you can afford $X" — the 28%
  ratio is a rule-of-thumb, not a lending decision.
- Never frame the ZHVI comparison as an affordability threshold — "Compared
  with the county's typical home value" / "your estimate is $X below/above,"
  not language implying the Zillow figure is what the user should target.
- "Mortgage rate assumption: 6.65% — Freddie Mac PMMS, September 11, 2026,"
  never "today's rate" or "current rate."
- "Estimated property tax: based on the county's effective rate," never a
  bare "Property tax: $X."
- "PMI assumption: 0.6% of loan amount annually," never bare "PMI: $X" —
  don't let the simplifying assumption read as the borrower's actual PMI.
- Insurance and PMI assumptions must carry their `*AssumptionLabel` text
  on-page, not just exist in the JSON.

### Rollout phasing (batched, with a concrete demand threshold)
`sizeRank` is a phasing signal, not a demand signal.
1. Batch 1: top ~50 counties by `sizeRank` that also have a live
   `/[state]/property-tax` page (maximizes internal-link synergy).
2. Validate at the batch level, not county-by-county: confirm the target
   keyword pattern clears a minimum search-volume threshold across the
   batch — **team to set the actual number** before this ships; don't leave
   "meaningful demand" undefined, or the gate becomes a rubber stamp.
3. Individually re-check any county in the batch that trips one of these
   flags, rather than every county: unusually small population, an
   ambiguous or dominant-unrelated-meaning SERP, or search volume close to
   the threshold in either direction.
4. Publish batch 1, then repeat steps 2–3 for the next ~50–100, working
   outward by `sizeRank`.
5. Hold or skip the lowest-population tail — negligible search volume
   expected, same reasoning as not building unvalidated city pages.

### What not to build (this feature)
- ❌ A single national/generic affordability calculator.
- ❌ Using ZHVI as the primary calculation input — income must drive the
  primary output; ZHVI is the comparison benchmark only.
- ❌ A debt-to-income input in MVP — see the explicit scope boundary above.
- ❌ A 10%-down scenario with no PMI accounted for.
- ❌ Custom down payment entry beyond the 20%/10% toggle.
- ❌ Extrapolating the PMI assumption to any down payment option beyond
  20%/10%.
- ❌ Publishing a batch without a defined, agreed search-volume threshold —
  "meaningful demand" is not itself a threshold.
- ❌ An unsourced or hand-picked mortgage rate — must be Freddie Mac PMMS (or
  equivalent citable source) with an explicit `dataAsOf`.
- ❌ Any comparative accuracy claim against named competitors.
- ❌ Page copy implying the mortgage rate, insurance, or PMI figures are
  live or county-specific when they are fixed national assumptions.

Performance requirements
Calculator/estimator interactive within 1 second of page load
All rate data static JSON — no API calls on page load
No third-party scripts except AdSense, GA4, Google Fonts
Core Web Vitals all green on PageSpeed Insights
Content quality rules
customIntro is unique per state per tax type — empty string is a deploy blocker
Formula section shows the actual math (and is phrased as "≈ estimated" rather than "= owed" for Estimator-type tax types — see Naming conventions)
FAQ questions sourced from "People Also Ask" for that keyword
County tables need at least 5 rows — check this against real data before launch for any tax type with small-sample null values (e.g. property tax counties with no reported data); a state with too many missing-data counties may not meet this minimum
Scenarios use realistic prices for that state's context
What not to build (year 1)
❌ Income tax — brackets + filing status = too complex
❌ User accounts or saved calculations
❌ Backend API for rates — flat JSON only
❌ Email capture or newsletter
❌ Social sharing features
❌ Subdomains
❌ Master cross-state aggregate JSON files for editorial-heavy tax types (per-state files stay per-state — see Data architecture)
❌ 50 near-duplicate state pages for tax types with no real state variance (e.g. self-employment tax — ship as one national page instead)

Last updated: June 2026
Project owner: Saeed Davari, Technical Architect & Founder (Kobina AB) — see TEAM.md
