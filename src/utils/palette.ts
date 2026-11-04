/**
 * DEEPER-24: Official 24-color indexed palette for DEEPER.
 * Combines subterranean dark stone, radiant gold/amber, fungal green, and abyssal purple.
 */
export const DEEPER_24: readonly string[] = [
  '#0a0908', // 0: Subterranean Void (Background)
  '#161311', // 1: Deep Shadow
  '#241e1a', // 2: Dark Slate (Panel background)
  '#352d27', // 3: Stone Wall Dark
  '#4a3e35', // 4: Stone Wall Light (Panel border)
  '#635347', // 5: Weathered Rock
  '#806d5c', // 6: Muted Stone
  '#a48c74', // 7: Dim Parchment (Muted text)
  '#e6d5bc', // 8: Pale Chalk (Primary text)
  '#5e3e11', // 9: Dark Bronze
  '#9e6b22', // 10: Tarnished Gold
  '#e09f3e', // 11: Warm Amber
  '#f4d06f', // 12: Radiant Gold (Gold accent)
  '#fff1b0', // 13: Gold Sparkle Highlight
  '#d90429', // 14: Warning Crimson (Hazard / Danger)
  '#850f24', // 15: Dark Blood Clot
  '#183a2b', // 16: Deep Forest Mire
  '#285943', // 17: Fungal Cavern Dark
  '#4d8b67', // 18: Fungal Cavern Mid
  '#7bc48c', // 19: Bioluminescent Glow (Focus ring)
  '#1a1429', // 20: Abyssal Trench Dark
  '#2e214d', // 21: Abyssal Indigo
  '#4d3780', // 22: Abyssal Purple Mid
  '#7456b8', // 23: Ethereal Violet Highlight
] as const;

export const PALETTE = {
  background: DEEPER_24[0],
  panel: DEEPER_24[2],
  panelBorder: DEEPER_24[4],
  textDim: DEEPER_24[7],
  text: DEEPER_24[8],
  goldDark: DEEPER_24[10],
  goldAccent: DEEPER_24[12],
  goldHighlight: DEEPER_24[13],
  danger: DEEPER_24[14],
  focus: DEEPER_24[19],
  abyss: DEEPER_24[23],
} as const;

export function isValidHexColor(hex: string): boolean {
  return /^#[0-9a-f]{6}$/i.test(hex);
}

export function hexToNumber(hex: string): number {
  return parseInt(hex.replace(/^#/, ''), 16);
}

