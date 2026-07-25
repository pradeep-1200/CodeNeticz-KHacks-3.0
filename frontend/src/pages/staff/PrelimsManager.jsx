import React, { useState, useEffect } from 'react';
import { Plus, Trash2, BookOpen, Layers, CheckCircle } from 'lucide-react';
import StaffNavbar from '../../components/StaffNavbar';
import { getPrelimsQuestions, addPrelimsQuestion, deletePrelimsQuestion, seedPrelimsQuestions } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const PrelimsManager = () => {
    const toast = useToast();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSeeding, setIsSeeding] = useState(false);
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        domain: 'reading',
        type: 'mcq',
        passage: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        sequenceItems: '',
        isUngraded: false
    });

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const data = await getPrelimsQuestions();
            setQuestions(data || []);
        } catch (err) {
            console.error("Failed to load prelims questions:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newQuestion.question || (!newQuestion.correctAnswer && !newQuestion.isUngraded)) {
            return toast.warning("Please fill in question and correct answer!");
        }

        try {
            const payload = {
                ...newQuestion,
                sequenceItems: newQuestion.type === 'sequence' 
                    ? newQuestion.sequenceItems.split(',').map(s => s.trim()).filter(Boolean)
                    : []
            };
            await addPrelimsQuestion(payload);
            toast.success("Question added!");
            setNewQuestion({
                question: '',
                domain: 'reading',
                type: 'mcq',
                passage: '',
                options: ['', '', '', ''],
                correctAnswer: '',
                sequenceItems: '',
                isUngraded: false
            });
            loadQuestions();
        } catch (err) {
            console.error("Failed to add question:", err);
            toast.error("Error adding question.");
        }
    };

    const handleDelete = (id) => {
        toast.confirm({
            title: "Delete Question",
            message: "Are you sure you want to delete this question from the diagnostic pool?",
            onConfirm: async () => {
                try {
                    await deletePrelimsQuestion(id);
                    toast.success("Question deleted.");
                    loadQuestions();
                } catch (err) {
                    console.error("Failed to delete question:", err);
                    toast.error("Failed to delete question.");
                }
            }
        });
    };

    const handleSeed = () => {
        toast.confirm({
            title: "Seed Diagnostic Questions",
            message: "Seed 28 standard domain-structured questions? This will reset existing questions.",
            onConfirm: async () => {
                setIsSeeding(true);
                try {
                    await seedPrelimsQuestions();
                    toast.success("Prelims questions seeded successfully!");
                    loadQuestions();
                } catch (err) {
                    console.error("Failed to seed:", err);
                    toast.error("Failed to seed questions.");
                } finally {
                    setIsSeeding(false);
                }
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            <StaffNavbar />

            <div className="container mx-auto px-6 py-8 max-w-6xl space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Prelims Assessment Manager</h1>
                        <p className="text-xs text-slate-500 font-bold mt-1">Configure domain diagnostic questions (Reading, Writing, Math, Preferences)</p>
                    </div>
                    <button
                        onClick={handleSeed}
                        disabled={isSeeding}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
                    >
                        <Layers size={16} />
                        {isSeeding ? "Seeding..." : "🌱 Seed 28 Standard Questions"}
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Add Question Form */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit space-y-4">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Plus size={18} className="text-indigo-600" /> Add Diagnostic Question
                        </h2>

                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Domain</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm"
                                    value={newQuestion.domain}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, domain: e.target.value })}
                                >
                                    <option value="reading">📖 Reading</option>
                                    <option value="writing">✏️ Writing</option>
                                    <option value="math">🔢 Math</option>
                                    <option value="preference">⚙️ Preference (Ungraded)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Question Type</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm"
                                    value={newQuestion.type}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                                >
                                    <option value="mcq">Multiple Choice (MCQ)</option>
                                    <option value="sequence">Sequence / Ordering</option>
                                    <option value="text">Text Input / STT</option>
                                    <option value="math">Math Input</option>
                                </select>
                            </div>

                            {newQuestion.domain === 'reading' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Reading Passage (Optional)</label>
                                    <textarea
                                        className="w-full p-3 bg-indigo-50 border border-indigo-200 text-indigo-950 rounded-xl text-xs font-medium"
                                        placeholder="Passage text displayed above question..."
                                        rows="3"
                                        value={newQuestion.passage}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, passage: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Question Prompt</label>
                                <textarea
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium"
                                    placeholder="e.g., What is 24 + 37?"
                                    rows="2"
                                    value={newQuestion.question}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
                                    required
                                />
                            </div>

                            {newQuestion.type === 'mcq' && (
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase">MCQ Options</label>
                                    {newQuestion.options.map((opt, i) => (
                                        <input
                                            key={i}
                                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                                            placeholder={`Option ${i + 1}`}
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...newQuestion.options];
                                                newOpts[i] = e.target.value;
                                                setNewQuestion({ ...newQuestion, options: newOpts });
                                            }}
                                        />
                                    ))}
                                </div>
                            )}

                            {newQuestion.type === 'sequence' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Sequence Items (Comma Separated)</label>
                                    <input
                                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                                        placeholder="e.g. the, dog, barked, loudly"
                                        value={newQuestion.sequenceItems}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, sequenceItems: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Correct Answer</label>
                                <input
                                    className="w-full p-3 bg-green-50 border border-green-200 text-green-800 font-bold rounded-xl text-sm"
                                    placeholder="Exact correct answer string"
                                    value={newQuestion.correctAnswer}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md"
                            >
                                Add Question
                            </button>
                        </form>
                    </div>

                    {/* Question List Grouped by Domain */}
                    <div className="lg:col-span-2 space-y-6">
                        {loading ? (
                            <div className="text-center py-12 font-bold text-slate-400">Loading questions...</div>
                        ) : questions.length === 0 ? (
                            <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-300 text-slate-400 font-bold">
                                No questions found. Click "Seed 28 Standard Questions" above to populate!
                            </div>
                        ) : (
                            ['reading', 'writing', 'math', 'preference'].map(dom => {
                                const domQs = questions.filter(q => (q.domain || 'reading') === dom);
                                if (domQs.length === 0) return null;
                                return (
                                    <div key={dom} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                                        <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs flex items-center justify-between">
                                            <span>
                                                {dom === 'reading' ? '📖 Reading Domain' : dom === 'writing' ? '✏️ Writing Domain' : dom === 'math' ? '🔢 Math Domain' : '⚙️ Preferences (Ungraded)'}
                                            </span>
                                            <span className="text-slate-400 font-semibold">{domQs.length} questions</span>
                                        </h3>

                                        <div className="space-y-3">
                                            {domQs.map((q, idx) => (
                                                <div key={q._id || idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-start gap-4">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-[10px] font-black uppercase bg-slate-200 px-2 py-0.5 rounded text-slate-600">
                                                                {q.type}
                                                            </span>
                                                            {q.passage && (
                                                                <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                                                                    Passage Included
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h4 className="font-bold text-sm text-slate-800">{q.question}</h4>
                                                        <p className="text-xs text-green-600 font-bold mt-1">Ans: {q.correctAnswer}</p>
                                                    </div>
                                                    <button onClick={() => handleDelete(q._id)} className="text-red-400 hover:text-red-600 p-1">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrelimsManager;
