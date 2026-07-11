import { useEffect, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { TYPE_INTERVAL_MS, typeStep } from '@/lib/typewriter-logic';

/**
 * Typewriter reveal of `text`. Resets when the text changes (render-time
 * state sync, same trick as the web page — the old text never flashes).
 * Reduce-motion jumps straight to done.
 */
export function useTypewriter(text: string): { displayed: string; done: boolean } {
  const reduced = useReducedMotion();
  const [displayed, setDisplayed] = useState(() => (reduced ? text : ''));
  const [done, setDone] = useState(() => reduced || text.length === 0);
  const [prevText, setPrevText] = useState(text);

  if (text !== prevText) {
    setPrevText(text);
    setDisplayed(reduced ? text : '');
    setDone(reduced || text.length === 0);
  }

  useEffect(() => {
    if (!text || reduced) return;
    let i = 0;
    const interval = setInterval(() => {
      const step = typeStep(text, i);
      i = step.next;
      setDisplayed(text.slice(0, i));
      if (step.done) {
        clearInterval(interval);
        setDone(true);
      }
    }, TYPE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [text, reduced]);

  return { displayed, done };
}
