export const AFFIRMATIONS = [
  'You deserve the life you’re building.',
  'Slow progress is still progress.',
  'Your future self is already proud of you.',
  'You are allowed to take up space.',
  'Soft and strong can live in the same woman.',
  'Today, you choose ease over pressure.',
  'You are becoming her — one quiet day at a time.',
  'Rest is productive too.',
  'You don’t have to earn your own kindness.',
  'The right things are finding their way to you.',
  'You are the calm you’ve been looking for.',
  'Your presence is a gift, not a performance.',
  'Let it be gentle. Let it be yours.',
  'You are exactly where you’re meant to begin.',
  'Glow now — you’ve waited long enough.',
  'Your peace is a priority, not a reward.',
  'You hold more light than you realize.',
  'Choose what feels like home.',
  'You are worthy of a slow, beautiful life.',
  'Everything you need is already within you.',
]

export function dailyAffirmation(): string {
  const start = new Date(new Date().getFullYear(), 0, 0)
  const day = Math.floor((Date.now() - start.getTime()) / 86400000)
  return AFFIRMATIONS[day % AFFIRMATIONS.length]
}

export interface Mood {
  id: string; label: string; color: string; scent: string
  affirmation: string; playlist: string; note: string
}

const sp = (q: string) => `https://open.spotify.com/search/${encodeURIComponent(q)}`

export const MOODS: Mood[] = [
  { id: 'relax', label: 'Relax', color: '#CFE0D8', scent: 'im-safe', affirmation: 'You are safe to slow down.', playlist: sp('calm ambient relax'), note: 'Dim the lights, breathe out the day.' },
  { id: 'self-love', label: 'Self Love', color: '#F4D2D8', scent: 'you-are-enough', affirmation: 'You are already enough.', playlist: sp('self love soft pop'), note: 'A little ritual, just for you.' },
  { id: 'romantic', label: 'Romantic', color: '#E9C4CE', scent: 'let-go', affirmation: 'Let love find you soft and open.', playlist: sp('romantic evening jazz'), note: 'Warm glow, slow songs.' },
  { id: 'focus', label: 'Focus', color: '#CDE0E6', scent: 'new-beginning', affirmation: 'Clear mind, calm hands.', playlist: sp('deep focus instrumental'), note: 'One candle, one task.' },
  { id: 'cozy', label: 'Cozy Night', color: '#E7D6C4', scent: 'im-safe', affirmation: 'Tonight, comfort is the plan.', playlist: sp('cozy night acoustic'), note: 'Blanket, tea, flicker.' },
  { id: 'energy', label: 'Energy', color: '#F3DEBE', scent: 'new-beginning', affirmation: 'You are full of bright beginnings.', playlist: sp('feel good morning energy'), note: 'Open the windows.' },
  { id: 'fresh', label: 'Fresh Start', color: '#D6E6CF', scent: 'new-beginning', affirmation: 'A clean page is yours today.', playlist: sp('fresh start indie'), note: 'Reset the room, reset you.' },
  { id: 'confidence', label: 'Confidence', color: '#F1D4C0', scent: 'you-are-enough', affirmation: 'You walk in like you belong — because you do.', playlist: sp('confidence boost playlist'), note: 'Light it, own it.' },
  { id: 'manifest', label: 'Manifestation', color: '#E4D6EC', scent: 'let-go', affirmation: 'You release, and it returns multiplied.', playlist: sp('manifestation 432hz'), note: 'Name it, then let go.' },
  { id: 'reset', label: 'Weekend Reset', color: '#D8DEE8', scent: 'im-safe', affirmation: 'You are allowed a soft reset.', playlist: sp('sunday reset chill'), note: 'Tidy, breathe, begin again.' },
]
