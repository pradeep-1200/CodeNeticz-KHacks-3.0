import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrelimsQuestions, submitPrelimsTest, transcribeAudio } from '../../services/api';
import { useAdaptive } from '../../context/AdaptiveContext';
import { Mic, Square, Volume2 } from 'lucide-react';

const PrelimsTest = () => {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null); // B1 FIX: Added missing mediaRecorder state
    const [isLoading, setIsLoading] = useState(true);
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
            setQuestions(data || []);
        } catch (err) {
            console.error('Failed to fetch prelims questions', err);
            setError(err.message || 'Failed to connect to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnswerChange = (questionId, value, usedStt = false) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: {
                answer: value,
                usedStt: prev[questionId]?.usedStt || usedStt
            }
        }));
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
                        const qId = questions[currentQuestionIndex]._id;
                        handleAnswerChange(qId, res.text, true);
                    }
                } catch (err) {
                    console.error("Audio transcription failed", err);
                }
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone access denied", err);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder) {
            mediaRecorder.stop();
            setIsRecording(false);
        }
    };

    const readQuestion = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop ongoing speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSubmit = async () => {
        try {
            const formattedAnswers = Object.entries(answers).map(([questionId, data]) => ({
                questionId,
                answer: data.answer || '',
                usedStt: data.usedStt || false
            }));

            // B1 FIX: submitPrelimsTest gets userId from JWT on backend; only answers are passed
            const result = await submitPrelimsTest(formattedAnswers);
            
            // Map server's suggestedMode or learningProfile to frontend profile
            const profileToSet = result.suggestedMode || result.profile || 'DEFAULT';
            updateProfile(profileToSet, true);
            
            navigate('/student/dashboard');
        } catch (err) {
            console.error("Failed to submit prelims", err);
            setError("Failed to submit test. Please try again.");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-xl font-bold">Loading Assessment...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
                <div className="bg-red-900/50 p-8 rounded-2xl border border-red-500 text-center max-w-md">
                    <h2 className="text-2xl font-bold mb-4 text-red-300">Connection Error</h2>
                    <p className="mb-6">{error}</p>
                    <button 
                        onClick={fetchQuestions}
                        className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-lg font-semibold"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!questions || questions.length === 0) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
                <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center max-w-md shadow-xl">
                    <h2 className="text-2xl font-bold mb-4 text-slate-300">No Questions Found</h2>
                    <p className="mb-6 text-slate-400">The preliminary assessment has not been set up by the staff yet.</p>
                    <button 
                        onClick={() => {
                            updateProfile('DEFAULT', true);
                            navigate('/student/dashboard');
                        }}
                        className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-lg font-semibold"
                    >
                        Skip for Now (Continue to Dashboard)
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion._id]?.answer || '';

    return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-8">
            <h1 className="text-4xl font-outfit font-bold mb-8 tracking-tight">Cognitive Prelims Assessment</h1>
            
            <div className="bg-slate-800 p-8 rounded-2xl w-full max-w-2xl border border-slate-700 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-400 font-medium">Question {currentQuestionIndex + 1} of {questions.length}</span>
                    <button 
                        onClick={() => readQuestion(currentQuestion.question)}
                        className="text-blue-400 hover:text-blue-300 flex items-center gap-2 font-medium bg-slate-700/50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Volume2 size={18} /> Read Aloud
                    </button>
                </div>

                <h2 className="text-2xl font-semibold mb-6 text-slate-100">{currentQuestion.question}</h2>

                <div className="mb-6 relative">
                    {currentQuestion.type === 'text' || currentQuestion.type === 'math' ? (
                        <textarea 
                            value={currentAnswer}
                            onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                            className="w-full bg-slate-900 p-4 rounded-xl border border-slate-700 min-h-[120px] text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Type your answer here..."
                        />
                    ) : (
                        <input 
                            type="text"
                            value={currentAnswer}
                            onChange={(e) => handleAnswerChange(currentQuestion._id, e.target.value)}
                            className="w-full bg-slate-900 p-4 rounded-xl border border-slate-700 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            placeholder="Type your answer here..."
                        />
                    )}

                    <div className="absolute right-4 bottom-4">
                        {isRecording ? (
                            <button onClick={stopRecording} className="bg-red-500 p-3 rounded-full animate-pulse text-white hover:bg-red-600 transition-colors" title="Stop Recording">
                                <Square size={20} />
                            </button>
                        ) : (
                            <button onClick={startRecording} className="bg-blue-600 hover:bg-blue-500 p-3 rounded-full text-white transition-colors" title="Record Voice Answer">
                                <Mic size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex justify-between mt-8">
                    <button 
                        disabled={currentQuestionIndex === 0}
                        onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                        className="px-6 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    
                    {currentQuestionIndex === questions.length - 1 ? (
                        <button 
                            onClick={handleSubmit}
                            className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold shadow-lg shadow-green-900/30 transition-all hover:scale-105"
                        >
                            Submit Assessment
                        </button>
                    ) : (
                        <button 
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-900/30 transition-all hover:scale-105"
                        >
                            Next
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrelimsTest;
