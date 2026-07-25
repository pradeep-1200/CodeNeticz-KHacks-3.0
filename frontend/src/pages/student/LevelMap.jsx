import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useGamification } from '../../context/GamificationContext';
import { getLevels } from '../../services/api';
import { Star, Lock, Trophy, ChevronLeft } from 'lucide-react';

const LevelMap = () => {
    const navigate = useNavigate();
    const { stats } = useGamification();
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);

    const completedLevels = stats?.completedLevels || [];
    const currentXp = stats?.xp || 0;

    useEffect(() => {
        const fetchLevels = async () => {
            try {
                const data = await getLevels();
                if (data && data.levels && data.levels.length > 0) {
                    setLevels(data.levels);
                } else if (Array.isArray(data) && data.length > 0) {
                    setLevels(data);
                } else {
                    // Fallback Mock Data
                    setLevels([
                        { _id: '1', title: 'Basics of Nouns', description: 'Start your journey', difficulty: 'easy' },
                        { _id: '2', title: 'Action Verbs', description: 'Moving forward', difficulty: 'easy' },
                        { _id: '3', title: 'Sentence Building', description: 'Constructing thoughts', difficulty: 'medium' },
                        { _id: '4', title: 'Advanced Grammar', description: 'Mastering the rules', difficulty: 'hard' },
                        { _id: '5', title: 'Effective Speaking', description: 'Voice your ideas', difficulty: 'hard' }
                    ]);
                }
            } catch (err) {
                console.error("Failed to load map levels", err);
                setLevels([
                    { _id: '1', title: 'Basics of Nouns', description: 'Start your journey', difficulty: 'easy' },
                    { _id: '2', title: 'Action Verbs', description: 'Moving forward', difficulty: 'easy' },
                    { _id: '3', title: 'Sentence Building', description: 'Constructing thoughts', difficulty: 'medium' },
                    { _id: '4', title: 'Advanced Grammar', description: 'Mastering the rules', difficulty: 'hard' },
                    { _id: '5', title: 'Effective Speaking', description: 'Voice your ideas', difficulty: 'hard' }
                ]);
            } finally {
                setLoading(false);
            }
        };
        fetchLevels();
    }, []);

    const isLevelUnlocked = (index) => {
        if (index === 0) return true; // Level 1 always unlocked
        const prevLevel = levels[index - 1];
        if (!prevLevel) return true;
        const prevLevelId = prevLevel._id || prevLevel.id;
        if (!prevLevelId) return true;
        return completedLevels.includes(prevLevelId.toString()) || completedLevels.includes(parseInt(prevLevelId));
    };

    const isLevelCompleted = (levelId) => {
        if (!levelId) return false;
        return completedLevels.includes(levelId.toString()) || completedLevels.includes(parseInt(levelId));
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pb-20 relative overflow-hidden transition-colors">
            <Navbar />

            {/* Header */}
            <div className="sticky top-[73px] z-30 bg-[var(--bg-surface)]/90 backdrop-blur-md border-b border-[var(--border-color)] p-4 shadow-sm">
                <div className="container mx-auto max-w-lg flex items-center justify-between">
                    <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-[var(--bg-base)] rounded-full text-[var(--text-secondary)]">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
                        <Star size={16} className="text-amber-500 fill-amber-500" />
                        <span className="font-extrabold text-amber-600 dark:text-amber-400 text-sm">{currentXp} XP</span>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="container mx-auto max-w-lg pt-12 px-4 relative min-h-[80vh]">

                {/* Winding Path SVG Line */}
                <svg className="absolute top-20 left-1/2 -translate-x-1/2 h-full w-[200px] pointer-events-none z-0 opacity-30" style={{ height: `${(levels || []).length * 140}px` }}>
                    <path
                        d={`M 100 0 ${(levels || []).map((_, i) => {
                            const offset = (i % 2 === 0) ? -60 : 60;
                            return `Q ${100 + offset} ${i * 140 + 70}, 100 ${(i + 1) * 140}`;
                        }).join(' ')}`}
                        fill="none"
                        stroke="var(--color-primary)"
                        strokeWidth="8"
                        strokeDasharray="12 12"
                        strokeLinecap="round"
                    />
                </svg>

                <div className="space-y-8 relative z-10 flex flex-col items-center pb-32">
                    {(levels || []).map((level, index) => {
                        const levelId = level._id || level.id || index;
                        const unlocked = isLevelUnlocked(index);
                        const completed = isLevelCompleted(levelId);
                        const current = unlocked && !completed;

                        const offsetX = (index % 2 === 0) ? '-20px' : '20px';

                        return (
                            <div
                                key={levelId}
                                className="relative flex flex-col items-center card-hover-lift"
                                style={{
                                    transform: `translateX(${offsetX})`,
                                    marginTop: index === 0 ? '0' : '40px'
                                }}
                            >
                                <button
                                    onClick={() => unlocked && navigate(`/student/play/${levelId}`)}
                                    disabled={!unlocked}
                                    className={`
                                        w-24 h-22 rounded-[2rem] flex items-center justify-center relative transition-all duration-300 transform
                                        ${completed
                                            ? 'bg-amber-500 border-b-8 border-amber-700 hover:scale-105 shadow-amber-500/30'
                                            : current
                                                ? 'bg-emerald-500 border-b-8 border-emerald-700 hover:scale-105 animate-pulse-glow shadow-emerald-500/30'
                                                : 'bg-slate-700 border-b-8 border-slate-800 cursor-not-allowed opacity-70'
                                        }
                                        shadow-2xl
                                    `}
                                    style={{ width: '88px', height: '80px' }}
                                >
                                    <div className="relative z-10">
                                        {completed ? (
                                            <Trophy size={36} className="text-amber-100 drop-shadow-md" fill="currentColor" />
                                        ) : !unlocked ? (
                                            <Lock size={32} className="text-slate-400/50" />
                                        ) : (
                                            <Star size={40} className="text-white drop-shadow-md" fill="currentColor" />
                                        )}
                                    </div>

                                    {completed && (
                                        <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-950 text-xs font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm z-20">
                                            3/3
                                        </div>
                                    )}

                                    {current && (
                                        <div className="absolute -top-10 bg-white text-emerald-600 px-3 py-1 rounded-xl font-black text-xs uppercase tracking-wide shadow-lg border-2 border-emerald-500">
                                            START
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                                        </div>
                                    )}
                                </button>

                                <div className="mt-3 text-center">
                                    <h3 className={`font-extrabold text-sm ${unlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                        Level {index + 1}
                                    </h3>
                                    <p className={`text-xs max-w-[120px] leading-tight font-medium ${unlocked ? 'text-[var(--text-primary)] opacity-80' : 'text-[var(--text-secondary)] opacity-60'}`}>
                                        {level.title}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    <div className="mt-12 text-center opacity-50">
                        <div className="w-20 h-20 mx-auto bg-[var(--bg-surface)] rounded-full flex items-center justify-center border-4 border-[var(--border-color)] mb-3">
                            <Lock size={28} className="text-[var(--text-secondary)]" />
                        </div>
                        <p className="text-[var(--text-secondary)] font-extrabold text-xs">More levels coming soon!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LevelMap;
