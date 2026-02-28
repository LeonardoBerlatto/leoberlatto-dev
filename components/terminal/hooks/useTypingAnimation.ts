import { useState, useRef, useEffect, RefObject } from 'react';
import { TYPING_SPEED_MS } from '../constants';

const MIN_HINT_DELAY_MS = 500;
const MAX_HINT_DELAY_MS = 1500;
const MIN_CONTENT_LENGTH = 50;

export function useTypingAnimation(
  onAnimationComplete: (fullText: string) => void,
  onChime: () => void,
  inputRef: RefObject<HTMLInputElement | null>,
) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [showSkipHint, setShowSkipHint] = useState(false);
  const animatingTextRef = useRef('');
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

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
        setShowSkipHint(false);
        if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
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

    if (fullText.length > MIN_CONTENT_LENGTH) {
      const delay = MIN_HINT_DELAY_MS + Math.random() * (MAX_HINT_DELAY_MS - MIN_HINT_DELAY_MS);
      hintTimeoutRef.current = setTimeout(() => setShowSkipHint(true), delay);
    }

    const interval = setInterval(() => {
      index++;
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
      } else {
        clearInterval(interval);
        setIsAnimating(false);
        setDisplayedText('');
        setShowSkipHint(false);
        if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
        onAnimationComplete(fullText);
        onChime();
      }
    }, TYPING_SPEED_MS);

    return () => {
      clearInterval(interval);
      if (hintTimeoutRef.current) clearTimeout(hintTimeoutRef.current);
    };
  }, [isAnimating, onAnimationComplete, onChime]);

  const startAnimation = (text: string) => {
    animatingTextRef.current = text;
    setDisplayedText('');
    setShowSkipHint(false);
    setIsAnimating(true);
  };

  return { isAnimating, displayedText, showSkipHint, startAnimation };
}
