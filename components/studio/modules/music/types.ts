import { StudioTrack } from '@/store/studioStore';

export type { StudioTrack };

export interface MusicSubViewProps {
  onNavigate?: (view: string) => void;
}

export const isHarmonicMatch = (k1: string, k2: string) => {
  if (k1 === k2) return true;
  const num1 = parseInt(k1, 10);
  const num2 = parseInt(k2, 10);
  const letter1 = k1.slice(-1);
  const letter2 = k2.slice(-1);

  if (letter1 === letter2) {
    const diff = Math.abs(num1 - num2);
    return diff === 1 || diff === 11;
  }
  if (num1 === num2) return true;
  return false;
};
