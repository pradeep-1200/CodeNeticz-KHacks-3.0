import React, { createContext, useContext, useState, useEffect } from 'react';

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

    const updateProfile = (newProfile, completedStatus = true) => {
        setProfile(newProfile);
        setIsPrelimsCompleted(completedStatus);
    };

    return (
        <AdaptiveContext.Provider value={{ profile, isPrelimsCompleted, updateProfile }}>
            {children}
        </AdaptiveContext.Provider>
    );
};
