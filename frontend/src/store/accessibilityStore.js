import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULTS = {
  mode:        'standard',  // standard | reading-support | number-support | voice-input | focus
  fontFamily:  'inter',
  fontSize:    1.0,
  lineSpacing: 'normal',
  wordSpacing: 'normal',
  colorTheme:  'standard',
  readingGuide: false,
  ttsEnabled:   false,
  sttPreferred: false,
  highContrast: false
};

export const useAccessibilityStore = create(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      setMode: (mode) => {
        set({ mode });
        applyTheme(mode);
      },
      updatePreference: (key, value) => set({ [key]: value }),
      reset: () => { set(DEFAULTS); applyTheme('standard'); },

      getCurrentMode: () => get().mode
    }),
    { name: 'aclc_a11y' }
  )
);

function applyTheme(mode) {
  const themeMap = {
    'standard':       '',
    'reading-support': 'reading-support',
    'number-support':  'dark',
    'voice-input':     'dark',
    'focus':           'focus'
  };
  document.documentElement.setAttribute('data-theme', themeMap[mode] || '');
}
