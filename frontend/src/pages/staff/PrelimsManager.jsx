import React, { useState, useEffect } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { getPrelimsQuestions, addPrelimsQuestion, deletePrelimsQuestion } from '../../services/api';

const PrelimsManager = () => {
    const [questions, setQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        type: 'text',
        correctAnswer: '',
        disabilityMarker: 'DEFAULT'
    });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const data = await getPrelimsQuestions();
            setQuestions(data);
        } catch (err) {
            console.error('Failed to fetch prelims questions', err);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await addPrelimsQuestion(newQuestion);
            setNewQuestion({ question: '', type: 'text', correctAnswer: '', disabilityMarker: 'DEFAULT' });
            fetchQuestions();
        } catch (err) {
            console.error('Failed to add question', err);
        }
    };

    const autoGenerate = () => {
        const markers = ['DYSLEXIA', 'DYSGRAPHIA', 'DYSCALCULIA', 'DEFAULT'];
        const marker = markers[Math.floor(Math.random() * markers.length)];
        
        const templates = {
            DYSLEXIA: { q: "Spell the word 'Accommodation'.", a: "Accommodation" },
            DYSGRAPHIA: { q: "Type the following sentence as fast as you can: 'The quick brown fox jumps over the lazy dog.'", a: "The quick brown fox jumps over the lazy dog." },
            DYSCALCULIA: { q: "What is 15% of 200?", a: "30", type: "math" },
            DEFAULT: { q: "What is the capital of France?", a: "Paris" }
        };

        const gen = templates[marker];
        setNewQuestion({
            question: gen.q,
            type: gen.type || 'text',
            correctAnswer: gen.a,
            disabilityMarker: marker
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
        <div className="p-4 md:p-8 max-w-4xl mx-auto text-white">
            <h1 className="text-3xl font-bold mb-6 font-outfit tracking-tight animate-fade-in">Manage Prelims Questions</h1>
            
            <form onSubmit={handleAdd} className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-8 shadow-xl transition-all hover:shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Add New Question</h2>
                    <button 
                        type="button" 
                        onClick={autoGenerate}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105 flex items-center gap-2"
                    >
                        ✨ Auto-Generate via AI
                    </button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                    <input 
                        type="text" 
                        placeholder="Question text" 
                        className="p-3 bg-slate-900 rounded border border-slate-700"
                        value={newQuestion.question}
                        onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <select 
                            className="p-3 bg-slate-900 rounded border border-slate-700"
                            value={newQuestion.disabilityMarker}
                            onChange={(e) => setNewQuestion({...newQuestion, disabilityMarker: e.target.value})}
                        >
                            <option value="DEFAULT">General Knowledge (Default)</option>
                            <option value="DYSLEXIA">Spelling/Reading (Dyslexia Test)</option>
                            <option value="DYSGRAPHIA">Writing/Typing Speed (Dysgraphia Test)</option>
                            <option value="DYSCALCULIA">Math/Logic (Dyscalculia Test)</option>
                        </select>
                        <select 
                            className="p-3 bg-slate-900 rounded border border-slate-700"
                            value={newQuestion.type}
                            onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value})}
                        >
                            <option value="text">Short Text</option>
                            <option value="math">Math Expression</option>
                        </select>
                    </div>
                    <input 
                        type="text" 
                        placeholder="Correct Answer" 
                        className="p-3 bg-slate-900 rounded border border-slate-700"
                        value={newQuestion.correctAnswer}
                        onChange={(e) => setNewQuestion({...newQuestion, correctAnswer: e.target.value})}
                        required
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 p-3 rounded font-semibold flex justify-center items-center gap-2">
                        <PlusCircle size={20} /> Add Question
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">Existing Questions</h2>
                {questions.map((q, idx) => (
                    <div key={q._id || idx} className="bg-slate-800 p-4 rounded-xl flex justify-between items-center border border-slate-700">
                        <div>
                            <p className="font-medium text-lg">{q.question}</p>
                            <p className="text-sm text-slate-400">Marker: {q.disabilityMarker} | Answer: {q.correctAnswer}</p>
                        </div>
                        <button onClick={() => handleDelete(q._id)} className="text-red-400 hover:text-red-300 p-2">
                            <Trash2 size={20} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PrelimsManager;
