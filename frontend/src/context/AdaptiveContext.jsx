import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAccessibilityStore } from '../store/accessibilityStore';

const AdaptiveContext = createContext();

export const useAdaptive = () => useContext(AdaptiveContext);

export const AdaptiveProvider = ({ children }) => {
    // Read from localStorage or API initially
    const [profile, setProfile] = useState(localStorage.getItem('learningProfile') || 'DEFAULT');
    const [isPrelimsCompleted, setIsPrelimsCompleted] = useState(
        localStorage.getItem('isPrelimsCompleted') === 'true' || false
    );

    useEffect(() => {
        // Save to localStorage
        localStorage.setItem('learningProfile', profile);
        localStorage.setItem('isPrelimsCompleted', isPrelimsCompleted);

        // Apply global CSS variables based on profile
        const root = document.documentElement;
        if (profile === 'DYSLEXIA') {
            root.style.setProperty('--bg-primary', '#1e102e'); // Dark purple
            root.style.setProperty('--bg-secondary', '#2a1744');
            root.style.setProperty('--text-primary', '#f3e8ff');
            root.style.fontFamily = '"Comic Sans MS", "OpenDyslexic", sans-serif';
        } else if (profile === 'DYSCALCULIA') {
            root.style.setProperty('--bg-primary', '#0f172a'); // Deep blue
            root.style.setProperty('--bg-secondary', '#1e293b');
            root.style.fontFamily = '"Inter", sans-serif';
        } else if (profile === 'DYSGRAPHIA') {
            root.style.setProperty('--bg-primary', '#0f172a'); // Deep blue
            root.style.setProperty('--bg-secondary', '#1e293b');
            root.style.fontFamily = '"Outfit", sans-serif';
        } else {
            // Default token standard
            root.style.removeProperty('--bg-primary');
            root.style.removeProperty('--bg-secondary');
            root.style.removeProperty('--text-primary');
            root.style.fontFamily = '"Outfit", "Inter", sans-serif';
        }
    }, [profile, isPrelimsCompleted]);

    const updateProfile = (rawInput, completedStatus = true) => {
        let normalizedProfile = 'DEFAULT';
        let a11yMode = 'standard';

        const inputStr = (rawInput || '').toLowerCase().replace('_', '-');

        if (inputStr.includes('dyslexia') || inputStr.includes('reading')) {
            normalizedProfile = 'DYSLEXIA';
            a11yMode = 'reading-support';
        } else if (inputStr.includes('dyscalculia') || inputStr.includes('number')) {
            normalizedProfile = 'DYSCALCULIA';
            a11yMode = 'number-support';
        } else if (inputStr.includes('dysgraphia') || inputStr.includes('voice')) {
            normalizedProfile = 'DYSGRAPHIA';
            a11yMode = 'voice-input';
        } else if (inputStr.includes('focus')) {
            normalizedProfile = 'DEFAULT';
            a11yMode = 'focus';
        }

        setProfile(normalizedProfile);
        setIsPrelimsCompleted(completedStatus);

        // B3 FIX: Synchronize with Accessibility Store
        try {
            useAccessibilityStore.getState().setMode(a11yMode);
        } catch (e) {
            console.warn("Could not sync accessibility store mode", e);
        }
    };

    return (
        <AdaptiveContext.Provider value={{ profile, isPrelimsCompleted, updateProfile }}>
            {children}
        </AdaptiveContext.Provider>
    );
};
