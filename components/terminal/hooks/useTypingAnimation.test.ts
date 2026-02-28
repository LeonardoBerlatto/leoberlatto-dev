import { renderHook, act } from '@testing-library/react';
import { useTypingAnimation } from './useTypingAnimation';

const TYPING_SPEED_MS = 12;

function setup() {
  const onAnimationComplete = jest.fn();
  const onChime = jest.fn();
  const inputRef = { current: { focus: jest.fn() } } as never;

  const hook = renderHook(() =>
    useTypingAnimation(onAnimationComplete, onChime, inputRef),
  );

  return { onAnimationComplete, onChime, inputRef, hook };
}

describe('useTypingAnimation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with isAnimating false', () => {
    const { hook } = setup();
    expect(hook.result.current.isAnimating).toBe(false);
  });

  it('sets isAnimating to true when startAnimation is called', () => {
    const { hook } = setup();

    act(() => {
      hook.result.current.startAnimation('hello');
    });

    expect(hook.result.current.isAnimating).toBe(true);
  });

  it('displays characters progressively over time', () => {
    const { hook } = setup();
    const text = 'hello';

    act(() => {
      hook.result.current.startAnimation(text);
    });

    act(() => {
      jest.advanceTimersByTime(TYPING_SPEED_MS);
    });
    expect(hook.result.current.displayedText).toBe('h');

    act(() => {
      jest.advanceTimersByTime(TYPING_SPEED_MS);
    });
    expect(hook.result.current.displayedText).toBe('he');

    act(() => {
      jest.advanceTimersByTime(TYPING_SPEED_MS);
    });
    expect(hook.result.current.displayedText).toBe('hel');
  });

  it('calls onAnimationComplete with full text when animation finishes', () => {
    const { hook, onAnimationComplete } = setup();
    const text = 'hello';

    act(() => {
      hook.result.current.startAnimation(text);
    });

    // 5 chars * 12ms = 60ms for all chars, then one more tick to complete
    act(() => {
      jest.advanceTimersByTime(text.length * TYPING_SPEED_MS + TYPING_SPEED_MS);
    });

    expect(onAnimationComplete).toHaveBeenCalledWith(text);
    expect(hook.result.current.isAnimating).toBe(false);
  });

  it('calls onChime on natural completion', () => {
    const { hook, onChime } = setup();
    const text = 'hello';

    act(() => {
      hook.result.current.startAnimation(text);
    });

    act(() => {
      jest.advanceTimersByTime(text.length * TYPING_SPEED_MS + TYPING_SPEED_MS);
    });

    expect(onChime).toHaveBeenCalled();
  });

  it('skips animation on Escape and calls onAnimationComplete', () => {
    const { hook, onAnimationComplete, onChime } = setup();
    const text = 'hello world this is a longer text';

    act(() => {
      hook.result.current.startAnimation(text);
    });

    // Advance partially
    act(() => {
      jest.advanceTimersByTime(TYPING_SPEED_MS * 3);
    });

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape' }),
      );
    });

    expect(onAnimationComplete).toHaveBeenCalledWith(text);
    expect(hook.result.current.isAnimating).toBe(false);
    expect(onChime).not.toHaveBeenCalled();
  });

  it('shows skip hint for content longer than 50 characters', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    const { hook } = setup();
    const longText = 'a'.repeat(51);

    act(() => {
      hook.result.current.startAnimation(longText);
    });

    expect(hook.result.current.showSkipHint).toBe(false);

    // With Math.random() = 0, delay = 500ms (MIN_HINT_DELAY_MS)
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(hook.result.current.showSkipHint).toBe(true);
    randomSpy.mockRestore();
  });

  it('does not show skip hint for short content', () => {
    const { hook } = setup();
    const shortText = 'a'.repeat(50);

    act(() => {
      hook.result.current.startAnimation(shortText);
    });

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(hook.result.current.showSkipHint).toBe(false);
  });
});
