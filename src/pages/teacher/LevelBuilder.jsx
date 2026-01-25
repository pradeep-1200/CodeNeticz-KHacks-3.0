import React, { useState } from 'react';
import StaffNavbar from '../../components/StaffNavbar';
import { Plus, Trash2, Save, ArrowLeft, GripVertical, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherLevelBuilder = () => {
    const navigate = useNavigate();
    const [level, setLevel] = useState({
        title: '',
        description: '',
        difficulty: 'easy',
        xpReward: 500,
        tasks: []
    });

    const [isSaving, setIsSaving] = useState(false);

    const addTask = (type) => {
        const newTask = {
            id: Date.now(),
            type,
            props: {}
        };

        // Default props based on type
        if (type === 'quiz') {
            newTask.props = {
                question: '',
                options: ['', '', '', ''],
                correctAnswer: '',
                hint: ''
            };
        } else if (type === 'jumbled') {
            newTask.props = {
                sentence: ''
            };
        } else if (type === 'speech') {
            newTask.props = {
                promptText: '',
                expectedKeywords: []
            };
        }

        setLevel({ ...level, tasks: [...level.tasks, newTask] });
    };

    const removeTask = (id) => {
        setLevel({ ...level, tasks: level.tasks.filter(t => t.id !== id) });
    };

    const updateTaskProp = (taskId, prop, value) => {
        setLevel({
            ...level,
            tasks: level.tasks.map(t => {
                if (t.id === taskId) {
                    return { ...t, props: { ...t.props, [prop]: value } };
                }
                return t;
            })
        });
    };

    const saveLevel = async () => {
        if (!level.title) return alert("Please enter a level title");
        if (level.tasks.length === 0) return alert("Please add at least one task");

        setIsSaving(true);
        try {
            const res = await fetch('http://localhost:5000/api/levels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(level)
            });
            const data = await res.json();
            if (data.success) {
                alert("Level created successfully!");
                // Optionally navigate back or clear form
                setLevel({ title: '', description: '', difficulty: 'easy', xpReward: 500, tasks: [] });
            } else {
                alert("Error creating level: " + data.message);
            }
        } catch (err) {
            console.error(err);
            alert("Failed to save level");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            <StaffNavbar />

            <div className="container mx-auto px-6 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-full">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-black text-slate-800">Create New Level</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Level Metadata */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-2 uppercase">Level Title</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Intro to Grammar"
                                value={level.title}
                                onChange={(e) => setLevel({ ...level, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-500 mb-2 uppercase">Description</label>
                            <textarea
                                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="What will the student learn?"
                                rows="3"
                                value={level.description}
                                onChange={(e) => setLevel({ ...level, description: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase">Difficulty</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                                    value={level.difficulty}
                                    onChange={(e) => setLevel({ ...level, difficulty: e.target.value })}
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-bold text-slate-500 mb-2 uppercase">XP Reward</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                                    value={level.xpReward}
                                    onChange={(e) => setLevel({ ...level, xpReward: parseInt(e.target.value) })}
                                />
                            </div>
                        </div>

                        <button
                            onClick={saveLevel}
                            disabled={isSaving}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-black text-xl shadow-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                        >
                            {isSaving ? "Saving..." : <><Save size={20} /> PUBLISH LEVEL</>}
                        </button>
                    </div>

                    {/* Right Column: Task Builder */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Task Type Selector */}
                        <div className="grid grid-cols-3 gap-4">
                            <button onClick={() => addTask('quiz')} className="p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all font-bold text-slate-600 flex flex-col items-center gap-2">
                                <span className="text-2xl">❓</span> Quiz
                            </button>
                            <button onClick={() => addTask('jumbled')} className="p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all font-bold text-slate-600 flex flex-col items-center gap-2">
                                <span className="text-2xl">🧩</span> Jumbled
                            </button>
                            <button onClick={() => addTask('speech')} className="p-4 bg-white border-2 border-slate-200 rounded-xl hover:border-pink-500 hover:bg-pink-50 transition-all font-bold text-slate-600 flex flex-col items-center gap-2">
                                <span className="text-2xl">🗣️</span> Speech
                            </button>
                        </div>

                        {/* Task List */}
                        <div className="space-y-4">
                            {level.tasks.length === 0 && (
                                <div className="text-center p-12 border-4 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold">
                                    No tasks added yet. Click a button above to start building!
                                </div>
                            )}

                            {level.tasks.map((task, index) => (
                                <div key={task.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group">
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => removeTask(task.id)} className="text-red-400 hover:text-red-600 p-2">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-slate-100 p-2 rounded-lg cursor-grab">
                                            <GripVertical size={20} className="text-slate-400" />
                                        </div>
                                        <span className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold uppercase text-slate-500">
                                            {task.type}
                                        </span>
                                        <h3 className="font-bold text-lg text-slate-800">Task {index + 1}</h3>
                                    </div>

                                    {/* Dynamic Fields */}
                                    {task.type === 'quiz' && (
                                        <div className="space-y-4">
                                            <input
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                                                placeholder="Enter Question..."
                                                value={task.props.question}
                                                onChange={(e) => updateTaskProp(task.id, 'question', e.target.value)}
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                {task.props.options.map((opt, i) => (
                                                    <input
                                                        key={i}
                                                        className="p-3 bg-white border border-slate-200 rounded-xl text-sm"
                                                        placeholder={`Option ${i + 1}`}
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const newOpts = [...task.props.options];
                                                            newOpts[i] = e.target.value;
                                                            updateTaskProp(task.id, 'options', newOpts);
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="flex gap-4">
                                                <input
                                                    className="flex-1 p-3 bg-green-50 border border-green-200 rounded-xl font-medium text-green-700"
                                                    placeholder="Correct Answer (must match option)"
                                                    value={task.props.correctAnswer}
                                                    onChange={(e) => updateTaskProp(task.id, 'correctAnswer', e.target.value)}
                                                />
                                                <input
                                                    className="flex-1 p-3 bg-yellow-50 border border-yellow-200 rounded-xl font-medium text-yellow-700"
                                                    placeholder="Hint (Optional)"
                                                    value={task.props.hint}
                                                    onChange={(e) => updateTaskProp(task.id, 'hint', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {task.type === 'jumbled' && (
                                        <div>
                                            <input
                                                className="w-full p-4 bg-indigo-50 border border-indigo-200 rounded-xl font-bold text-indigo-900"
                                                placeholder="Type the full correct sentence here..."
                                                value={task.props.sentence}
                                                onChange={(e) => updateTaskProp(task.id, 'sentence', e.target.value)}
                                            />
                                            <p className="mt-2 text-xs text-slate-400">The system will automatically shuffle these words for the student.</p>
                                        </div>
                                    )}

                                    {task.type === 'speech' && (
                                        <div className="space-y-4">
                                            <textarea
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                                                placeholder="What should the student say?"
                                                rows="2"
                                                value={task.props.promptText}
                                                onChange={(e) => updateTaskProp(task.id, 'promptText', e.target.value)}
                                            />
                                            <input
                                                className="w-full p-3 bg-pink-50 border border-pink-200 rounded-xl font-medium text-pink-700"
                                                placeholder="Expected Keywords (comma separated)"
                                                value={Array.isArray(task.props.expectedKeywords) ? task.props.expectedKeywords.join(', ') : task.props.expectedKeywords}
                                                onChange={(e) => updateTaskProp(task.id, 'expectedKeywords', e.target.value.split(',').map(s => s.trim()))}
                                            />
                                            <p className="text-xs text-slate-400">If keywords are detected in the student's speech, they pass.</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherLevelBuilder;
