import { useEffect, useState } from 'react';

interface VisualViewportState {
  isKeyboardOpen: boolean;
  keyboardViewportHeight: number | null;
}

export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>({
    isKeyboardOpen: false,
    keyboardViewportHeight: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const vv = window.visualViewport;
    let baselineHeight = Math.max(window.innerHeight, vv.height);

    const update = () => {
      const currentInnerHeight = window.innerHeight;
      if (vv.height > baselineHeight) {
        baselineHeight = vv.height;
      }
      if (currentInnerHeight > baselineHeight) {
        baselineHeight = currentInnerHeight;
      }

      // Keyboard is considered open when visualViewport shrinks substantially (> 120px)
      // relative to the initial layout height or window.innerHeight.
      const heightDiff = Math.max(currentInnerHeight - vv.height, baselineHeight - vv.height);
      const isNarrowViewport = window.innerWidth < 768;
      const isKeyboardOpen = isNarrowViewport && heightDiff > 120;

      // On iOS Safari, window.innerHeight stays at 100dvh while visualViewport.height shrinks.
      // Constraining the App Shell height to vv.height while the keyboard is open keeps
      // inputs above the virtual keyboard without outer body scrolling.
      const needsExplicitHeight = isKeyboardOpen && currentInnerHeight - vv.height > 80;

      setState({
        isKeyboardOpen,
        keyboardViewportHeight: needsExplicitHeight ? Math.round(vv.height) : null,
      });

      // Reset any accidental iOS visualViewport scroll offset
      if (window.scrollY !== 0 || window.scrollX !== 0) {
        window.scrollTo(0, 0);
      }
    };

    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    window.addEventListener('resize', update);

    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return state;
}
