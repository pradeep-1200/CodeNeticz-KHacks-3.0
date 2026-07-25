import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { getDashboardData, completeLevelApi } from '../services/api';

// ── Motivational quote banks ─────────────────────────────────
const STREAK_QUOTES = [
    "You're on fire! Consistency is the key to mastery. Keep going!",
    "Another day, another step forward. Your streak is growing strong!",
    "Incredible discipline! Every day you learn, you become unstoppable.",
    "Streak extended! Champions are made through daily effort — and that's YOU.",
    "Day by day, step by step. Your dedication is truly inspiring!",
    "You showed up today — that's more than most people do. Proud of you!",
    "Streak growing! You're building a habit that will change your life.",
    "Consistency beats perfection. You're proof of that every single day!"
];

const STREAK_LOST_QUOTES = [
    "Streak lost — but that's okay! Every champion falls. What matters is getting back up.",
    "Missing a day doesn't erase your progress. Start fresh today and rebuild!",
    "Setbacks are setups for comebacks. A new streak begins RIGHT NOW!",
    "It's okay! Even the best learners miss a day. Today is a brand new start.",
    "Streak reset — but your knowledge never resets. Jump back in today!",
    "Don't give up! One missed day is just a bump, not the end of the road.",
    "You've come so far. A new streak starting today is a new opportunity to shine!"
];

const randomQuote = (arr) => arr[Math.floor(Math.random() * arr.length)];

const GamificationContext = createContext();

export const GamificationProvider = ({ children }) => {
    const [stats, setStats] = useState(() => {
        const saved = localStorage.getItem('aclc_game_stats');
        return saved ? JSON.parse(saved) : {
            xp: 0,
            level: 1,
            streak: 0,
            lastStreakDate: null,
            badges: [],
            unlockedThemes: ['default'],
            completedLevels: []
        };
    });

    // Toast ref — PlayLevel registers the toast handler after mount
    const toastRef = useRef(null);
    const registerToast = (toastFns) => { toastRef.current = toastFns; };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardData();
                if (data && data.profile) {
                    setStats(prev => ({
                        ...prev,
                        xp:              data.profile.xp,
                        level:           data.profile.level,
                        streak:          data.profile.streak,
                        lastStreakDate:   data.profile.lastStreakDate || prev.lastStreakDate,
                        completedLevels: data.profile.completedLevels || prev.completedLevels || []
                    }));
                }
            } catch (err) {
                console.error("Failed to load gamification stats from backend", err);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        localStorage.setItem('aclc_game_stats', JSON.stringify(stats));
    }, [stats]);

    const addXP = (amount) => {
        setStats(prev => {
            const newXP    = prev.xp + amount;
            const newLevel = Math.floor(newXP / 1000) + 1;
            const newBadges = [...prev.badges];
            if (newLevel > prev.level && !newBadges.includes(`Level ${newLevel}`)) {
                newBadges.push(`Level ${newLevel}`);
            }
            return { ...prev, xp: newXP, level: newLevel, badges: newBadges };
        });
    };

    const completeLevel = async (levelOrId, xpReward = 500, accuracy = 100, xpMultiplier = 1.0) => {
        const levelId = typeof levelOrId === 'object' ? (levelOrId._id || levelOrId.id) : levelOrId;
        const title   = typeof levelOrId === 'object' ? levelOrId.title : undefined;
        const strId   = levelId ? levelId.toString() : '';

        if (!strId) return;

        try {
            const res = await completeLevelApi({ levelId: strId, title, xpReward, accuracy, xpMultiplier });

            if (res.success) {
                setStats(prev => ({
                    ...prev,
                    xp:              res.xp             !== undefined ? res.xp             : prev.xp,
                    level:           res.level          !== undefined ? res.level          : prev.level,
                    streak:          res.streak         !== undefined ? res.streak         : prev.streak,
                    lastStreakDate:  res.lastStreakDate  !== undefined ? res.lastStreakDate : prev.lastStreakDate,
                    completedLevels: res.completedLevels || (prev.completedLevels.includes(strId)
                        ? prev.completedLevels
                        : [...prev.completedLevels, strId])
                }));

                // ── Fire streak toast quotes ──────────────────────────
                if (toastRef.current && !res.alreadyCompleted) {
                    if (res.streakGained) {
                        toastRef.current.success(
                            `${res.streak}-Day Streak! ${randomQuote(STREAK_QUOTES)}`
                        );
                    } else if (res.streakLost) {
                        toastRef.current.warning(
                            randomQuote(STREAK_LOST_QUOTES)
                        );
                    }
                }
                // ─────────────────────────────────────────────────────
            }
        } catch (err) {
            console.error('Failed to sync level completion to backend', err);
        }
    };

    return (
        <GamificationContext.Provider value={{ stats, addXP, completeLevel, registerToast }}>
            {children}
        </GamificationContext.Provider>
    );
};

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) {
        return {
            stats: { xp: 0, level: 1, streak: 0, completedLevels: [] },
            addXP:          () => {},
            completeLevel:  () => {},
            registerToast:  () => {}
        };
    }
    return context;
};
