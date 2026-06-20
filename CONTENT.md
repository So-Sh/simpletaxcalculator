CONTENT.md — Blog & Content Strategy for simpletaxcalculator.app
Companion to CLAUDE.md. Read TEAM.md alongside this file before assigning or writing any post — author credentials drive what each person should and shouldn't write.

Why a blog, given this is a pSEO/calculator site
The core site (CLAUDE.md) is built on programmatic SEO: state × tax-type calculator/estimator pages. pSEO is good at capturing long-tail, low-competition, geographically-specific search intent, but it has a structural weakness: calculator pages almost never earn backlinks. Nobody links to a tax calculator the way they link to an article, a dataset, or an explainer.

Current GSC data shows the consequence directly: the site has real impression volume across the right keywords, but rankings cluster at position 50-90 on competitive head terms (e.g. "california sales tax calculator," "texas sales tax calculator"), against competitors (TaxJar, Avalara, SmartAsset, NerdWallet, Calculator.net) with much higher domain authority. pSEO alone is likely sufficient to reach Journey by Mediavine (1K sessions/mo) by winning the long tail, but is unlikely to be sufficient to reach full Mediavine (50K sessions/mo) without raising domain authority first.

The blog's job is specifically to earn backlinks and raise DR — not to be a primary traffic source in its own right (though traffic is a welcome side effect). The flywheel: blog post earns backlinks (from finance journalists, other tools/directories, Reddit, etc.) → DR rises → existing calculator/estimator pages climb from position 50-90 toward page 1 → pSEO traffic compounds.

This means the bar for a blog post here is higher than for a pSEO page: fewer posts, each with a genuine data angle, ranking comparison, or original research hook — not generic "what is X tax" filler that nobody links to. A handful of strong, link-worthy posts does more for DR than twenty generic ones.

Content types that tend to earn links in this space
- Data-driven rankings ("states with the highest property taxes, by county")
- Year-over-year change/trend pieces (using datasets that already have a time dimension, e.g. inflation-adjusted change fields)
- Myth-correcting or "the real difference between X and Y" explainers (e.g. inheritance tax vs estate tax — high "People Also Ask" pickup)
- Methodology/credibility pieces explaining how the site sources and verifies data (also doubles as E-E-A-T signal for YMYL purposes)
Avoid: generic definitional posts with no original angle, anything that reads like it could've been written by any finance site with no connection to this site's actual data or tools.

Digital PR via /research/ pages — highest priority, do this first
Distinct from blog posts: standalone data pages built entirely from existing all-states JSON (property-tax.json, gas-tax.json, capital-gains.json), packaged with a clear, pitchable finding and actively pitched to local/finance journalists rather than left to be discovered organically. This is the fastest available path to backlinks since it requires no new data collection — the data already exists in the site's own files.

Examples: "States With the Highest Property Taxes, Ranked by County" and "Property Tax Increases by County" (see planned cluster below) are natural /research/ candidates as much as blog posts — package the data finding as a standalone research page first, pitch it, then optionally expand into a fuller blog narrative around it.

Author: Ray. This is data sourcing and presentation, not tax interpretation, and fits his scope exactly (see TEAM.md).

Priority: build and pitch /research/ pages before continuing the broader blog content cluster below — they're cheaper to produce (no new writing of explainer prose, just data + a finding) and have a more direct backlink payoff than blog posts aimed at organic ranking.

Author assignment — the rule
This is a YMYL (Your Money or Your Life) site. Google's quality evaluation weighs author-level expertise, not just site-level signals, so byline assignment is a real editorial decision, not a formality. Full bios and credentials are in TEAM.md; the assignment logic is:

Talha Mansoor (Lead Financial Reviewer, FCCA) — owns interpretive/advisory content: anything where the post is explaining what a tax rule means for the reader, methodology behind a calculation, or comparing tax treatments. His credentials (FCCA, EY, Google, Cardinal Health) are the trust signal — use his byline anywhere the content could be construed as financial interpretation or advice-adjacent, since that's exactly the content type Google's YMYL guidelines scrutinize most.

Ray Alamian (Data Research Contributor) — owns data/research content: rankings, comparisons, and "X by the numbers" pieces that are fundamentally about sourcing, structuring, and presenting public data rather than interpreting tax law or giving advice. His bio should reflect this scope accurately (data research, source verification) — don't imply tax expertise he doesn't have.

Saeed Davari (Technical Architect & Founder) — owns founder/builder content: how the platform works, methodology behind data pipelines, why a feature was built a certain way, behind-the-scenes posts. This is also a distinct link-earning channel (developer/indie-hacker/tool-directory audiences) separate from Talha's and Ray's finance-audience link profile. Do not use a developer/architect byline on interpretive tax-advice content — it carries no E-E-A-T weight there and could weaken trust signals on YMYL pages. Note: Saeed is also the site's actual founder; /about and any founder-facing copy should reflect that role, not just "Technical Architect."

When in doubt about which author fits a topic, ask: "Is this post explaining what a number means for the reader's taxes (Talha), presenting/ranking data (Ray), or explaining how the site itself works (Saeed)?"

Data vintage and accuracy rules for content (see also CLAUDE.md → Data sourcing & vintage rules)
Any post built on a dataset must state the data's actual vintage in the body text, not just a footnote. A 2026-dated blog post using 2024 Census ACS data must say so plainly — e.g. "based on the most recent available Census data (2024)" — early in the post. Titles can use the current year if that matches search intent (e.g. "Property Tax Trends 2026"), but the body must immediately clarify the underlying data's real vintage. Burying this in fine print is a YMYL accuracy risk, not just a nitpick.

Before publishing, check whether a newer version of the underlying dataset has actually been released — don't assume the data on hand is the latest without checking. (Context: ACS 1-year estimates are typically released each September for the prior year; the property tax dataset in property-tax.json was confirmed current as of mid-2026, with no 2025 ACS data yet available.)

Planned content cluster — property tax data (Ray)
These three reuse the same underlying property-tax.json dataset, so should be produced as a batch:
1. States With the Highest Property Taxes, Ranked by County
2. Property Tax Increases by County: Where Bills Rose the Most (cheapest to produce — uses the pctChangeInflationAdjusted field already in the dataset)
3. States With No Property Tax (And What You Pay Instead) — note: every state does have some property tax, so this needs an honest reframe (e.g. lowest-property-tax states), don't publish a literally false premise

Title/data-year mismatch check: any title implying 2026 figures must be reconciled with the actual 2024 ACS vintage per the rule above before publishing.

Planned content cluster — methodology & comparisons (Talha)
- How Property Tax Is Actually Calculated: Mill Rates, Assessments, and Appeals — also functions as the explainer for why the site's tool is an "Estimator," not a "Calculator" (median effective rate vs. statutory mill rate)
- Inheritance Tax vs Estate Tax: What's the Real Difference?
- Do You Pay Sales Tax on a Car You Inherit? — cross-links Sales Tax and (planned) Inheritance Tax tools
- Self-Employment Tax Explained
- Capital Gains Tax on Real Estate: How to Legally Pay Less
- Crypto Tax Guide

Sequencing note: prioritize /research/ pages first (see Digital PR section above), then this cluster as blog posts, then Talha's cluster. Ray's property-tax cluster reuses existing data with no new research, so it should be the fastest content shipped after the /research/ pages themselves — likely the same underlying data work, repackaged twice (once as a pitched research page, once as a fuller blog post).

Internal linking rules for blog content
- Every blog post must link to at least one relevant calculator/estimator page
- Calculator/estimator pages should link back to relevant published posts once they exist (update RelatedTools or add a dedicated content link slot)
- State-specific data posts (e.g. property tax rankings) should link to the specific state pages they mention, not just the national pillar

Banned words (cross-project — also applies to mactools.pro and Vorna.ai)
integrates, boasts, merge, tapestry, enriching, abundance, treasure trove, awe-inspiring, brimming, indulge, opulent

Style baseline (cross-project)
Concise, use-case-focused copy. No technical sourcing details in marketing-facing copy (save that for /editorial-policy and notes fields). Recommendations and competitive claims must be cross-referenced against existing site content before publishing — never claim something doesn't exist on the site without checking. 10th-grade reading level baseline for blog posts unless a specific post calls for more technical depth (e.g. Talha's methodology pieces may run more technical given the audience).

Last updated: June 2026