// lib/authors.ts
//
// Source of truth: TEAM.md. If a bio or scope changes there, update it here
// too — this is what actually renders on published posts, TEAM.md is the
// editorial reference doc, this is the runtime data.

export interface Author {
  slug: string
  name: string
  title: string
  shortBio: string
  linkedinUrl: string
}

const AUTHORS: Record<string, Author> = {
  talha: {
    slug: 'talha',
    name: 'Talha Mansoor, FCCA',
    title: 'Lead Financial Reviewer',
    shortBio:
      'Talha is a Fellow of the Association of Chartered Certified Accountants (FCCA) and a certified Financial Modeling & Valuation Analyst (FMVA) with over 15 years of experience in statutory compliance, financial controllership, and international accounting. He has held roles at Ernst & Young, Google, Pure Storage, and Cardinal Health, and reviews the financial logic and tax assumptions behind every calculator on this site.',
    linkedinUrl: 'https://linkedin.com/in/talha-mansoor-fcca-fmva',
  },
  ray: {
    slug: 'ray',
    name: 'Ray Alamian',
    title: 'Data Research Contributor',
    shortBio:
      'Ray sources, verifies, and structures the tax data behind this site, cross-referencing official state and federal publications to keep our rate data accurate. His background includes data reporting and operational analytics at Siemens Energy and Siemens Gamesa Renewable Energy.',
    linkedinUrl: 'https://linkedin.com/in/ray-alamian-990b1080',
  },
  saeed: {
    slug: 'saeed',
    name: 'Saeed Davari',
    title: 'Founder & Technical Architect',
    shortBio:
      'Saeed is the founder of simpletaxcalculator.app and the engineer behind its architecture, calculation logic, and data pipelines.',
    linkedinUrl: 'https://www.linkedin.com/in/saeed-davari-3a218511b',
  },
}

export function getAuthor(slug: string): Author | null {
  return AUTHORS[slug] ?? null
}