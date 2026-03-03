export interface ShadowState {
  enabled: boolean;
  date: Date;
  timeOfDay: number; // minutes since midnight (e.g. 720 = 12:00)
  isAnimating: boolean;
  animationSpeed: number; // multiplier
}
