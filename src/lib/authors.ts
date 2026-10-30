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
  photo: string
  bio: string[]
  responsibilities: string[]

}

const AUTHORS: Record<string, Author> = {
  talha: {
    slug: 'talha',
    name: 'Talha Mansoor, FCCA',
    title: 'Lead Financial Reviewer',
    shortBio:
      'Talha is a Fellow of the Association of Chartered Certified Accountants (FCCA) and a certified Financial Modeling & Valuation Analyst (FMVA) with over 15 years of experience in statutory compliance, financial controllership, and international accounting. He has held roles at Ernst & Young, Google, Pure Storage, and Cardinal Health, and reviews the financial logic and tax assumptions behind every calculator on this site.',
    linkedinUrl: 'https://linkedin.com/in/talha-mansoor-fcca-fmva',
    photo: '/team/talha.png',
    bio: [
      'Talha is a Fellow of the Association of Chartered Certified Accountants (FCCA) and a certified Financial Modeling & Valuation Analyst (FMVA) with over 15 years of experience in statutory compliance, financial controllership, and international accounting across more than 30 jurisdictions.',
      'His career includes roles as Audit Executive at Ernst & Young, Statutory Compliance Accountant at Google, Statutory Compliance Manager at Pure Storage, and International Financial Controller at Cardinal Health. His experience covers multi-jurisdiction tax compliance, statutory audit, and financial reporting under IFRS, US GAAP, and multiple local GAAP frameworks.',
      'At Simple Tax Calculator, Talha reviews financial logic, tax assumptions, and calculation methodologies across the calculator suite. His role is to assess whether the underlying formulas and assumptions are consistent with established accounting and tax practices.',
    ],
    responsibilities: [
      'Reviewing financial calculations and tax methodologies.',
      'Validating tax assumptions used in calculator tools.',
      'Reviewing calculation logic for accuracy and consistency.',
      'Providing professional oversight of financial content.',
    ],

  },
  ray: {
    slug: 'ray',
    name: 'Ray Alamian',
    title: 'Data Research Contributor',
    shortBio:
      'Ray sources, verifies, and structures the tax data behind this site, cross-referencing official state and federal publications to keep our rate data accurate. His background includes data reporting and operational analytics at Siemens Energy and Siemens Gamesa Renewable Energy.',
    linkedinUrl: 'https://linkedin.com/in/ray-alamian-990b1080',
    photo: '/team/ray.jpg',
    bio: [
      'Ray contributes to tax data collection, source verification, and structured data management for Simple Tax Calculator. His background includes data reporting systems, compliance processes, and operational data analytics, with experience at Siemens Energy and Siemens Gamesa Renewable Energy.',
      'His work focuses on cross-referencing tax rates against official Department of Revenue publications and other government sources. He also helps identify changes to published rates and maintain the accuracy of state and county-level datasets.',
      'At Simple Tax Calculator, Ray supports the research process behind the platform’s tax tools by helping ensure that the data used in calculations can be traced back to reliable primary sources.',
    ],
    responsibilities: [
      'Researching state and local tax rates.',
      'Verifying data against official government publications.',
      'Identifying changes to published tax rates.',
      'Maintaining structured state and county-level datasets.',
    ],
  },
  saeed: {
    slug: 'saeed',
    name: 'Saeed Davari',
    title: 'Founder & Technical Architect',
    shortBio:
      'Saeed is the founder of simpletaxcalculator.app and the engineer behind its architecture, calculation logic, and data pipelines.',
    linkedinUrl: 'https://www.linkedin.com/in/saeed-davari-3a218511b',
    photo: '/team/saeed.jpg',
    bio: [
      'Saeed is a senior software developer and solutions architect responsible for the technical architecture, calculation logic, infrastructure, and ongoing maintenance of Simple Tax Calculator.',
      'His work focuses on translating documented tax methodologies and verified data into reliable software calculations. He is also responsible for the technical systems that support the platform and its ongoing development.',
      'At Simple Tax Calculator, Saeed works to ensure that calculators are implemented consistently, produce reliable results, and remain maintainable as tax rules and published rates change.',
    ],
    responsibilities: [
      'Designing and maintaining the platform architecture.',
      'Implementing tax calculation logic in software.',
      'Maintaining infrastructure and technical reliability.',
      'Testing and maintaining calculator functionality.',
    ],
  },
}

export function getAuthor(slug: string): Author | null {
  return AUTHORS[slug] ?? null
}