import React, { useState, useEffect } from 'react';
import { 
  Settings, Type, Sun, Moon, Eye, MousePointer, Volume2, Mic, 
  ZoomIn, ZoomOut, AlignJustify, MoveHorizontal, Contrast, X 
} from 'lucide-react';

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

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);

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

  // STT Stub (Visual Only for now as per instructions "UI hooks only")
  const toggleVoiceInput = () => {
    setIsListening(!isListening);
    if (!isListening) {
      alert("Voice Input Activated (Mock) - Start speaking...");
    } else {
      alert("Voice Input Stopped.");
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-24 right-0 z-50 p-3 bg-blue-600 text-white rounded-l-xl shadow-lg hover:bg-blue-700 transition-all"
        aria-label="Open Accessibility Tools"
        title="Accessibility Tools"
      >
        <Settings size={24} />
      </button>

      {/* Toolbar Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800 dark:text-white">
            <Settings size={20} /> Accessibility
          </h2>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-slate-800 rounded">
            <X size={24} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          
          {/* Text Size */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Type size={16} /> Text Size
            </label>
            <div className="flex gap-2">
              <button onClick={() => updateSetting('textScale', Math.max(0.8, settings.textScale - 0.1))} className="flex-1 p-2 bg-gray-100 dark:bg-slate-800 rounded hover:bg-gray-200 dark:hover:bg-slate-700">A-</button>
              <span className="p-2 w-12 text-center bg-gray-50 dark:bg-slate-900 border rounded">{Math.round(settings.textScale * 100)}%</span>
              <button onClick={() => updateSetting('textScale', Math.min(2, settings.textScale + 0.1))} className="flex-1 p-2 bg-gray-100 dark:bg-slate-800 rounded hover:bg-gray-200 dark:hover:bg-slate-700">A+</button>
            </div>
          </div>

          {/* Line Height & Spacing */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <AlignJustify size={16} /> Spacing
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => updateSetting('lineHeight', settings.lineHeight === 1.5 ? 2 : 1.5)}
                className={`p-2 rounded border ${settings.lineHeight > 1.5 ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-100 border-transparent dark:bg-slate-800 dark:text-white'}`}
              >
                Line Height
              </button>
              <button 
                onClick={() => updateSetting('wordSpacing', settings.wordSpacing === 'normal' ? 'wide' : 'normal')}
                className={`p-2 rounded border ${settings.wordSpacing !== 'normal' ? 'bg-blue-100 border-blue-500 text-blue-800' : 'bg-gray-100 border-transparent dark:bg-slate-800 dark:text-white'}`}
              >
                Word Space
              </button>
            </div>
          </div>

          {/* Contrast & Theme */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Sun size={16} /> Display
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => updateSetting('darkMode', !settings.darkMode)}
                className={`p-2 rounded flex items-center justify-center gap-2 ${settings.darkMode ? 'bg-slate-800 text-white border border-slate-600' : 'bg-gray-100 text-black'}`}
              >
                <Moon size={16} /> Dark Mode
              </button>
              <button 
                onClick={() => updateSetting('highContrast', !settings.highContrast)}
                className={`p-2 rounded flex items-center justify-center gap-2 ${settings.highContrast ? 'bg-black text-yellow-400 border-2 border-yellow-400' : 'bg-gray-100 text-black'}`}
              >
                <Contrast size={16} /> Contrast
              </button>
            </div>
             <button 
                onClick={() => updateSetting('invertColors', !settings.invertColors)}
                className={`w-full p-2 mt-2 rounded flex items-center justify-center gap-2 ${settings.invertColors ? 'bg-purple-600 text-white' : 'bg-gray-100 text-black dark:bg-slate-800 dark:text-white'}`}
              >
                <Eye size={16} /> Invert Colors
              </button>
          </div>

          {/* Visual Aids */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <MousePointer size={16} /> Visual Aids
            </label>
            <div className="grid grid-cols-1 gap-2">
               <button 
                onClick={() => updateSetting('highlightLinks', !settings.highlightLinks)}
                className={`p-2 rounded flex items-center gap-2 ${settings.highlightLinks ? 'bg-yellow-200 text-black border-yellow-500' : 'bg-gray-100 text-black dark:bg-slate-800 dark:text-white'}`}
              >
                <MoveHorizontal size={16} /> Highlight Links
              </button>
               <button 
                onClick={() => updateSetting('cursorSize', settings.cursorSize === 'auto' ? 'large' : 'auto')}
                className={`p-2 rounded flex items-center gap-2 ${settings.cursorSize === 'large' ? 'bg-blue-100 text-blue-800 border-blue-500' : 'bg-gray-100 text-black dark:bg-slate-800 dark:text-white'}`}
              >
                <MousePointer size={16} /> Big Cursor
              </button>
            </div>
          </div>

           {/* Audio Support */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Volume2 size={16} /> Audio Support
            </label>
            <div className="grid grid-cols-2 gap-2">
               <button 
                onClick={speakPage}
                className={`p-2 rounded flex items-center justify-center gap-2 ${isSpeaking ? 'bg-green-100 text-green-800 border-green-500' : 'bg-gray-100 text-black dark:bg-slate-800 dark:text-white'}`}
              >
                <Volume2 size={16} /> {isSpeaking ? 'Stop' : 'Read'}
              </button>
               <button 
                onClick={toggleVoiceInput}
                className={`p-2 rounded flex items-center justify-center gap-2 ${isListening ? 'bg-red-100 text-red-800 border-red-500 animal-pulse' : 'bg-gray-100 text-black dark:bg-slate-800 dark:text-white'}`}
              >
                <Mic size={16} /> Dictate
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <button 
              onClick={() => setSettings({
                textScale: 1, lineHeight: 1.5, wordSpacing: 'normal', highContrast: false, 
                darkMode: false, invertColors: false, highlightLinks: false, cursorSize: 'auto'
              })}
              className="text-sm text-red-500 hover:underline"
            >
              Reset All Text Settings
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default AccessibilityToolbar;
