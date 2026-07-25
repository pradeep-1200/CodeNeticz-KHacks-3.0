import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrelimsQuestions, submitPrelimsTest, transcribeAudio } from '../../services/api';
import { useAdaptive } from '../../context/AdaptiveContext';
import { Mic, Square, Volume2, ChevronRight, ChevronLeft, Check } from 'lucide-react';

// ── Domain config ────────────────────────────────────────────
const DOMAINS = [
    { key: 'reading', label: 'Reading', icon: '📖', color: '#6366f1', bg: 'from-indigo-600 to-purple-600' },
    { key: 'writing', label: 'Writing',  icon: '✏️', color: '#10b981', bg: 'from-emerald-500 to-teal-600'  },
    { key: 'math',    label: 'Math',     icon: '🔢', color: '#f59e0b', bg: 'from-amber-500 to-orange-500'  },
    { key: 'preference', label: 'Preferences', icon: '⚙️', color: '#8b5cf6', bg: 'from-violet-500 to-purple-600' }
];

const getDomainConfig = (key) => DOMAINS.find(d => d.key === key) || DOMAINS[0];

// ── Sequence Task Component ──────────────────────────────────
const SequenceTask = ({ question, sequenceItems, onAnswer, existingAnswer }) => {
    const [items, setItems] = useState(() => {
        // Shuffle the sequence items for display
        const shuffled = [...(sequenceItems || [])];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    });
    const [ordered, setOrdered] = useState([]);

    const handlePickItem = (item) => {
        const newOrdered = [...ordered, item];
        const newItems = items.filter(i => i !== item);
        setOrdered(newOrdered);
        setItems(newItems);
        onAnswer(newOrdered.join(' '));
    };

    const handleRemoveItem = (item, index) => {
        const newOrdered = ordered.filter((_, i) => i !== index);
        setOrdered(newOrdered);
        setItems([...items, item]);
        onAnswer(newOrdered.join(' '));
    };

    const handleReset = () => {
        const all = [...ordered, ...items];
        const shuffled = [...all];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setItems(shuffled);
        setOrdered([]);
        onAnswer('');
    };

    return (
        <div className="space-y-4">
            <p className="text-sm font-semibold text-slate-400">Tap words/phrases to build the correct order:</p>

            {/* Ordered answer area */}
            <div className="min-h-[56px] bg-slate-900/60 border border-slate-600 rounded-xl p-3 flex flex-wrap gap-2 items-center">
                {ordered.length === 0 && (
                    <span className="text-slate-500 text-sm italic">Tap words below to place them here...</span>
                )}
                {ordered.map((item, i) => (
                    <button
                        key={`ord-${i}`}
                        onClick={() => handleRemoveItem(item, i)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg transition-all hover:scale-105 flex items-center gap-1"
                    >
                        {item}
                        <span className="text-indigo-200 text-xs">✕</span>
                    </button>
                ))}
            </div>

            {/* Available word tiles */}
            <div className="flex flex-wrap gap-2">
                {items.map((item, i) => (
                    <button
                        key={`avail-${i}`}
                        onClick={() => handlePickItem(item)}
                        className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-100 text-sm font-semibold rounded-lg transition-all hover:scale-105 border border-slate-600"
                    >
                        {item}
                    </button>
                ))}
            </div>

            {ordered.length > 0 && (
                <button onClick={handleReset} className="text-xs text-slate-400 hover:text-slate-200 underline transition-colors">
                    Reset
                </button>
            )}
        </div>
    );
};

// ── Preference Toggle Component ──────────────────────────────
const PreferenceQuestion = ({ question, options, value, onChange }) => (
    <div className="flex flex-wrap gap-3">
        {options.map(opt => (
            <button
                key={opt}
                onClick={() => onChange(opt)}
                className={`px-5 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                    value === opt
                        ? 'bg-violet-600 border-violet-400 text-white scale-105 shadow-lg shadow-violet-900/40'
                        : 'bg-slate-800 border-slate-600 text-slate-300 hover:border-violet-500 hover:bg-slate-700'
                }`}
            >
                {opt}
            </button>
        ))}
    </div>
);

// ── Main Component ───────────────────────────────────────────
const PrelimsTest = () => {
    const [questionsByDomain, setQuestionsByDomain] = useState({});
    const [allQuestions, setAllQuestions] = useState([]);
    const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { updateProfile } = useAdaptive();

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getPrelimsQuestions();
            const questions = data || [];
            setAllQuestions(questions);

            // Group by domain in display order
            const grouped = {};
            DOMAINS.forEach(d => { grouped[d.key] = []; });
            questions.forEach(q => {
                const dom = q.domain || 'reading';
                if (!grouped[dom]) grouped[dom] = [];
                grouped[dom].push(q);
            });
            setQuestionsByDomain(grouped);
        } catch (err) {
            console.error('Failed to fetch prelims questions', err);
            setError(err.message || 'Failed to connect to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    // Derive current domain and question
    const activeDomains = DOMAINS.filter(d => (questionsByDomain[d.key] || []).length > 0);
    const currentDomainKey = activeDomains[currentDomainIndex]?.key;
    const currentDomainQuestions = questionsByDomain[currentDomainKey] || [];
    const currentQuestion = currentDomainQuestions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion?._id]?.answer || '';

    // Overall progress
    const totalQuestions = allQuestions.length;
    const answeredCount = Object.keys(answers).length;
    const overallProgress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    const handleAnswerChange = (questionId, value, usedStt = false) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                answer: value,
                usedStt: prev[questionId]?.usedStt || usedStt
            }
        }));
    };

    const readQuestion = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.85;
            window.speechSynthesis.speak(utterance);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            let chunks = [];
            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = async () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                try {
                    const res = await transcribeAudio(blob);
                    if (res.success && res.text) {
                        handleAnswerChange(currentQuestion._id, res.text, true);
                    }
                } catch (err) {
                    console.error('Audio transcription failed', err);
                }
            };
            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error('Microphone access denied', err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) { mediaRecorder.stop(); setIsRecording(false); }
    };

    const handleNext = () => {
        if (currentQuestionIndex < currentDomainQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else if (currentDomainIndex < activeDomains.length - 1) {
            setCurrentDomainIndex(prev => prev + 1);
            setCurrentQuestionIndex(0);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        } else if (currentDomainIndex > 0) {
            const prevDomainKey = activeDomains[currentDomainIndex - 1].key;
            const prevDomainQs = questionsByDomain[prevDomainKey] || [];
            setCurrentDomainIndex(prev => prev - 1);
            setCurrentQuestionIndex(prevDomainQs.length - 1);
        }
    };

    const isLastQuestion = currentDomainIndex === activeDomains.length - 1
        && currentQuestionIndex === currentDomainQuestions.length - 1;

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([questionId, data]) => ({
                questionId,
                answer: data.answer || '',
                usedStt: data.usedStt || false
            }));

            const result = await submitPrelimsTest(formattedAnswers);

            // Pass full result to updateProfile — it handles supportProfile + accessibilityPrefs
            updateProfile({
                legacyProfile: result.legacyProfile || result.suggestedMode || 'DEFAULT',
                supportProfile: result.supportProfile || { reading: 'none', writing: 'none', math: 'none' },
                accessibilityPrefs: result.accessibilityPrefs || { fontSize: 'normal', contrast: 'normal', readAloud: false }
            }, true);

            navigate('/student/dashboard');
        } catch (err) {
            console.error('Failed to submit prelims', err);
            setError('Failed to submit test. Please try again.');
            setIsSubmitting(false);
        }
    };

    // ── Loading / Error states ───────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xl font-bold text-slate-300">Loading Assessment...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
                <div className="bg-red-900/50 p-8 rounded-2xl border border-red-500 text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-red-300">Connection Error</h2>
                    <p className="mb-6 text-red-200">{error}</p>
                    <button onClick={fetchQuestions} className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-semibold transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!allQuestions.length || activeDomains.length === 0) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center max-w-md shadow-xl">
                    <h2 className="text-2xl font-bold mb-4 text-slate-300">No Questions Found</h2>
                    <p className="mb-6 text-slate-400">The preliminary assessment hasn't been set up yet. Staff can seed questions from the Prelims Manager.</p>
                    <button onClick={() => { updateProfile('DEFAULT', true); navigate('/student/dashboard'); }}
                        className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-lg font-semibold transition-colors">
                        Skip for Now
                    </button>
                </div>
            </div>
        );
    }

    if (!currentQuestion) return null;

    const domainConfig = getDomainConfig(currentDomainKey);
    const isPreference = currentQuestion.domain === 'preference' || currentQuestion.isUngraded;

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col" style={{ fontFamily: '"Outfit", "Inter", sans-serif' }}>

            {/* ── Top Header ── */}
            <div className="bg-slate-800/80 backdrop-blur-md border-b border-slate-700 px-6 py-4 sticky top-0 z-30">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-lg font-black text-white">Prelims Assessment</h1>
                        <span className="text-xs font-semibold text-slate-400">{answeredCount}/{totalQuestions} answered</span>
                    </div>
                    {/* Overall progress bar */}
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${overallProgress}%`, background: `linear-gradient(to right, #6366f1, #8b5cf6)` }}
                        />
                    </div>
                    {/* Domain tabs */}
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                        {activeDomains.map((d, i) => {
                            const dConfig = getDomainConfig(d.key);
                            const dQuestions = questionsByDomain[d.key] || [];
                            const dAnswered = dQuestions.filter(q => answers[q._id]).length;
                            const isActive = i === currentDomainIndex;
                            const isDone = dAnswered === dQuestions.length && dQuestions.length > 0;
                            return (
                                <button
                                    key={d.key}
                                    onClick={() => { setCurrentDomainIndex(i); setCurrentQuestionIndex(0); }}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                                        isActive
                                            ? 'text-white shadow-sm scale-105'
                                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                    }`}
                                    style={isActive ? { background: `linear-gradient(135deg, ${dConfig.color}dd, ${dConfig.color}88)` } : {}}
                                >
                                    <span>{dConfig.icon}</span>
                                    {dConfig.label}
                                    {isDone && <Check size={10} className="text-green-300" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Main Question Card ── */}
            <div className="flex-1 flex items-start justify-center p-4 md:p-8">
                <div className="w-full max-w-2xl">

                    {/* Domain badge + question counter */}
                    <div className="flex items-center justify-between mb-4">
                        <div
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-black shadow-lg`}
                            style={{ background: `linear-gradient(135deg, ${domainConfig.color}cc, ${domainConfig.color}88)` }}
                        >
                            <span>{domainConfig.icon}</span> {domainConfig.label}
                            {isPreference && <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Optional</span>}
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-400 font-medium">
                                {currentQuestionIndex + 1} / {currentDomainQuestions.length}
                            </span>
                            <button
                                onClick={() => readQuestion(currentQuestion.question)}
                                className="flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-900/30 hover:bg-indigo-900/50 px-3 py-1.5 rounded-lg transition-all"
                            >
                                <Volume2 size={14} /> Read Aloud
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">

                        {/* Passage (reading domain only) */}
                        {currentQuestion.passage && (
                            <div className="bg-indigo-950/50 border-b border-indigo-800/40 p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Reading Passage</span>
                                </div>
                                <p className="text-slate-200 leading-relaxed text-sm md:text-base font-medium">
                                    {currentQuestion.passage}
                                </p>
                            </div>
                        )}

                        <div className="p-6 md:p-8">
                            {/* Question text */}
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-6 leading-snug">
                                {currentQuestion.question}
                            </h2>

                            {/* Answer area by question type */}
                            {currentQuestion.type === 'mcq' && (
                                <div className="space-y-3">
                                    {(currentQuestion.options || []).map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAnswerChange(currentQuestion._id, opt)}
                                            className={`w-full p-4 rounded-xl border-2 text-left font-semibold transition-all ${
                                                currentAnswer === opt
                                                    ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-md shadow-indigo-900/30 scale-[1.01]'
                                                    : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500 hover:bg-slate-700'
                                            }`}
                                        >
                                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-3 text-xs font-black ${
                                                currentAnswer === opt ? 'bg-indigo-500 text-white' : 'bg-slate-600 text-slate-400'
                                            }`}>
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {currentQuestion.type === 'sequence' && (
                                <SequenceTask
                                    question={currentQuestion.question}
                                    sequenceItems={currentQuestion.sequenceItems || []}
                                    onAnswer={(val) => handleAnswerChange(currentQuestion._id, val)}
                                    existingAnswer={currentAnswer}
                                />
                            )}

                            {(currentQuestion.type === 'text' || currentQuestion.type === 'audio') && !isPreference && (
                                <div className="relative">
                                    <textarea
                                        value={currentAnswer}
                                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                                        className="w-full bg-slate-900 p-4 pr-14 rounded-xl border border-slate-600 min-h-[120px] text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                        placeholder="Type your answer here..."
                                    />
                                    <div className="absolute right-3 bottom-3">
                                        {isRecording ? (
                                            <button onClick={stopRecording} className="bg-red-500 p-2.5 rounded-full animate-pulse text-white hover:bg-red-600 transition-colors" title="Stop Recording">
                                                <Square size={16} />
                                            </button>
                                        ) : (
                                            <button onClick={startRecording} className="bg-indigo-600 hover:bg-indigo-500 p-2.5 rounded-full text-white transition-colors" title="Record Voice Answer">
                                                <Mic size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {currentQuestion.type === 'math' && (
                                <div className="relative">
                                    <textarea
                                        value={currentAnswer}
                                        onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                                        className="w-full bg-slate-900 p-4 rounded-xl border border-slate-600 min-h-[100px] text-white text-lg font-mono focus:outline-none focus:border-amber-500 transition-colors"
                                        placeholder="Enter your answer..."
                                    />
                                </div>
                            )}

                            {isPreference && currentQuestion.type !== 'sequence' && (
                                <PreferenceQuestion
                                    question={currentQuestion.question}
                                    options={currentQuestion.options || ['Yes', 'No']}
                                    value={currentAnswer}
                                    onChange={(val) => handleAnswerChange(currentQuestion._id, val)}
                                />
                            )}
                        </div>

                        {/* Navigation footer */}
                        <div className="px-6 md:px-8 pb-6 flex justify-between items-center">
                            <button
                                disabled={currentDomainIndex === 0 && currentQuestionIndex === 0}
                                onClick={handlePrev}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>

                            {isLastQuestion ? (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-lg shadow-emerald-900/30 transition-all hover:scale-105 hover:shadow-emerald-900/50 disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                                >
                                    {isSubmitting ? (
                                        <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
                                    ) : (
                                        <><Check size={16} /> Submit Assessment</>
                                    )}
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-bold shadow-lg transition-all hover:scale-105 text-sm"
                                    style={{ background: `linear-gradient(135deg, ${domainConfig.color}, ${domainConfig.color}cc)` }}
                                >
                                    Next <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrelimsTest;
