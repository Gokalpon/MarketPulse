/**
 * Haptic Feedback Service
 * Provides subtle physical feedback for mobile interactions
 */

export const haptic = {
  // Light vibration for navigation and subtle touches
  light: () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
    } catch (e) { /* silent fail */ }
  },

  // Medium vibration for selections and button presses
  medium: () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(25);
      }
    } catch (e) { /* silent fail */ }
  },

  // Success pattern (double short burst)
  success: () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([15, 30, 15]);
      }
    } catch (e) { /* silent fail */ }
  },

  // Warning/Error pattern
  error: () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([50, 100, 50, 100]);
      }
    } catch (e) { /* silent fail */ }
  }
};
