import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useGamification } from '../../context/GamificationContext';
import { getLevelsForStudent } from '../../services/api';
import { 
    Star, Lock, Trophy, ArrowLeft, Flame, Heart, Crown, Gift, 
    Check, Play, Sparkles, X, ChevronRight, BookOpen
} from 'lucide-react';

const UNITS = [
    { id: 'easy', number: 1, title: 'Unit 1: Foundation Basics', desc: 'Nouns, Verbs & Word Recognition', color: 'from-emerald-500 to-teal-600', bannerBg: 'bg-emerald-600', badgeColor: 'bg-emerald-500' },
    { id: 'medium', number: 2, title: 'Unit 2: Sentence Structure', desc: 'Syntax, Punctuation & Expression', color: 'from-blue-500 to-indigo-600', bannerBg: 'bg-indigo-600', badgeColor: 'bg-indigo-500' },
    { id: 'hard', number: 3, title: 'Unit 3: Advanced Mastery', desc: 'Complex Comprehension & Fluency', color: 'from-amber-500 to-orange-600', bannerBg: 'bg-amber-600', badgeColor: 'bg-amber-500' }
];

// Alternate X offsets to form an S-curve Duolingo path
const PATH_OFFSETS = [0, 45, 75, 45, 0, -45, -75, -45];

const LevelMap = () => {
    const navigate = useNavigate();
    const { stats } = useGamification();
    const [allLevels, setAllLevels] = useState([]);
    const [levelsByUnit, setLevelsByUnit] = useState({ easy: [], medium: [], hard: [] });
    const [loading, setLoading] = useState(true);
    const [selectedLevel, setSelectedLevel] = useState(null); // For Duolingo popup modal

    const completedLevels = stats?.completedLevels || [];
    const currentXp = stats?.xp || 0;
    const currentStreak = stats?.streak || 0;

    useEffect(() => {
        const fetchLevels = async () => {
            try {
                const data = await getLevelsForStudent();
                const levels = (data?.levels && data.levels.length > 0) ? data.levels : getFallbackLevels();
                setAllLevels(levels);

                const grouped = { easy: [], medium: [], hard: [] };
                levels.forEach(level => {
                    const tier = level.difficulty || 'easy';
                    if (!grouped[tier]) grouped[tier] = [];
                    grouped[tier].push(level);
                });
                setLevelsByUnit(grouped);
            } catch (err) {
                console.error('Failed to load map levels', err);
                const fallback = getFallbackLevels();
                setAllLevels(fallback);
                const grouped = { easy: [], medium: [], hard: [] };
                fallback.forEach(l => { const t = l.difficulty || 'easy'; if (!grouped[t]) grouped[t] = []; grouped[t].push(l); });
                setLevelsByUnit(grouped);
            } finally {
                setLoading(false);
            }
        };
        fetchLevels();
    }, []);

    const getFallbackLevels = () => [
        { _id: 'f1', title: 'Basics of Nouns', description: 'Identify common and proper nouns in context', difficulty: 'easy', tasks: [{}, {}], xpReward: 500 },
        { _id: 'f2', title: 'Action Verbs', description: 'Master verbs through reading and voice dictation', difficulty: 'easy', tasks: [{}], xpReward: 500 },
        { _id: 'f3', title: 'Sentence Building', description: 'Construct well-structured sentences', difficulty: 'medium', tasks: [{}, {}, {}], xpReward: 600 },
        { _id: 'f4', title: 'Word Patterns', description: 'Find patterns and expand your vocabulary', difficulty: 'medium', tasks: [{}, {}], xpReward: 600 },
        { _id: 'f5', title: 'Advanced Grammar', description: 'Master complex syntax and comprehension', difficulty: 'hard', tasks: [{}, {}, {}], xpReward: 800 },
        { _id: 'f6', title: 'Effective Speaking', description: 'Practice voice expression and fluency', difficulty: 'hard', tasks: [{}, {}], xpReward: 800 }
    ];

    const isLevelCompleted = (levelId) => {
        if (!levelId) return false;
        return completedLevels.includes(levelId.toString()) || completedLevels.includes(parseInt(levelId));
    };

    const isLevelUnlocked = (globalIdx) => {
        if (globalIdx === 0) return true;
        const prevLevel = allLevels[globalIdx - 1];
        if (!prevLevel) return true;
        const prevId = prevLevel._id?.toString() || prevLevel.id?.toString();
        return completedLevels.includes(prevId) || completedLevels.includes(parseInt(prevId));
    };

    const totalCompletedCount = allLevels.filter(l => isLevelCompleted(l._id || l.id)).length;

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-emerald-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] pb-32 transition-colors duration-300 font-sans">
            <Navbar />

            {/* ── Duolingo Sticky Top Gamified Header ── */}
            <div className="sticky top-[73px] z-30 bg-[var(--bg-surface)]/95 backdrop-blur-md border-b-2 border-[var(--border-color)] shadow-sm">
                <div className="container mx-auto max-w-xl px-4 py-3 flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/student/dashboard')} 
                        className="p-2.5 rounded-2xl bg-[var(--bg-base)] border-2 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-emerald-600 transition-all hover:scale-105"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Hearts / Lives */}
                        <div className="flex items-center gap-1.5 bg-rose-500/10 px-3 py-1.5 rounded-2xl border-2 border-rose-500/20">
                            <Heart size={18} className="text-rose-500 fill-rose-500" />
                            <span className="font-black text-rose-600 dark:text-rose-400 text-sm">5</span>
                        </div>

                        {/* Streak */}
                        <div className="flex items-center gap-1.5 bg-orange-500/10 px-3 py-1.5 rounded-2xl border-2 border-orange-500/20">
                            <Flame size={18} className="text-orange-500 fill-orange-500" />
                            <span className="font-black text-orange-600 dark:text-orange-400 text-sm">{currentStreak}</span>
                        </div>

                        {/* XP */}
                        <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-2xl border-2 border-amber-500/20">
                            <Star size={18} className="text-amber-500 fill-amber-500" />
                            <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{currentXp}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Duolingo Winding Path Container ── */}
            <div className="container mx-auto max-w-xl px-4 pt-6 flex flex-col items-center">

                {UNITS.map((unit) => {
                    const unitLevels = levelsByUnit[unit.id] || [];
                    if (unitLevels.length === 0) return null;

                    return (
                        <div key={unit.id} className="w-full mb-12 flex flex-col items-center">

                            {/* ── Duolingo Unit Header Banner ── */}
                            <div className={`w-full ${unit.bannerBg} text-white p-6 rounded-3xl shadow-xl mb-12 relative overflow-hidden border-b-8 border-black/20`}>
                                <div className="flex items-center justify-between relative z-10">
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full border border-white/20">
                                            SECTION {unit.number}
                                        </span>
                                        <h2 className="text-2xl font-black tracking-tight mt-2">{unit.title}</h2>
                                        <p className="text-xs text-white/90 font-medium mt-1">{unit.desc}</p>
                                    </div>
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border-2 border-white/30 shrink-0">
                                        <Crown size={28} className="text-amber-300 fill-amber-300" />
                                    </div>
                                </div>
                            </div>

                            {/* ── Path Nodes Sequence ── */}
                            <div className="w-full flex flex-col items-center gap-8 relative py-2">

                                {unitLevels.map((level, idx) => {
                                    const levelId = level._id || level.id || idx;
                                    const globalIndex = allLevels.findIndex(l => (l._id || l.id) === levelId);
                                    const unlocked = isLevelUnlocked(globalIndex >= 0 ? globalIndex : idx);
                                    const completed = isLevelCompleted(levelId);
                                    const isCurrent = unlocked && !completed;
                                    const xOffset = PATH_OFFSETS[globalIndex % PATH_OFFSETS.length];

                                    return (
                                        <div 
                                            key={levelId}
                                            className="relative flex flex-col items-center"
                                            style={{ transform: `translateX(${xOffset}px)` }}
                                        >
                                            {/* Floating START Speech Bubble above active node */}
                                            {isCurrent && (
                                                <div className="absolute -top-12 z-20 animate-bounce">
                                                    <div className="bg-emerald-500 text-white text-xs font-black px-4 py-1.5 rounded-2xl shadow-lg uppercase tracking-wider border-2 border-emerald-400 flex items-center gap-1">
                                                        <Sparkles size={14} /> START HERE
                                                    </div>
                                                    <div className="w-3 h-3 bg-emerald-500 rotate-45 mx-auto -mt-1.5 border-r-2 border-b-2 border-emerald-400" />
                                                </div>
                                            )}

                                            {/* Duolingo 3D Circular Node Button */}
                                            <button
                                                onClick={() => unlocked && setSelectedLevel({ ...level, globalIndex, unlocked, completed })}
                                                disabled={!unlocked}
                                                className={`
                                                    w-20 h-20 rounded-full flex items-center justify-center relative transition-all duration-200
                                                    ${completed 
                                                        ? 'bg-amber-400 hover:bg-amber-300 border-b-8 border-amber-600 active:border-b-0 active:translate-y-2 shadow-amber-500/40 text-amber-950' 
                                                        : isCurrent 
                                                            ? 'bg-emerald-500 hover:bg-emerald-400 border-b-8 border-emerald-700 active:border-b-0 active:translate-y-2 shadow-emerald-500/50 text-white animate-pulse-glow' 
                                                            : 'bg-slate-200 dark:bg-slate-800 border-b-8 border-slate-300 dark:border-slate-900 text-slate-400 cursor-not-allowed opacity-75'
                                                    }
                                                    shadow-2xl border-4 border-white/20
                                                `}
                                            >
                                                {completed ? (
                                                    <Check size={36} strokeWidth={4} className="text-amber-950" />
                                                ) : !unlocked ? (
                                                    <Lock size={26} className="text-slate-400 dark:text-slate-600" />
                                                ) : (
                                                    <Star size={34} fill="currentColor" className="text-white drop-shadow-md" />
                                                )}

                                                {/* Node Index Badge */}
                                                <div className="absolute -bottom-1 -right-1 bg-black/70 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                                                    {globalIndex + 1}
                                                </div>
                                            </button>

                                            {/* Node Label Below */}
                                            <div className="mt-2 text-center max-w-[120px]">
                                                <span className={`text-xs font-extrabold leading-tight block ${unlocked ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] opacity-50'}`}>
                                                    {level.title}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Gift / Treasure Chest Milestone Node after unit */}
                                <div className="relative mt-4" style={{ transform: 'translateX(0px)' }}>
                                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-500 border-b-8 border-amber-700 flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-all text-amber-950">
                                        <Gift size={28} />
                                    </div>
                                    <span className="text-[10px] font-extrabold text-[var(--text-secondary)] block text-center mt-1 uppercase tracking-wider">
                                        Reward Box
                                    </span>
                                </div>

                            </div>
                        </div>
                    );
                })}

                {/* Path Finish Trophy */}
                <div className="mt-12 text-center space-y-3">
                    <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500 rounded-full flex items-center justify-center border-4 border-amber-300 shadow-2xl animate-bounce">
                        <Trophy size={40} className="text-white fill-white" />
                    </div>
                    <h3 className="font-black text-lg text-[var(--text-primary)]">You're on Fire!</h3>
                    <p className="text-xs text-[var(--text-secondary)] font-medium">Keep completing daily levels to unlock new units!</p>
                </div>

            </div>

            {/* ── Duolingo Style Level Pop-up Modal ── */}
            {selectedLevel && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[var(--bg-surface)] border-2 border-[var(--border-color)] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 animate-zoom-in relative">
                        <button 
                            onClick={() => setSelectedLevel(null)}
                            className="absolute top-4 right-4 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-full hover:bg-[var(--bg-base)]"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-lg flex items-center justify-center border border-emerald-500/20">
                                #{selectedLevel.globalIndex + 1}
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                                    {selectedLevel.difficulty || 'Easy'} Level
                                </span>
                                <h3 className="text-lg font-black text-[var(--text-primary)] leading-snug">
                                    {selectedLevel.title}
                                </h3>
                            </div>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)] font-medium leading-relaxed bg-[var(--bg-base)] p-3.5 rounded-2xl border border-[var(--border-color)]">
                            {selectedLevel.description || 'Complete all tasks to earn XP rewards and progress on your path.'}
                        </p>

                        <div className="flex justify-between items-center px-1 text-xs font-bold text-[var(--text-secondary)]">
                            <span className="flex items-center gap-1">
                                <BookOpen size={14} className="text-indigo-500" /> {selectedLevel.tasks?.length || 0} Tasks
                            </span>
                            <span className="flex items-center gap-1 text-amber-500 font-extrabold">
                                <Star size={14} fill="currentColor" /> +{Math.round((selectedLevel.xpReward || 500) * (selectedLevel.xpMultiplier || 1.0))} XP
                            </span>
                        </div>

                        {selectedLevel.completed ? (
                            <div className="w-full py-4 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl font-black text-center text-sm border border-amber-500/30 flex items-center justify-center gap-2">
                                <Check size={20} strokeWidth={3} /> COMPLETED & MASTERED!
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    const id = selectedLevel._id || selectedLevel.id;
                                    setSelectedLevel(null);
                                    navigate(`/student/play/${id}`);
                                }}
                                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-base shadow-xl shadow-emerald-500/30 border-b-8 border-emerald-700 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <Play size={20} fill="currentColor" /> START LEVEL
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LevelMap;
