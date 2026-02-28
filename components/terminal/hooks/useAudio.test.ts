import { renderHook, act } from '@testing-library/react';
import { useAudio } from './useAudio';

const mockSynth = {
  toDestination: jest.fn(),
  triggerAttackRelease: jest.fn(),
};
mockSynth.toDestination.mockReturnValue(mockSynth);

const mockTone = {
  start: jest.fn().mockResolvedValue(undefined),
  Synth: jest.fn(() => mockSynth),
  now: jest.fn(() => 0),
};

jest.mock('tone', () => mockTone);

describe('useAudio', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('initTone calls Tone.start()', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.initTone();
    });

    expect(mockTone.start).toHaveBeenCalledTimes(1);
  });

  it('initTone is idempotent on second call', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.initTone();
    });

    await act(async () => {
      await result.current.initTone();
    });

    expect(mockTone.start).toHaveBeenCalledTimes(1);
  });

  it('playChime no-ops before initTone', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.playChime();
    });

    expect(mockTone.Synth).not.toHaveBeenCalled();
  });

  it('playChime creates synth and triggers note after init', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.initTone();
    });

    await act(async () => {
      await result.current.playChime();
    });

    expect(mockTone.Synth).toHaveBeenCalledTimes(1);
    expect(mockSynth.toDestination).toHaveBeenCalled();
    expect(mockSynth.triggerAttackRelease).toHaveBeenCalledWith('C5', '16n', 0);
  });

  it('playChime triggers second synth after 100ms delay', async () => {
    const { result } = renderHook(() => useAudio());

    await act(async () => {
      await result.current.initTone();
    });

    await act(async () => {
      await result.current.playChime();
    });

    expect(mockTone.Synth).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    expect(mockTone.Synth).toHaveBeenCalledTimes(2);
    expect(mockSynth.triggerAttackRelease).toHaveBeenCalledWith('E5', '16n');
  });
});
