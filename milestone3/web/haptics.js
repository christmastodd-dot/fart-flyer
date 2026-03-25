// haptics.js — tactile feedback
//
// In-app (iOS via Capacitor): uses @capacitor/haptics ImpactStyle
// Browser / Android fallback:  navigator.vibrate (silently ignored if absent)

const Haptics = {
  _call(style) {
    // Capacitor bridge is injected by the native iOS/Android shell at runtime.
    // window.Capacitor won't exist in a plain browser — the fallback handles that.
    if (window.Capacitor?.Plugins?.Haptics) {
      window.Capacitor.Plugins.Haptics.impact({ style }).catch(() => {});
      return;
    }
    if (navigator.vibrate) {
      const ms = style === 'Heavy' ? 30 : style === 'Light' ? 8 : 15;
      navigator.vibrate(ms);
    }
  },

  // Short tap — scoring a pipe
  light()  { this._call('Light'); },

  // Standard tap — fart thrust
  medium() { this._call('Medium'); },

  // Thud — hitting an obstacle
  heavy()  { this._call('Heavy'); },
};
