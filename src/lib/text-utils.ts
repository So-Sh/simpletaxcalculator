// lib/text-utils.ts
//
// Small shared helpers for text that gets interpolated into templated
// copy (FAQ questions, headings) across many generated pages.

/**
 * Returns 'an' or 'a' based on the first letter of `text` — for templated
 * copy like `Is this ${article(countyName)} ${countyName}...`. A simple
 * first-letter check, not full phonetic detection (so "an hour" / "a
 * European" edge cases aren't handled) — sufficient for US county and
 * state names, which don't hit those exceptions.
 */
export function article(text: string): 'a' | 'an' {
    return /^[aeiou]/i.test(text.trim()) ? 'an' : 'a'
}