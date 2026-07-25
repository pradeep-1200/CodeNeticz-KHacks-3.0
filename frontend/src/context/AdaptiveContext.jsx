import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccessibilityStore } from '../store/accessibilityStore';

const AdaptiveContext = createContext();

export const useAdaptive = () => useContext(AdaptiveContext);

export const AdaptiveProvider = ({ children }) => {
    // Legacy single-string profile (backward compat)
    const [profile, setProfile] = useState(localStorage.getItem('learningProfile') || 'DEFAULT');
    const [isPrelimsCompleted, setIsPrelimsCompleted] = useState(
        localStorage.getItem('isPrelimsCompleted') === 'true' || false
    );

    // Phase 1: per-domain support-profile vector {reading, writing, math}
    const [supportProfile, setSupportProfile] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('supportProfile')) || { reading: 'none', writing: 'none', math: 'none' };
        } catch { return { reading: 'none', writing: 'none', math: 'none' }; }
    });

    // Phase 1: accessibility preferences from prelims preference section
    const [accessibilityPrefs, setAccessibilityPrefs] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('accessibilityPrefs')) || { fontSize: 'normal', contrast: 'normal', readAloud: false };
        } catch { return { fontSize: 'normal', contrast: 'normal', readAloud: false }; }
    });

    // Apply CSS and preferences whenever profile or prefs change
    useEffect(() => {
        localStorage.setItem('learningProfile', profile);
        localStorage.setItem('isPrelimsCompleted', isPrelimsCompleted);
        localStorage.setItem('supportProfile', JSON.stringify(supportProfile));
        localStorage.setItem('accessibilityPrefs', JSON.stringify(accessibilityPrefs));

        const root = document.documentElement;

        // ── Font size preference ──────────────────────────────────
        if (accessibilityPrefs.fontSize === 'large') {
            root.style.setProperty('--font-size-base', '18px');
            root.style.setProperty('--font-size-question', '22px');
        } else {
            root.style.setProperty('--font-size-base', '16px');
            root.style.setProperty('--font-size-question', '18px');
        }

        // ── Contrast preference ───────────────────────────────────
        if (accessibilityPrefs.contrast === 'high') {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }

        // ── Profile-based CSS ─────────────────────────────────────
        if (profile === 'DYSLEXIA' || profile === 'READING_SUPPORT') {
            root.style.setProperty('--bg-primary', '#1e102e');
            root.style.setProperty('--bg-secondary', '#2a1744');
            root.style.setProperty('--text-primary', '#f3e8ff');
            root.style.fontFamily = '"Comic Sans MS", "OpenDyslexic", sans-serif';
        } else if (profile === 'DYSCALCULIA' || profile === 'NUMBER_SUPPORT') {
            root.style.setProperty('--bg-primary', '#0f172a');
            root.style.setProperty('--bg-secondary', '#1e293b');
            root.style.fontFamily = '"Inter", sans-serif';
        } else if (profile === 'DYSGRAPHIA' || profile === 'VOICE_INPUT') {
            root.style.setProperty('--bg-primary', '#0f172a');
            root.style.setProperty('--bg-secondary', '#1e293b');
            root.style.fontFamily = '"Outfit", sans-serif';
        } else {
            root.style.removeProperty('--bg-primary');
            root.style.removeProperty('--bg-secondary');
            root.style.removeProperty('--text-primary');
            root.style.fontFamily = '"Outfit", "Inter", sans-serif';
        }
    }, [profile, isPrelimsCompleted, supportProfile, accessibilityPrefs]);

    /**
     * updateProfile — called after prelims submit.
     * Accepts full prelims result object or legacy string.
     * 
     * @param {string|object} rawInput - Legacy profile string OR full prelims result
     *   Full object shape: { legacyProfile, supportProfile, accessibilityPrefs }
     * @param {boolean} completedStatus - Whether prelims is now completed
     */
    const updateProfile = (rawInput, completedStatus = true) => {
        // Handle full prelims result object (Phase 1 new format)
        if (rawInput && typeof rawInput === 'object' && rawInput.supportProfile) {
            setSupportProfile(rawInput.supportProfile);
            if (rawInput.accessibilityPrefs) setAccessibilityPrefs(rawInput.accessibilityPrefs);

            // Derive legacy profile from result
            const legacy = rawInput.legacyProfile || 'DEFAULT';
            setProfile(legacy);
            setIsPrelimsCompleted(completedStatus);

            // Sync with accessibility store
            try {
                const modeMap = {
                    READING_SUPPORT: 'reading-support',
                    NUMBER_SUPPORT: 'number-support',
                    VOICE_INPUT: 'voice-input',
                    FOCUS: 'focus',
                    DEFAULT: 'standard'
                };
                useAccessibilityStore.getState().setMode(modeMap[legacy] || 'standard');
            } catch (e) {
                console.warn('Could not sync accessibility store mode', e);
            }
            return;
        }

        // Legacy string format (backward compat)
        let normalizedProfile = 'DEFAULT';
        let a11yMode = 'standard';

        const inputStr = (rawInput || '').toLowerCase().replace('_', '-');

        if (inputStr.includes('dyslexia') || inputStr.includes('reading')) {
            normalizedProfile = 'READING_SUPPORT';
            a11yMode = 'reading-support';
        } else if (inputStr.includes('dyscalculia') || inputStr.includes('number')) {
            normalizedProfile = 'NUMBER_SUPPORT';
            a11yMode = 'number-support';
        } else if (inputStr.includes('dysgraphia') || inputStr.includes('voice')) {
            normalizedProfile = 'VOICE_INPUT';
            a11yMode = 'voice-input';
        } else if (inputStr.includes('focus')) {
            normalizedProfile = 'DEFAULT';
            a11yMode = 'focus';
        }

        setProfile(normalizedProfile);
        setIsPrelimsCompleted(completedStatus);

        try {
            useAccessibilityStore.getState().setMode(a11yMode);
        } catch (e) {
            console.warn('Could not sync accessibility store mode', e);
        }
    };

    return (
        <AdaptiveContext.Provider value={{
            profile,
            isPrelimsCompleted,
            supportProfile,
            accessibilityPrefs,
            updateProfile
        }}>
            {children}
        </AdaptiveContext.Provider>
    );
};
