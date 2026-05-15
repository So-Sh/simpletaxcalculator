# CLAUDE.md — simpletaxcalculator.app

This file is the source of truth for AI-assisted development on this project.
Always read this before writing code, creating components, or suggesting architecture changes.

---

## Project overview

**simpletaxcalculator.app** is a US-focused tax calculator suite targeting ad revenue through
high-RPM finance traffic. The business model is display ads (Ezoic → Mediavine) on high-intent
tax tool pages. No user accounts, no database, no backend — all calculation logic runs in the browser.

**Legal entity:** Kobina AB (Sweden)  
**Target market:** United States  
**Monetization:** Display ads (AdSense → Journey by Mediavine at 1K sessions/mo → Mediavine at 50K sessions/mo)  
**Goal:** $500/month in ad revenue within 12 months of launch

**Planned tax types (in priority order):**
1. Sales Tax — launched first, most state coverage
2. Property Tax — high search volume, math is public
3. Inheritance Tax — niche, high fear-factor, high intent
4. Gas Tax — viral potential when gas prices spike
5. Self-Employment Tax — high intent, small business audience

---

## Domain

**Primary domain:** `simpletaxcalculator.app`  
**TLD rationale:** `.app` signals an interactive tool experience, not a blog.

**URL structure — state/tax-type hierarchy, subfolders only, never subdomains:**
```
simpletaxcalculator.app/ohio                         ← state hub (all Ohio tax tools)
simpletaxcalculator.app/ohio/sales-tax               ← state + tax-type page
simpletaxcalculator.app/ohio/property-tax
simpletaxcalculator.app/ohio/sales-tax/columbus      ← city page (phase 3)
simpletaxcalculator.app/sales-tax                    ← national pillar (tax-type level)
simpletaxcalculator.app/property-tax                 ← national pillar
```

**Why state/tax-type and not tax-type/state:**
With 5 tax types planned, the state hub at `/ohio/` becomes a genuine authority page linking
to 5 calculators. Users think geographically first. Google rewards topical depth per state.
A `/ohio/` hub with 5 spokes is a stronger signal than 5 disconnected tax-type silos.

**URL slug convention — state name only, never keyword-stuffed:**
`/ohio` not `/ohio-sales-tax-calculator`
The H1 and title tag carry the keyword signal. The slug serves the hierarchy.

Never use subdomains — `ohio.simpletaxcalculator.app` dilutes domain authority.

---

## Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js (App Router) | Same stack as mactools.pro and vorna.ai |
| Styling | Tailwind CSS v4 | `@theme {}` in globals.css — no tailwind.config.ts |
| UI components | shadcn/ui | For base primitives only |
| Data layer | Per-state JSON files | One file per state in `/data/states/` |
| Hosting | Vercel | Free tier sufficient initially |
| Analytics | Google Search Console + GA4 | GSC is mandatory for pSEO feedback loop |
| Ads | AdSense → Journey by Mediavine → Mediavine | Journey requires only 1K sessions/mo — apply immediately at that threshold |
| CMS | None | No blog CMS. Content lives in JSON + MDX |

---

## Data architecture

### Per-state JSON files — one file per state

```
data/
  states/
    ohio.json           ← all tax type data for Ohio
    arizona.json
    pennsylvania.json
    florida.json
    texas.json
    california.json
  meta/
    states-index.json   ← lightweight index: slug, name, abbreviation, available tax types
                           used for route generation and state directory grids only
                           never load full state files just to render a list
```

**Why per-state files:**
- Editing Ohio rates touches only `ohio.json` — no risk of corrupting other states
- Git diffs are scoped and readable
- Maps naturally to the `[state]/[taxType]` route — load one file per page render
- Adding a new tax type to Ohio = add one object to `ohio.json`
- At 5 tax types x 51 states, a single master JSON would be thousands of lines

**Never create a master cross-state aggregate JSON file.**
Aggregation across states happens in `lib/rates.ts` at build time by reading the index.

### State file shape

```json
{
  "slug": "ohio",
  "name": "Ohio",
  "abbreviation": "OH",
  "taxTypes": {
    "sales-tax": {
      "customIntro": "...",
      "rates": {
        "state": 0.0575,
        "average_combined": 0.0722
      },
      "counties": [{ "name": "Franklin County (Columbus)", "rate": 0.075 }],
      "lastUpdated": "May 2026",
      "formula": "Price x 0.075 = sales tax owed",
      "example": { "price": 20000, "tax": 1500, "total": 21500 },
      "scenarios": [{ "label": "Used car purchase", "price": 12000, "tax": 900 }],
      "taxFreeWeekends": [{ "name": "...", "dates": "...", "items": "..." }],
      "faqs": [{ "question": "...", "answer": "..." }],
      "relatedTools": [{ "label": "...", "href": "..." }]
    },
    "property-tax": {
    }
  }
}
```

### states-index.json shape

```json
[
  {
    "slug": "ohio",
    "name": "Ohio",
    "abbreviation": "OH",
    "availableTaxTypes": ["sales-tax"]
  }
]
```

`availableTaxTypes` drives route generation and the state hub page.
Never list a tax type as available if the data object is incomplete.

---

## Color system & theme

**Palette: Modern Fintech — Mint & Charcoal**

| Token | Hex | Usage |
|---|---|---|
| `--color-primary` | `#2D3142` | Headings, navbar, footer |
| `--color-accent` | `#06D6A0` | CTA buttons (Calculate), highlights, links |
| `--color-bg` | `#F8F9FA` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, tool containers |
| `--color-body` | `#1a1a1a` | Body text (softer than full charcoal) |
| `--color-muted` | `#6B7280` | Labels, disclaimers, secondary text |
| `--color-border` | `#E5E7EB` | Input borders, dividers |

Defined in `app/globals.css` under `@theme {}` — Tailwind v4 syntax.

**Design principles:**
- Tool always above the fold — no hero text before the calculator
- White surface cards on light gray background
- Mint accent used exclusively for primary CTAs and positive value displays
- No gradients, no decorative illustrations
- Mobile-first — majority of tax tool traffic is mobile
- Never use font sizes below 13px

---

## App router file structure

```
app/
  layout.tsx
  page.tsx                              ← homepage
  globals.css
  sitemap.ts                            ← auto-generated
  [state]/
    page.tsx                            ← state hub
    [taxType]/
      page.tsx                          ← calculator page
      [city]/
        page.tsx                        ← city page (phase 3)
  sales-tax/
    page.tsx                            ← national pillar
  property-tax/
    page.tsx
  inheritance-tax/
    page.tsx
  gas-tax/
    page.tsx
  self-employment-tax/
    page.tsx

components/
  layout/
    Navbar.tsx
    Footer.tsx
    ToolPageLayout.tsx
  tax/
    TaxCalculator.tsx
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
    ohio.json
    arizona.json
    pennsylvania.json
    florida.json
    texas.json
    california.json
  meta/
    states-index.json

lib/
  types.ts
  rates.ts                              ← getStateData(), getTaxTypeData(), getAllStates()
  schema.ts
  metadata.ts

public/
  favicon-*.png
  apple-touch-icon.png
  og-image.png
  robots.txt
```

---

## TypeScript interfaces

```ts
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
  rates: { state: number; average_combined: number }
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
```

---

## Component architecture

### Core principle
Every section of a tool page is a standalone reusable component accepting props.
State pages are pure compositions of components fed by state JSON data.
No business logic in page files — pages are layouts, components are logic.
Same components render for national pillar pages and state-specific pages.

### Page template

```tsx
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
```

### State hub pattern

```tsx
// app/[state]/page.tsx
// Shows all available tax tools for this state
// Each availableTaxType renders as a card linking to /[state]/[taxType]
```

---

## SEO strategy

### YMYL compliance (non-negotiable)

Every tool page must include:
1. `DisclaimerBanner` immediately below calculator — never in footer
2. `lastUpdated` near the Calculate button ("Rates updated for May 2026")
3. Schema: `FAQPage` + `WebApplication` on every page

Disclaimer copy (use exactly):
> This calculator is for informational purposes only and does not constitute tax advice.
> Consult a qualified tax professional for your specific situation.

### Trust pages (required before launch)

**`/about`** — founder name, bio, rate verification methodology:
"We audit all rates quarterly against official state Department of Revenue websites
and update within 48 hours of any published change."

**`/editorial-policy`** — sources, update frequency, correction policy.

### JSON-LD schema

```ts
// WebApplication
{ "@type": "WebApplication", "applicationCategory": "FinanceApplication",
  "operatingSystem": "All", "offers": { "@type": "Offer", "price": "0" } }

// FAQPage — generated from faqs[] array in state JSON
```

### Dynamic sitemap

`app/sitemap.ts` reads `states-index.json` and generates:
- `/[state]` for every state in the index
- `/[state]/[taxType]` for every availableTaxType per state
- National pillar URLs

### Phase 1 — National pillars (months 1–2)

| Page | URL | Target keyword |
|---|---|---|
| Sales Tax | `/sales-tax` | sales tax calculator |
| Property Tax | `/property-tax` | property tax calculator |
| Inheritance Tax | `/inheritance-tax` | inheritance tax calculator |
| Gas Tax | `/gas-tax` | gas tax by state |
| Self-Employment Tax | `/self-employment-tax` | self employment tax calculator |

### Phase 2 — State clusters (months 3–6)

| State | KD | Volume | Notes |
|---|---|---|---|
| Ohio | Easy | >10,000 | Best ratio — launch first |
| Arizona | Medium | >1,000 | Easy city-level keywords |
| Pennsylvania | Easy | >1,000 | Low competition |
| Missouri | Medium | >1,000 | 791 keyword ideas |
| Florida | Hard | >10,000 | After DR established |
| Texas | Hard | >10,000 | After DR established |
| California | Hard | >10,000 | Phase 3 only |

**Keywords to target:** `[state] [tax type]`, `[state] [tax type] calculator`,
`[state] [tax type] rate`, `[state] [tax type] by county`, `[state] tax free weekend`

**Keywords to avoid:** login, registration, filing, exemption form — government process
keywords with high bounce, poor monetization.

**Meta title:** `[State] Sales Tax Calculator 2026 — simpletaxcalculator.app`  
**Meta description:** `Calculate [State] sales tax instantly. Includes county rates,
real examples, and [State]'s [X]% average combined rate. Rates updated for May 2026.`

### Phase 3 — City pages (months 7–12)

```
/ohio/sales-tax/columbus
/ohio/sales-tax/cleveland
/arizona/sales-tax/phoenix
```

Build only for Easy KD city keywords confirmed in Ahrefs.

### Internal linking rules

- `[state]/[taxType]` links to `/[state]` hub and `/[taxType]` national pillar
- State hub links to all available tax types for that state
- `RelatedTools` links to geographically logical neighboring states
- Never orphan a page — every page reachable within 2 clicks from homepage

---

## Ad placement strategy

| Placement | Unit | Notes |
|---|---|---|
| Above tool | Leaderboard (728×90) | Desktop only |
| Below disclaimer | Rectangle (300×250) | Near tool |
| Sticky sidebar | Sticky (300×600) | Desktop only |
| Below FAQ | Rectangle (300×250) | End of content |
| Mobile interstitial | Avoid | Google penalty risk on YMYL |

Do not place ads above the calculator on mobile.

---

## Performance requirements

- Calculator interactive within 1 second of page load
- All rate data static JSON — no API calls on page load
- No third-party scripts except AdSense, GA4, Google Fonts
- Core Web Vitals all green on PageSpeed Insights

---

## Content quality rules

- `customIntro` is unique per state per tax type — empty string is a deploy blocker
- Formula section shows the actual math
- FAQ questions sourced from "People Also Ask" for that keyword
- County tables need at least 5 rows
- Scenarios use realistic prices for that state's context

---

## What not to build (year 1)

- ❌ Income tax — brackets + filing status = too complex
- ❌ User accounts or saved calculations
- ❌ Backend API for rates — flat JSON only
- ❌ Email capture or newsletter
- ❌ Social sharing features
- ❌ Subdomains
- ❌ Master cross-state aggregate JSON files

---

*Last updated: May 2026*  
*Project owner: Kobina AB*