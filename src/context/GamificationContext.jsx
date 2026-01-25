import React, { createContext, useContext, useState, useEffect } from 'react';

const GamificationContext = createContext();

export const GamificationProvider = ({ children }) => {
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('aclc_game_stats');
        return saved ? JSON.parse(saved) : {
            xp: 0,
            level: 1,
            streak: 0,
            lastPlayed: null,
            badges: [],
            unlockedThemes: ['default'],
            completedLevels: []
        };
    });

    useEffect(() => {
        localStorage.setItem('aclc_game_stats', JSON.stringify(stats));
    }, [stats]);

    const addXP = (amount) => {
        setStats(prev => {
            const newXP = prev.xp + amount;
            const newLevel = Math.floor(newXP / 1000) + 1;

            // Check for level up badge
            const newBadges = [...prev.badges];
            if (newLevel > prev.level && !newBadges.includes(`Level ${newLevel}`)) {
                newBadges.push(`Level ${newLevel}`);
            }

            return {
                ...prev,
                xp: newXP,
                level: newLevel,
                badges: newBadges
            };
        });
    };

    const updateStreak = () => {
        const today = new Date().toDateString();
        if (stats.lastPlayed === today) return;

        setStats(prev => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const wasYesterday = prev.lastPlayed === yesterday.toDateString();

            return {
                ...prev,
                streak: wasYesterday ? prev.streak + 1 : 1,
                lastPlayed: today
            };
        });
    };

    const completeLevel = (levelId, score = 0) => {
        if (!stats.completedLevels.includes(levelId)) {
            setStats(prev => ({
                ...prev,
                completedLevels: [...prev.completedLevels, levelId]
            }));
            addXP(500); // Standard XP for completing a level
            updateStreak();
        }
    };

    return (
        <GamificationContext.Provider value={{ stats, addXP, updateStreak, completeLevel }}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) {
        return {
            stats: { xp: 0, level: 1, streak: 0, completedLevels: [] },
            addXP: () => { },
            updateStreak: () => { },
            completeLevel: () => { }
        };
    }
    return context;
};
