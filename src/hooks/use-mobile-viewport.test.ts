import { act, renderHook } from '@testing-library/react';
import { useMobileViewport } from './use-mobile-viewport';

function mockViewport(matches: boolean) {
  let onChange: ((event: MediaQueryListEvent) => void) | undefined;
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query) =>
      ({
        matches,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: (_event: string, listener: typeof onChange) => {
          onChange = listener;
        },
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList,
  );
  return {
    change: (nextMatches: boolean) =>
      onChange?.({ matches: nextMatches } as MediaQueryListEvent),
  };
}

describe('useMobileViewport', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reflects the initial matchMedia result', () => {
    mockViewport(true);
    const { result } = renderHook(() => useMobileViewport());
    expect(result.current).toBe(true);
  });

  it('updates when the media query change event fires', () => {
    const viewport = mockViewport(false);
    const { result } = renderHook(() => useMobileViewport());
    expect(result.current).toBe(false);

    act(() => viewport.change(true));

    expect(result.current).toBe(true);
  });
});
