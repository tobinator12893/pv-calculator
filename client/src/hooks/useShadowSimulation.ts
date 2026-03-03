import { useState, useCallback } from "react";
import type { ShadowState } from "../types/shadow";

const initialState: ShadowState = {
  enabled: false,
  date: new Date(),
  timeOfDay: 720, // 12:00
  isAnimating: false,
  animationSpeed: 600,
};

export function useShadowSimulation() {
  const [state, setState] = useState<ShadowState>(initialState);

  const toggleEnabled = useCallback(() => {
    setState((prev) => ({
      ...prev,
      enabled: !prev.enabled,
      isAnimating: false,
    }));
  }, []);

  const setDate = useCallback((date: Date) => {
    setState((prev) => ({ ...prev, date }));
  }, []);

  const setTimeOfDay = useCallback((timeOfDay: number) => {
    setState((prev) => ({ ...prev, timeOfDay }));
  }, []);

  const toggleAnimation = useCallback(() => {
    setState((prev) => ({ ...prev, isAnimating: !prev.isAnimating }));
  }, []);

  return {
    ...state,
    toggleEnabled,
    setDate,
    setTimeOfDay,
    toggleAnimation,
  };
}
