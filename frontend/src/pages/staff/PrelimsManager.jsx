import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Sparkles } from 'lucide-react';
import { getPrelimsQuestions, addPrelimsQuestion, deletePrelimsQuestion } from '../../services/api';

const PrelimsManager = () => {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        type: 'text',
        correctAnswer: '',
        patternTag: 'default',
        disabilityMarker: 'DEFAULT'
    });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const data = await getPrelimsQuestions();
            setQuestions(data || []);
        } catch (err) {
            console.error('Failed to fetch prelims questions', err);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newQuestion.question || !newQuestion.correctAnswer) return alert("Please fill in all mandatory fields (*)");
        try {
            await addPrelimsQuestion(newQuestion);
            setNewQuestion({ question: '', type: 'text', correctAnswer: '', patternTag: 'default', disabilityMarker: 'DEFAULT' });
            fetchQuestions();
        } catch (err) {
            console.error('Failed to add question', err);
        }
    };

    const autoGenerate = () => {
        const patternMap = [
            { tag: 'reading-speed', marker: 'DYSLEXIA', q: "Spell the word 'Accommodation'.", a: "Accommodation", type: "text" },
            { tag: 'attention', marker: 'DYSGRAPHIA', q: "Type the following sentence accurately: 'The quick brown fox jumps over the lazy dog.'", a: "The quick brown fox jumps over the lazy dog.", type: "text" },
            { tag: 'numerical', marker: 'DYSCALCULIA', q: "What is 15% of 200?", a: "30", type: "math" },
            { tag: 'logical', marker: 'DEFAULT', q: "What is the capital of France?", a: "Paris", type: "text" }
        ];

        const gen = patternMap[Math.floor(Math.random() * patternMap.length)];
        setNewQuestion({
            question: gen.q,
            type: gen.type,
            correctAnswer: gen.a,
            patternTag: gen.tag,
            disabilityMarker: gen.marker
        });
    };

    const handleDelete = async (id) => {
        try {
            await deletePrelimsQuestion(id);
            fetchQuestions();
        } catch (err) {
            console.error('Failed to delete question', err);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto text-[var(--text-primary)] animate-fade-in-up">
            <h1 className="text-3xl font-bold mb-2 font-outfit tracking-tight">Manage Prelims Questions</h1>
            <p className="text-xs text-[var(--text-secondary)] mb-6 font-medium">Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.</p>
            
            <form onSubmit={handleAdd} className="bg-[var(--bg-surface)] p-6 rounded-2xl border border-[var(--border-color)] mb-8 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Add New Question</h2>
                    <button 
                        type="button" 
                        onClick={autoGenerate}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all hover:scale-105 flex items-center gap-2 shadow-sm"
                    >
                        <Sparkles size={16} /> Auto-Generate via AI
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4 text-xs font-bold">
                    <div>
                        <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                            Question Prompt <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            placeholder="e.g. Spell the word 'Accommodation' accurately." 
                            className="w-full p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-medium"
                            value={newQuestion.question}
                            onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                Cognitive Support Category <span className="text-red-500">*</span>
                            </label>
                            <select 
                                className="w-full p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                                value={newQuestion.patternTag}
                                onChange={(e) => {
                                    const tag = e.target.value;
                                    const markerMap = {
                                        'reading-speed': 'DYSLEXIA',
                                        'numerical': 'DYSCALCULIA',
                                        'attention': 'DYSGRAPHIA',
                                        'default': 'DEFAULT'
                                    };
                                    setNewQuestion({
                                        ...newQuestion, 
                                        patternTag: tag,
                                        disabilityMarker: markerMap[tag] || 'DEFAULT'
                                    });
                                }}
                            >
                                <option value="default">General Knowledge (Default)</option>
                                <option value="reading-speed">Reading Speed / Spelling (Reading Support)</option>
                                <option value="attention">Typing / Voice Focus (Voice Support)</option>
                                <option value="numerical">Math / Logic (Number Support)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                                Response Format <span className="text-red-500">*</span>
                            </label>
                            <select 
                                className="w-full p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none"
                                value={newQuestion.type}
                                onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value})}
                            >
                                <option value="text">Short Text</option>
                                <option value="math">Math Expression</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[var(--text-secondary)] mb-1 uppercase tracking-wider">
                            Expected Answer <span className="text-red-500">*</span>
                        </label>
                        <input 
                            type="text" 
                            placeholder="e.g. Accommodation" 
                            className="w-full p-3 bg-[var(--bg-base)] rounded-xl border border-[var(--border-color)] text-[var(--text-primary)] focus:outline-none focus:border-purple-500 font-medium"
                            value={newQuestion.correctAnswer}
                            onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                            required
                        />
                    </div>

                    <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white p-3.5 rounded-xl font-bold flex justify-center items-center gap-2 transition-all shadow-md mt-2">
                        <PlusCircle size={18} /> Add Question Item
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Existing Questions ({(questions || []).length})</h2>
                {(questions || []).map((q, idx) => (
                    <div key={q._id || idx} className="bg-[var(--bg-surface)] p-5 rounded-2xl flex justify-between items-center border border-[var(--border-color)] shadow-sm hover:shadow-md transition-shadow">
                        <div>
                            <p className="font-semibold text-lg">{q.question}</p>
                            <p className="text-xs opacity-70 mt-1">Tag: <span className="font-mono bg-[var(--bg-base)] px-2 py-0.5 rounded text-xs">{q.patternTag || q.disabilityMarker}</span> | Expected Answer: <span className="font-mono bg-[var(--bg-base)] px-2 py-0.5 rounded text-xs">{q.correctAnswer}</span></p>
                        </div>
                        <button onClick={() => handleDelete(q._id)} className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete Question">
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PrelimsManager;
