import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGamification } from '../../context/GamificationContext';
import QuizGame from '../../components/games/QuizGame';
import JumbledSentenceGame from '../../components/games/JumbledSentenceGame';
import SpeechGame from '../../components/games/SpeechGame';
import { ArrowLeft, Star, Heart, Trophy, ChevronRight, Home, Loader2 } from 'lucide-react';

const PlayLevel = () => {
    const { levelId } = useParams();
    const navigate = useNavigate();
    const { stats, completeLevel } = useGamification();
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [levelCompleted, setLevelCompleted] = useState(false);

    const [level, setLevel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLevel = async () => {
            if (levelId.length < 5) {
                const MOCK_LEVELS = [
                    {
                        id: 1,
                        title: "Introduction to Nouns",
                        description: "Identify people, places, and things.",
                        tasks: [
                            { type: 'quiz', props: { question: "Which of these is a person?", options: ["Dog", "Teacher", "Ball", "Mountain"], correctAnswer: "Teacher", hint: "Someone who helps you learn." } },
                            { type: 'jumbled', props: { sentence: "The big red dog runs fast" } }
                        ]
                    },
                    {
                        id: 2,
                        title: "Subject-Verb Agreement",
                        description: "Helping words work together.",
                        tasks: [
                            { type: 'speech', props: { promptText: "The cat is sleeping under the table.", expectedKeywords: ["cat", "sleeping"] } },
                            { type: 'quiz', props: { question: "They ___ going to the park.", options: ["is", "am", "are", "be"], correctAnswer: "are", hint: "Used for plural subjects." } }
                        ]
                    }
                ];
                const found = MOCK_LEVELS.find(l => l.id === parseInt(levelId));
                if (found) {
                    setLevel(found);
                    setLoading(false);
                    return;
                }
            }

            try {
                const res = await fetch(`http://localhost:5000/api/levels/${levelId}`);
                if (!res.ok) throw new Error(`Status: ${res.status}`);
                const data = await res.json();
                if (data.success) {
                    setLevel(data.level);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                setError("Failed to load level.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLevel();
    }, [levelId]);

    const handleNext = () => {
        if (!level || !level.tasks) return;

        if (currentTaskIndex < level.tasks.length - 1) {
            setCurrentTaskIndex(currentTaskIndex + 1);
        } else {
            completeLevel(level._id || level.id, level.xpReward);
            setLevelCompleted(true);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;
    if (!level) return <div className="min-h-screen flex items-center justify-center text-gray-500">Level not found.</div>;

    if (levelCompleted) {
        return (
            <div className="min-h-screen bg-blue-600 flex items-center justify-center p-6">
                <div className="bg-white rounded-[40px] p-12 text-center max-w-xl w-full shadow-2xl animate-in zoom-in-50 duration-500">
                    <div className="flex justify-center mb-8">
                        <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center border-8 border-yellow-200 shadow-lg">
                            <Trophy size={64} className="text-yellow-700" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-2">Level Complete!</h1>
                    <p className="text-xl text-gray-500 font-bold mb-8">You've mastered {level.title}</p>
                    <div className="bg-blue-50 p-6 rounded-3xl mb-10 flex justify-around">
                        <div className="text-center">
                            <div className="text-3xl font-black text-blue-600">+{level.xpReward || 500}</div>
                            <div className="text-sm font-bold text-blue-400 uppercase">XP Gained</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-blue-600">Perfect</div>
                            <div className="text-sm font-bold text-blue-400 uppercase">Accuracy</div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => navigate('/student/dashboard')} className="flex-1 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold text-lg hover:bg-gray-200 transition-all border-b-4 border-gray-300">
                            <Home className="inline mr-2" /> Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentTask = level.tasks[currentTaskIndex];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Game Header */}
                <div className="flex items-center justify-between mb-8 gap-4">
                    <button onClick={() => navigate('/student/dashboard')} className="p-3 text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft size={32} />
                    </button>
                    <div className="flex-1 h-4 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden border-2 border-[var(--border-color)]">
                        <div className="h-full bg-[var(--game-primary)] transition-all duration-500" style={{ width: `${((currentTaskIndex + 1) / level.tasks.length) * 100}%` }} />
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <Heart size={20} className="text-red-500 fill-red-500" />
                        <span className="font-black text-gray-700 dark:text-gray-200">5</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <Star size={20} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-black text-gray-700 dark:text-gray-200">{stats.xp}</span>
                    </div>
                </div>

                {/* Tools - Visible in Game */}
                <div className="flex justify-end gap-2 mb-4">
                    <button onClick={() => window.open('/dyslexia', '_blank')} className="flex items-center gap-2 px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-xl text-xs font-bold hover:bg-purple-200"><img src="/icons/dyslexia.png" alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.style.display = 'none'} /> Dyslexia Assistant</button>
                    <button onClick={() => window.open('/dyscalculia-tool', '_blank')} className="flex items-center gap-2 px-3 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-xl text-xs font-bold hover:bg-orange-200"><img src="/icons/math.png" alt="" className="w-4 h-4 object-contain" onError={(e) => e.target.style.display = 'none'} /> Math Helper</button>
                </div>

                {/* Task Container */}
                <div className="min-h-[500px]">
                    {currentTask.type === 'quiz' && <QuizGame {...currentTask.props} />}
                    {currentTask.type === 'jumbled' && <JumbledSentenceGame {...currentTask.props} />}
                    {currentTask.type === 'speech' && <SpeechGame {...currentTask.props} />}
                </div>

                {/* Footer Controls */}
                <div className="mt-12 flex justify-end">
                    <button onClick={handleNext} className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 shadow-xl border-b-8 border-blue-800 active:border-b-0 active:translate-y-2 transition-all">
                        CONTINUE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlayLevel;
