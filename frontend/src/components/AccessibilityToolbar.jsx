import React, { useState, useEffect } from 'react';
import {
  Settings, Type, Sun, Moon, Eye, MousePointer, Volume2, Mic,
  AlignJustify, MoveHorizontal, Contrast, X
} from 'lucide-react';
import useSTT from '../hooks/useSTT';

const AccessibilityToolbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    textScale: 1,
    lineHeight: 1.5,
    wordSpacing: 'normal',
    highContrast: false,
    darkMode: false,
    invertColors: false,
    highlightLinks: false,
    cursorSize: 'auto'
  });

  const [mode, setMode] = useState('default'); // default, dyslexia, dyscalculia, dysgraphia

  const [isSpeaking, setIsSpeaking] = useState(false);

  // Custom Hook for STT
  const { isRecording, startRecording, stopRecording, transcript, error: sttError } = useSTT();

  // Listen for external open events
  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-a11y-toolbar', handleOpen);
    return () => window.removeEventListener('open-a11y-toolbar', handleOpen);
  }, []);

  // Mode Presets
  const applyMode = (selectedMode) => {
    setMode(selectedMode);
    if (selectedMode === 'dyslexia') {
      setSettings({ ...settings, textScale: 1.1, lineHeight: 2, wordSpacing: 'wide', highContrast: false });
      document.body.style.fontFamily = '"OpenDyslexic", "Comic Sans MS", sans-serif';
    } else if (selectedMode === 'dyscalculia') {
      setSettings({ ...settings, textScale: 1.0, lineHeight: 1.5 });
      // Could imply specific coloring for numbers in CSS
      document.body.setAttribute('data-mode', 'dyscalculia');
    } else if (selectedMode === 'dysgraphia') {
      // Focus on STT
      setSettings({ ...settings, cursorSize: 'large' });
      if (!isOpen) setIsOpen(true); // Open toolbar to show STT
    } else {
      // Reset
      document.body.style.fontFamily = '';
      document.body.removeAttribute('data-mode');
    }
  };

  // Apply settings to CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--text-scale', settings.textScale);
    root.style.setProperty('--line-height-scale', settings.lineHeight);
    root.style.setProperty('--word-spacing', settings.wordSpacing === 'wide' ? '0.5rem' : 'normal');

    // Theme attributes
    if (settings.highContrast) {
      document.body.setAttribute('data-theme', 'high-contrast');
    } else if (settings.darkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }

    document.body.setAttribute('data-invert', settings.invertColors);
    document.body.setAttribute('data-links-highlight', settings.highlightLinks);
    document.body.setAttribute('data-cursor', settings.cursorSize);

  }, [settings]);

  // TTS Function
  const speakPage = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const text = document.body.innerText;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } else {
      alert("Text-to-Speech not supported in this browser.");
    }
  };

  const toggleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const TooltipButton = ({ onClick, isActive, icon: Icon, label, title }) => (
    <button
      onClick={onClick}
      className={`group relative p-3 rounded-lg flex flex-col items-center justify-center gap-2 transition-all w-full border ${isActive
        ? 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
        }`}
      aria-label={title}
      title={title}
    >
      <Icon size={20} />
      <span className="text-xs font-semibold">{label}</span>

      <span className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-black text-white text-xs px-2 py-1 rounded shadow-lg z-50">
        {title}
      </span>
    </button>
  );

  return (
    <>
      <div
        className={`fixed inset-y-0 right-0 w-80 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto border-l border-gray-200 dark:border-gray-700 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-slate-800 sticky top-0 z-10">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <Settings size={24} className="text-blue-600" />
            Accessibility
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-full transition-colors"
            title="Close Toolbar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">

          {/* Section: Learning Mode / Disease Adaptation */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Learning Mode</h3>
            <div className="grid grid-cols-2 gap-2">
              {['default', 'dyslexia', 'dyscalculia', 'dysgraphia'].map(m => (
                <button
                  key={m}
                  onClick={() => applyMode(m)}
                  className={`px-3 py-2 text-xs font-bold uppercase rounded-lg border ${mode === m
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* AI Tools Container (Only in Dyslexia Mode) */}
          {mode === 'dyslexia' && (
            <div className="space-y-3 bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span> AI Assistants
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 bg-white text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-50 shadow-sm flex flex-col items-center gap-1">
                  <Type size={16} /> Text Simplifier
                </button>
                <button className="p-2 bg-white text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-50 shadow-sm flex flex-col items-center gap-1">
                  <AlignJustify size={16} /> Summarizer
                </button>
                <button className="p-2 bg-white text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-50 shadow-sm flex flex-col items-center gap-1">
                  <Eye size={16} /> OCR Scanner
                </button>
                <button className="p-2 bg-white text-indigo-600 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-50 shadow-sm flex flex-col items-center gap-1">
                  <Volume2 size={16} /> Text to Speech
                </button>
              </div>
            </div>
          )}

          {/* Section: Text Adjustments */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Readability</h3>
            <div className="flex items-center justify-between bg-gray-100 dark:bg-slate-800 p-2 rounded-lg">
              <button
                onClick={() => updateSetting('textScale', Math.max(0.8, settings.textScale - 0.1))}
                className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm"
                title="Decrease Text Size"
              >
                <span className="text-xs font-bold">A-</span>
              </button>
              <span className="font-mono font-bold">{Math.round(settings.textScale * 100)}%</span>
              <button
                onClick={() => updateSetting('textScale', Math.min(2, settings.textScale + 0.1))}
                className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm"
                title="Increase Text Size"
              >
                <span className="text-lg font-bold">A+</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TooltipButton
                onClick={() => updateSetting('lineHeight', settings.lineHeight === 1.5 ? 2 : 1.5)}
                isActive={settings.lineHeight > 1.5}
                icon={AlignJustify}
                label="Spacing"
                title="Increase Line Spacing"
              />
              <TooltipButton
                onClick={() => updateSetting('wordSpacing', settings.wordSpacing === 'normal' ? 'wide' : 'normal')}
                isActive={settings.wordSpacing !== 'normal'}
                icon={Type}
                label="Word Gap"
                title="Increase Word Spacing"
              />
            </div>
          </div>

          {/* Section: Visuals */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Visuals</h3>
            <div className="grid grid-cols-2 gap-3">
              <TooltipButton
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                isActive={settings.highContrast}
                icon={Contrast}
                label="Contrast"
                title="Toggle High Contrast Mode"
              />
              <TooltipButton
                onClick={() => updateSetting('darkMode', !settings.darkMode)}
                isActive={settings.darkMode}
                icon={settings.darkMode ? Sun : Moon}
                label={settings.darkMode ? "Light" : "Dark"}
                title="Toggle Dark Mode"
              />
              <TooltipButton
                onClick={() => updateSetting('invertColors', !settings.invertColors)}
                isActive={settings.invertColors}
                icon={Eye}
                label="Invert"
                title="Invert All Colors"
              />
              <TooltipButton
                onClick={() => updateSetting('highlightLinks', !settings.highlightLinks)}
                isActive={settings.highlightLinks}
                icon={MoveHorizontal}
                label="Links"
                title="Highlight All Links"
              />
            </div>
            <TooltipButton
              onClick={() => updateSetting('cursorSize', settings.cursorSize === 'auto' ? 'large' : 'auto')}
              isActive={settings.cursorSize === 'large'}
              icon={MousePointer}
              label="Large Cursor"
              title="Make Mouse Cursor Larger"
            />
          </div>

          {/* Section: Audio */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Audio Support</h3>
            <div className="grid grid-cols-2 gap-3">
              <TooltipButton
                onClick={speakPage}
                isActive={isSpeaking}
                icon={Volume2}
                label={isSpeaking ? "Stop" : "Read Page"}
                title="Read Page Aloud"
              />
              <TooltipButton
                onClick={toggleVoiceInput}
                isActive={isRecording}
                icon={Mic}
                label={isRecording ? "Listening..." : "Dictate"}
                title="Voice to Text Input (Click input first)"
              />
            </div>
            {sttError && <p className="text-xs text-red-500 font-bold">{sttError}</p>}
            {isRecording && <p className="text-xs text-blue-500 font-bold animate-pulse">Speak now...</p>}
          </div>

          {/* Reset */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setSettings({
                  textScale: 1, lineHeight: 1.5, wordSpacing: 'normal', highContrast: false,
                  darkMode: false, invertColors: false, highlightLinks: false, cursorSize: 'auto'
                });
                setMode('default');
                document.body.removeAttribute('data-mode');
                document.body.style.fontFamily = '';
              }}
              className="w-full py-3 text-sm text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-200"
            >
              Reset All Settings
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default AccessibilityToolbar;
