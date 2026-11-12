import type { JSX } from 'react';

export function AnswerOption(props: {
  answer: string;
  index: number;
  state: '' | 'correct' | 'wrong';
  selected: boolean;
  disabled: boolean;
  onChoose: (answerIndex: number) => void;
}): JSX.Element;
