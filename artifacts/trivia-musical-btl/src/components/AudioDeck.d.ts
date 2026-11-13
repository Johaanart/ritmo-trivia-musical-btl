import type { JSX } from 'react';

export function AudioDeck(props: {
  isPlaying: boolean;
  onToggle: () => void;
  onPlaybackComplete: () => void;
  onPlaybackError: () => void;
  disabled: boolean;
  audioSrc: string;
}): JSX.Element;
