import type { StateMeta, TaxTypeData, StateFile } from './types'
import statesIndex from '@/data/meta/states-index.json'

// ---------------------------------------------------------------------------
// Index — lightweight, always in memory
// ---------------------------------------------------------------------------

export function getAllStates(): StateMeta[] {
  return statesIndex as StateMeta[]
}

export function getStateMeta(slug: string): StateMeta | null {
  return (statesIndex as StateMeta[]).find((s) => s.slug === slug) ?? null
}

export function getAllStateSlugs(): { state: string }[] {
  return (statesIndex as StateMeta[]).map((s) => ({ state: s.slug }))
}

// ---------------------------------------------------------------------------
// Full state file — loaded per route, one file per state
// ---------------------------------------------------------------------------

function loadStateFile(slug: string): StateFile | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require(`@/data/states/${slug}.json`) as StateFile
  } catch {
    return null
  }
}

export function getStateData(slug: string): StateFile | null {
  return loadStateFile(slug)
}

// ---------------------------------------------------------------------------
// Tax type data — the primary data accessor for calculator pages
// Injects stateName, stateSlug, taxType so components don't need extra lookups
// ---------------------------------------------------------------------------

export function getTaxTypeData(
  stateSlug: string,
  taxType: string
): TaxTypeData | null {
  const stateFile = loadStateFile(stateSlug)
  if (!stateFile) return null

  const taxData = stateFile.taxTypes[taxType]
  if (!taxData) return null

  return {
    ...taxData,
    stateName: stateFile.name,
    stateSlug: stateFile.slug,
    taxType,
  }
}