import { useState, useRef, useEffect, RefObject } from 'react';
import { TYPING_SPEED_MS } from '../constants';

export function useTypingAnimation(
  onAnimationComplete: (fullText: string) => void,
  onChime: () => void,
  inputRef: RefObject<HTMLInputElement | null>,
) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const animatingTextRef = useRef('');

  useEffect(() => {
    if (!isAnimating) {
      inputRef.current?.focus();
    }
  }, [isAnimating, inputRef]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAnimating) {
        e.preventDefault();
        setIsAnimating(false);
        setDisplayedText('');
        onAnimationComplete(animatingTextRef.current);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isAnimating, onAnimationComplete]);

  useEffect(() => {
    if (!isAnimating) return;

    const fullText = animatingTextRef.current;
    let index = 0;

    const interval = setInterval(() => {
      index++;
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        setDisplayedText('');
        onAnimationComplete(fullText);
        onChime();
      }
    }, TYPING_SPEED_MS);

    return () => clearInterval(interval);
  }, [isAnimating, onAnimationComplete, onChime]);

  const startAnimation = (text: string) => {
    animatingTextRef.current = text;
    setDisplayedText('');
    setIsAnimating(true);
  };

  return { isAnimating, displayedText, startAnimation };
}
