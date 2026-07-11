import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * In-memory replacement for the web's sessionStorage funnel keys (ms_vent,
 * ms_figure_id, ms_figure_name, ms_response, ms_session_id). sessionStorage
 * lives for the tab; this context lives for the app process — same semantics
 * (kill the app = close the tab = fresh session). Deliberately NOT persisted.
 */
type VentFlowState = {
  vent: string | null;
  figureId: string | null;
  figureName: string | null;
  response: string | null;
  /** Set once the session is persisted via /api/save-response. */
  sessionId: string | null;
};

type VentFlowValue = VentFlowState & {
  /** New vent from onboarding: sets the text, clears the session (web parity). */
  startVent: (text: string) => void;
  /** Lens screen result: figure + generated response. */
  setLensResult: (figureId: string, figureName: string, response: string) => void;
  setSessionId: (id: string) => void;
  reset: () => void;
};

const EMPTY: VentFlowState = {
  vent: null,
  figureId: null,
  figureName: null,
  response: null,
  sessionId: null,
};

const VentFlowContext = createContext<VentFlowValue | null>(null);

export function VentFlowProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<VentFlowState>(EMPTY);

  const startVent = useCallback((text: string) => {
    setState({ ...EMPTY, vent: text.trim() });
  }, []);

  const setLensResult = useCallback((figureId: string, figureName: string, response: string) => {
    setState((s) => ({ ...s, figureId, figureName, response }));
  }, []);

  const setSessionId = useCallback((id: string) => {
    setState((s) => ({ ...s, sessionId: id }));
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const value = useMemo(
    () => ({ ...state, startVent, setLensResult, setSessionId, reset }),
    [state, startVent, setLensResult, setSessionId, reset],
  );

  return <VentFlowContext.Provider value={value}>{children}</VentFlowContext.Provider>;
}

export function useVentFlow(): VentFlowValue {
  const ctx = useContext(VentFlowContext);
  if (!ctx) throw new Error('useVentFlow must be used inside VentFlowProvider');
  return ctx;
}
