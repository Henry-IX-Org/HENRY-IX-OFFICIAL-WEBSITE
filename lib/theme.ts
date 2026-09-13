/**
 * CDJ Symmetrical Deck Color Tokens
 * Aligns with app/globals.css @theme
 */

export type DeckId = 1 | 2 | 3 | 4;

export interface DeckColorDefinition {
  color: string;
  glow: string;
  shadow: string;
  rawRgba: string;
  rawHex: string;
  tailwind: {
    border: string;
    bg: string;
    text: string;
    badge: string;
    glow: string;
  };
}

export const DECK_COLORS: Record<DeckId, DeckColorDefinition> = {
  1: {
    color: 'var(--color-deck-1, rgba(211, 15, 49, 1))',
    glow: 'var(--color-deck-1-glow, rgba(211, 15, 49, 0.45))',
    shadow: 'var(--shadow-deck-1-glow, 0 0 12px rgba(211, 15, 49, 0.5))',
    rawRgba: 'rgba(211, 15, 49, 1)',
    rawHex: '#D30F31',
    tailwind: {
      border: 'border-red-500/60',
      bg: 'bg-red-500',
      text: 'text-red-400',
      badge: 'bg-red-500/20 border-red-500/50 text-red-400',
      glow: 'shadow-[0_0_12px_rgba(211,15,49,0.5)]',
    },
  },
  2: {
    color: 'var(--color-deck-2, rgba(34, 211, 238, 1))',
    glow: 'var(--color-deck-2-glow, rgba(34, 211, 238, 0.45))',
    shadow: 'var(--shadow-deck-2-glow, 0 0 12px rgba(34, 211, 238, 0.5))',
    rawRgba: 'rgba(34, 211, 238, 1)',
    rawHex: '#22D3EE',
    tailwind: {
      border: 'border-cyan-400/60',
      bg: 'bg-cyan-400',
      text: 'text-cyan-400',
      badge: 'bg-cyan-400/20 border-cyan-400/50 text-cyan-400',
      glow: 'shadow-[0_0_12px_rgba(34,211,238,0.5)]',
    },
  },
  3: {
    color: 'var(--color-deck-3, rgba(16, 185, 129, 1))',
    glow: 'var(--color-deck-3-glow, rgba(16, 185, 129, 0.45))',
    shadow: 'var(--shadow-deck-3-glow, 0 0 12px rgba(16, 185, 129, 0.5))',
    rawRgba: 'rgba(16, 185, 129, 1)',
    rawHex: '#10B981',
    tailwind: {
      border: 'border-emerald-400/60',
      bg: 'bg-emerald-400',
      text: 'text-emerald-400',
      badge: 'bg-emerald-400/20 border-emerald-400/50 text-emerald-400',
      glow: 'shadow-[0_0_12px_rgba(16,185,129,0.5)]',
    },
  },
  4: {
    color: 'var(--color-deck-4, rgba(234, 179, 8, 1))',
    glow: 'var(--color-deck-4-glow, rgba(234, 179, 8, 0.45))',
    shadow: 'var(--shadow-deck-4-glow, 0 0 12px rgba(234, 179, 8, 0.5))',
    rawRgba: 'rgba(234, 179, 8, 1)',
    rawHex: '#EAB308',
    tailwind: {
      border: 'border-yellow-400/60',
      bg: 'bg-yellow-400',
      text: 'text-yellow-400',
      badge: 'bg-yellow-400/20 border-yellow-400/50 text-yellow-400',
      glow: 'shadow-[0_0_12px_rgba(234,179,8,0.5)]',
    },
  },
};

/**
 * Returns the CSS variable string for the specified CDJ deck accent color.
 */
export function getDeckThemeColor(deckId: number | string): string {
  const id = Number(deckId) as DeckId;
  return DECK_COLORS[id]?.color || DECK_COLORS[1].color;
}

/**
 * Returns the raw RGBA string for canvas drawing contexts where var() is unsupported.
 */
export function getDeckRawRgba(deckId: number | string): string {
  const id = Number(deckId) as DeckId;
  return DECK_COLORS[id]?.rawRgba || DECK_COLORS[1].rawRgba;
}