import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGamification } from '../../context/GamificationContext';
import { useAdaptive } from '../../context/AdaptiveContext';
import { useToast } from '../../context/ToastContext';
import QuizGame from '../../components/games/QuizGame';
import JumbledSentenceGame from '../../components/games/JumbledSentenceGame';
import SpeechGame from '../../components/games/SpeechGame';
import { ArrowLeft, Star, Heart, Trophy, Home, Loader2, Volume2, Mic, Calculator, CheckCircle } from 'lucide-react';
import { getLevelById } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

// ── Support Aid Banner ───────────────────────────────────────
const SupportAidBar = ({ supportProfile, currentTask }) => {
    const aids = [];

    // Reading support: TTS button for quiz questions
    if ((supportProfile?.reading === 'mild' || supportProfile?.reading === 'full') && currentTask?.type === 'quiz') {
        aids.push({
            key: 'tts',
            icon: <Volume2 size={14} />,
            label: 'Read Question Aloud',
            color: 'bg-indigo-600/20 text-indigo-300 border-indigo-600/40',
            action: () => {
                const text = currentTask?.props?.question || '';
                if ('speechSynthesis' in window && text) {
                    window.speechSynthesis.cancel();
                    const u = new SpeechSynthesisUtterance(text);
                    u.rate = 0.85;
                    window.speechSynthesis.speak(u);
                }
            }
        });
    }

    // Writing support: STT helper hint (mic already in speech game, but hint for quiz text inputs)
    if ((supportProfile?.writing === 'mild' || supportProfile?.writing === 'full') && currentTask?.type === 'jumbled') {
        aids.push({
            key: 'stt',
            icon: <Mic size={14} />,
            label: 'Try speaking the sentence',
            color: 'bg-emerald-600/20 text-emerald-300 border-emerald-600/40',
            action: null
        });
    }

    // Math support: Visual math helper
    if ((supportProfile?.math === 'mild' || supportProfile?.math === 'full') && currentTask?.type === 'quiz') {
        aids.push({
            key: 'math',
            icon: <Calculator size={14} />,
            label: 'Open Math Helper',
            color: 'bg-amber-600/20 text-amber-300 border-amber-600/40',
            action: () => window.open('/dyscalculia-tool', '_blank')
        });
    }

    if (aids.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {aids.map(aid => (
                <button
                    key={aid.key}
                    onClick={aid.action}
                    disabled={!aid.action}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${aid.color} ${aid.action ? 'hover:scale-105 cursor-pointer' : 'cursor-default'}`}
                >
                    {aid.icon} {aid.label}
                </button>
            ))}
        </div>
    );
};

// ── Main PlayLevel Component ─────────────────────────────────
const PlayLevel = () => {
    const { levelId } = useParams();
    const navigate = useNavigate();
    const { stats, completeLevel, registerToast } = useGamification();
    const { supportProfile } = useAdaptive();
    const toast = useToast();

    // Register toast handler so GamificationContext can fire streak toasts
    useEffect(() => {
        registerToast(toast);
    }, []);

    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [levelCompleted, setLevelCompleted] = useState(false);
    const [correctTasks, setCorrectTasks] = useState(0);
    const [finalAccuracy, setFinalAccuracy] = useState(100);
    const [taskCompleted, setTaskCompleted] = useState(false); // tracks per-task completion

    const [level, setLevel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLevel = async () => {
            if (levelId.length < 5) {
                const MOCK_LEVELS = [
                    {
                        id: 1, title: 'Introduction to Nouns', difficulty: 'easy', xpReward: 500, xpMultiplier: 1.0,
                        tasks: [
                            { type: 'quiz', props: { question: 'Which of these is a person?', options: ['Dog', 'Teacher', 'Ball', 'Mountain'], correctAnswer: 'Teacher', hint: 'Someone who helps you learn.' } },
                            { type: 'jumbled', props: { sentence: 'The big red dog runs fast' } }
                        ]
                    },
                    {
                        id: 2, title: 'Subject-Verb Agreement', difficulty: 'easy', xpReward: 500, xpMultiplier: 1.0,
                        tasks: [
                            { type: 'speech', props: { promptText: 'The cat is sleeping under the table.', expectedKeywords: ['cat', 'sleeping'] } },
                            { type: 'quiz', props: { question: 'They ___ going to the park.', options: ['is', 'am', 'are', 'be'], correctAnswer: 'are', hint: 'Used for plural subjects.' } }
                        ]
                    }
                ];
                const found = MOCK_LEVELS.find(l => l.id === parseInt(levelId));
                if (found) { setLevel(found); setLoading(false); return; }
            }

            try {
                const data = await getLevelById(levelId);
                if (data.success) {
                    setLevel(data.level);
                } else {
                    setError(data.message || 'Level not found.');
                }
            } catch (err) {
                setError('Failed to load level.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLevel();
    }, [levelId]);

    // Reset task completion when moving to next task
    useEffect(() => {
        setTaskCompleted(false);
    }, [currentTaskIndex]);

    const handleTaskComplete = (isCorrect = true) => {
        setTaskCompleted(true);
        if (isCorrect) setCorrectTasks(prev => prev + 1);

        if (!level || !level.tasks) return;

        if (currentTaskIndex < level.tasks.length - 1) {
            // Small delay for visual feedback before advancing
            setTimeout(() => {
                setCurrentTaskIndex(prev => prev + 1);
            }, 400);
        } else {
            const finalCorrect = isCorrect ? correctTasks + 1 : correctTasks;
            const accuracy = Math.round((finalCorrect / level.tasks.length) * 100);
            setFinalAccuracy(accuracy);

            // Apply xpMultiplier for support levels
            const multiplier = level.xpMultiplier || 1.0;
            const effectiveXp = Math.round((level.xpReward || 500) * multiplier);

            completeLevel(level, level.xpReward || 500, accuracy, multiplier);
            setTimeout(() => setLevelCompleted(true), 500);
        }
    };

    const isAlreadyCompleted = stats?.completedLevels?.includes((level?._id || level?.id || levelId).toString());

    if (isAlreadyCompleted) {
        return (
            <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center p-6 transition-colors duration-300">
                <div className="bg-[var(--bg-surface)] rounded-[40px] p-8 md:p-12 text-center max-w-xl w-full shadow-2xl border border-[var(--border-color)] animate-fade-in-up space-y-6">
                    <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center border-4 border-amber-500/30 shadow-lg mx-auto">
                        <CheckCircle size={48} className="text-amber-500" />
                    </div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Level Already Mastered!</h1>
                    <p className="text-sm text-[var(--text-secondary)] font-medium leading-relaxed">
                        You have already completed <strong>"{level.title}"</strong> and claimed your XP. Replaying completed levels is disabled to prevent XP farming.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={() => navigate('/student/learn-path')}
                            className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-black text-base shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                        >
                            Back to Learn Path →
                        </button>
                        <button
                            onClick={() => navigate('/student/dashboard')}
                            className="flex-1 py-4 bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl font-bold text-base transition-all cursor-pointer"
                        >
                            Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 font-bold">{error}</div>;
    if (!level) return <div className="min-h-screen flex items-center justify-center text-gray-500">Level not found.</div>;

    // ── Level Complete Screen ─────────────────────────────────
    if (levelCompleted) {
        const multiplier = level.xpMultiplier || 1.0;
        const effectiveXp = Math.round((level.xpReward || 500) * multiplier);

        return (
            <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center p-6 transition-colors duration-300">
                <div className="bg-[var(--bg-surface)] rounded-[40px] p-8 md:p-12 text-center max-w-xl w-full shadow-2xl border border-[var(--border-color)] animate-fade-in-up">
                    <div className="flex justify-center mb-6">
                        <div className="w-28 h-28 bg-amber-500/20 rounded-full flex items-center justify-center border-4 border-amber-500/30 shadow-lg">
                            <Trophy size={56} className="text-amber-500" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-[var(--text-primary)] mb-2 tracking-tight">Level Completed!</h1>
                    <p className="text-base text-[var(--text-secondary)] font-bold mb-8">You've mastered "{level.title}"</p>

                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-3xl mb-8 flex justify-around">
                        <div className="text-center">
                            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">+{effectiveXp}</div>
                            <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">XP Gained</div>
                            {multiplier > 1 && (
                                <div className="text-xs text-emerald-500 font-bold mt-1">×{multiplier.toFixed(1)} bonus!</div>
                            )}
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{finalAccuracy}%</div>
                            <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Accuracy</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{level.tasks?.length || 0}</div>
                            <div className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Tasks Done</div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={() => navigate('/student/learn-path')} 
                            className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-2xl font-black text-base shadow-lg shadow-indigo-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            Next Level →
                        </button>
                        <button 
                            onClick={() => navigate('/student/dashboard')} 
                            className="flex-1 py-4 bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl font-bold text-base transition-all"
                        >
                            <Home className="inline mr-2" size={18} /> Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const currentTask = level.tasks[currentTaskIndex];
    const tasksTotal = level.tasks.length;

    // Font size class for reading support
    const questionFontClass = supportProfile?.reading === 'full' ? 'text-xl' : 'text-base';

    return (
        <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] p-4 md:p-8 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">

                {/* ── Game Header ── */}
                <div className="flex items-center justify-between mb-6 gap-4">
                    <button onClick={() => navigate('/student/dashboard')} className="p-3 text-gray-400 hover:text-gray-600 transition-colors">
                        <ArrowLeft size={32} />
                    </button>
                    <div className="flex-1 h-4 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden border-2 border-[var(--border-color)]">
                        <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${((currentTaskIndex + 1) / tasksTotal) * 100}%` }} />
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--bg-surface)] px-4 py-2 rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <Heart size={20} className="text-red-500 fill-red-500" />
                        <span className="font-black text-[var(--text-primary)]">5</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[var(--bg-surface)] px-4 py-2 rounded-2xl shadow-sm border border-[var(--border-color)]">
                        <Star size={20} className="text-amber-500 fill-amber-500" />
                        <span className="font-black text-[var(--text-primary)]">{stats.xp}</span>
                    </div>
                </div>

                {/* Task counter */}
                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-xs font-bold text-[var(--text-secondary)]">
                        Task {currentTaskIndex + 1} of {tasksTotal} — {level.title}
                    </span>
                    {(level.xpMultiplier || 1.0) > 1 && (
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                            ×{(level.xpMultiplier).toFixed(1)} XP Bonus
                        </span>
                    )}
                </div>

                {/* ── Support Aid Bar — auto-injected based on supportProfile ── */}
                <SupportAidBar supportProfile={supportProfile} currentTask={currentTask} />

                {/* ── Task Container ── */}
                <div className={`min-h-[480px] ${supportProfile?.reading !== 'none' ? questionFontClass : ''}`}>
                    {currentTask.type === 'quiz'    && <QuizGame    {...currentTask.props} onComplete={handleTaskComplete} />}
                    {currentTask.type === 'jumbled' && <JumbledSentenceGame {...currentTask.props} onComplete={handleTaskComplete} />}
                    {currentTask.type === 'speech'  && <SpeechGame  {...currentTask.props} onComplete={handleTaskComplete} />}
                </div>

                {/* ── Footer CONTINUE — only active after task component signals completion ── */}
                <div className="mt-8 flex justify-end">
                    <button
                        onClick={() => handleTaskComplete(true)}
                        className={`px-10 py-3.5 text-white rounded-2xl font-black text-lg shadow-xl transition-all ${
                            taskCompleted
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-600/20 hover:scale-105 active:scale-95'
                                : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)] cursor-not-allowed opacity-50'
                        }`}
                        disabled={!taskCompleted}
                        title={taskCompleted ? '' : 'Complete the task above first'}
                    >
                        CONTINUE →
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PlayLevel;
