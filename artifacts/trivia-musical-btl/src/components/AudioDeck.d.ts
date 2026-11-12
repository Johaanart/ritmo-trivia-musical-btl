import type { JSX } from 'react';

export function AudioDeck(props: {
  isPlaying: boolean;
  onToggle: () => void;
  onPlaybackComplete: () => void;
  disabled: boolean;
  audioSrc: string | null;
  demoMelody: [number, number][];
}): JSX.Element;
