// Soft pastel accent per candle emotion — pulled from the candle label brush strokes.
export function accentFor(key: string | undefined): string {
  const k = (key || '').toLowerCase()
  if (k.includes('release') || k.includes('let go')) return '#e3a6aa'        // rose — Let Go
  if (k.includes('safe')) return '#bdaedd'                                    // lavender — I'm Safe
  if (k.includes('enough') || k.includes('worth') || k.includes('mango')) return '#eeb18c' // peach — You Are Enough
  if (k.includes('renew') || k.includes('beginning')) return '#aac9a0'        // sage — New Beginning
  if (k.includes('tropical')) return '#9fc6c0'                                // teal — tropical stickers
  if (k.includes('healing')) return '#c9b8e0'                                 // soft lilac
  return '#d8b78a' // warm champagne default
}

// The four emotion pastels, for decorative accents.
export const EMOTION_PASTELS = ['#aac9a0', '#eeb18c', '#bdaedd', '#e3a6aa']
