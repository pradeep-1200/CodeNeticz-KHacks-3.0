import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useGamification } from '../../context/GamificationContext';
import { Star, Lock, Check, Trophy, ChevronLeft } from 'lucide-react';

const LevelMap = () => {
    const navigate = useNavigate();
    const { stats } = useGamification();
    const [levels, setLevels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLevels = async () => {
            try {
                // Fetch real levels from backend
                const res = await fetch('http://localhost:5000/api/levels');
                if (!res.ok) throw new Error(`Server returned ${res.status}`);

                const contentType = res.headers.get("content-type");
                if (!contentType || !contentType.includes("application/json")) {
                    throw new Error("Received non-JSON response from server");
                }

                const data = await res.json();

                if (data.success && data.levels.length > 0) {
                    setLevels(data.levels);
                } else {
                    // Fallback Mock Data if DB is empty so UI shows something
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
            } finally {
                setLoading(false);
            }
        };
        fetchLevels();
    }, []);

    const isLevelUnlocked = (index) => {
        if (index === 0) return true; // Level 1 always unlocked
        const prevLevelId = levels[index - 1]._id || levels[index - 1].id;
        return stats.completedLevels.includes(prevLevelId.toString()) || stats.completedLevels.includes(parseInt(prevLevelId));
    };

    const isLevelCompleted = (levelId) => {
        return stats.completedLevels.includes(levelId.toString()) || stats.completedLevels.includes(parseInt(levelId));
    };

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#131f24] text-white pb-20 relative overflow-hidden">
            <Navbar />

            {/* Header */}
            <div className="sticky top-[73px] z-30 bg-[#131f24]/95 backdrop-blur-sm border-b border-slate-800 p-4 shadow-lg">
                <div className="container mx-auto max-w-lg flex items-center justify-between">
                    <button onClick={() => navigate('/student/dashboard')} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-2 bg-slate-800 px-4 py-1.5 rounded-full border border-slate-700">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-yellow-100">{stats.xp} XP</span>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="container mx-auto max-w-lg pt-12 px-4 relative min-h-[80vh]">

                {/* Winding Path SVG Line - A simple visualization of connection */}
                <svg className="absolute top-20 left-1/2 -translate-x-1/2 h-full w-[200px] pointer-events-none z-0 opacity-30" style={{ height: `${levels.length * 140}px` }}>
                    <path
                        d={`M 100 0 ${levels.map((_, i) => {
                            const offset = (i % 2 === 0) ? -60 : 60;
                            return `Q ${100 + offset} ${i * 140 + 70}, 100 ${(i + 1) * 140}`;
                        }).join(' ')}`}
                        fill="none"
                        stroke="white"
                        strokeWidth="8"
                        strokeDasharray="12 12"
                        strokeLinecap="round"
                    />
                </svg>

                <div className="space-y-8 relative z-10 flex flex-col items-center pb-32">
                    {levels.map((level, index) => {
                        const unlocked = isLevelUnlocked(index);
                        const completed = isLevelCompleted(level._id || level.id);
                        const current = unlocked && !completed;

                        // Sinusoidal positioning
                        const offsetX = (index % 2 === 0) ? '-20px' : '20px';

                        return (
                            <div
                                key={level._id || level.id}
                                className="relative flex flex-col items-center"
                                style={{
                                    transform: `translateX(${offsetX})`,
                                    marginTop: index === 0 ? '0' : '40px'
                                }}
                            >
                                <button
                                    onClick={() => unlocked && navigate(`/student/play/${level._id || level.id}`)}
                                    disabled={!unlocked}
                                    className={`
                                        w-24 h-22 rounded-[2rem] flex items-center justify-center relative transition-all duration-300 transform
                                        ${completed
                                            ? 'bg-yellow-500 border-b-8 border-yellow-700 hover:scale-105'
                                            : current
                                                ? 'bg-[#58cc02] border-b-8 border-[#46a302] hover:scale-105 animate-bounce-subtle'
                                                : 'bg-slate-700 border-b-8 border-slate-800 cursor-not-allowed opacity-80'
                                        }
                                        shadow-2xl
                                    `}
                                    style={{ width: '88px', height: '80px' }}
                                >
                                    {/* Inner Content */}
                                    <div className="relative z-10">
                                        {completed ? (
                                            <Trophy size={36} className="text-yellow-100 drop-shadow-md" fill="currentColor" />
                                        ) : !unlocked ? (
                                            <Lock size={32} className="text-slate-400/50" />
                                        ) : (
                                            <Star size={40} className="text-white drop-shadow-md" fill="currentColor" />
                                        )}
                                    </div>

                                    {/* Star Rating for completed */}
                                    {completed && (
                                        <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm z-20">
                                            3/3
                                        </div>
                                    )}

                                    {/* Current Indicator "START" bubble */}
                                    {current && (
                                        <div className="absolute -top-10 bg-white text-[#58cc02] px-3 py-1 rounded-xl font-black text-sm uppercase tracking-wide shadow-lg animate-pulse border-2 border-[#58cc02]">
                                            START
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
                                        </div>
                                    )}
                                </button>

                                {/* Level Label */}
                                <div className="mt-3 text-center">
                                    <h3 className={`font-bold text-sm ${unlocked ? 'text-slate-200' : 'text-slate-600'}`}>
                                        Level {index + 1}
                                    </h3>
                                    <p className={`text-xs max-w-[120px] leading-tight ${unlocked ? 'text-slate-400' : 'text-slate-700'}`}>
                                        {level.title}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    <div className="mt-12 text-center opacity-50">
                        <div className="w-24 h-24 mx-auto bg-slate-800 rounded-full flex items-center justify-center border-4 border-slate-700 mb-4">
                            <Lock size={32} className="text-slate-600" />
                        </div>
                        <p className="text-slate-500 font-bold">More levels coming soon!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LevelMap;
