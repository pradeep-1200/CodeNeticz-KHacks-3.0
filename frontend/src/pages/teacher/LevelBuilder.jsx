import React, { useState } from 'react';
import StaffNavbar from '../../components/StaffNavbar';
import { Plus, Trash2, Save, ArrowLeft, GripVertical, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { generateTaskWithAI, createLevel } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const TeacherLevelBuilder = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [level, setLevel] = useState({
        title: '',
        description: '',
        difficulty: 'easy',
        targetProfile: 'DEFAULT',
        levelType: 'general',
        order: 0,
        xpReward: 500,
        xpMultiplier: 1.0,
        tasks: []
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleLevelTypeChange = (type) => {
        const isSupport = type === 'support';
        setLevel(prev => ({
            ...prev,
            levelType: type,
            xpMultiplier: isSupport ? 1.2 : 1.0,
            xpReward: isSupport ? 600 : 500
        }));
    };

    const autoGenerateTask = async (taskType = 'quiz') => {
        setIsGenerating(true);
        try {
            const res = await generateTaskWithAI({
                targetProfile: level.targetProfile,
                difficulty: level.difficulty,
                taskType
            });
            if (res.success && res.task) {
                setLevel(prev => ({ ...prev, tasks: [...prev.tasks, res.task] }));
            }
        } catch (err) {
            console.error("AI Generation failed:", err);
            // Fallback manual generate
            const newTask = {
                id: Date.now(),
                type: taskType,
                props: taskType === 'quiz' ? {
                    question: 'AI Sample: Which of these is a noun?',
                    options: ['Run', 'Cat', 'Quickly', 'Under'],
                    correctAnswer: 'Cat',
                    hint: 'A person, place, or thing.'
                } : taskType === 'jumbled' ? {
                    sentence: 'The sun rises in the east'
                } : {
                    promptText: 'Read aloud: Learning is fun and rewarding.',
                    expectedKeywords: ['learning', 'fun']
                }
            };
            setLevel(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
        } finally {
            setIsGenerating(false);
        }
    };

    const addTask = (type) => {
        const newTask = {
            id: Date.now(),
            type,
            props: {}
        };

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

        setLevel(prev => ({ ...prev, tasks: [...prev.tasks, newTask] }));
    };

    const removeTask = (id) => {
        setLevel(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
    };

    const updateTaskProp = (taskId, prop, value) => {
        setLevel(prev => ({
            ...prev,
            tasks: prev.tasks.map(t => {
                if (t.id === taskId) {
                    return { ...t, props: { ...t.props, [prop]: value } };
                }
                return t;
            })
        }));
    };

    const saveLevel = async () => {
        if (!level.title) return toast.warning("Please enter a level title");
        if (level.tasks.length === 0) return toast.warning("Please add at least one task");

        setIsSaving(true);
        try {
            const data = await createLevel(level);
            if (data.success) {
                toast.success("Level created successfully!");
                navigate('/staff/dashboard');
            } else {
                toast.error("Error creating level: " + data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to save level");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            <StaffNavbar />

            <div className="container mx-auto px-6 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800">Create New Level</h1>
                        <p className="text-xs text-slate-500 font-semibold">Build general curriculum levels or profile-targeted support levels</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Level Metadata */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-fit space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Level Title</label>
                            <input
                                type="text"
                                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g. Intro to Grammar"
                                value={level.title}
                                onChange={(e) => setLevel({ ...level, title: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Description</label>
                            <textarea
                                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                                placeholder="What will the student learn?"
                                rows="3"
                                value={level.description}
                                onChange={(e) => setLevel({ ...level, description: e.target.value })}
                            />
                        </div>

                        {/* Level Type & Target Profile */}
                        <div className="space-y-4 pt-2 border-t border-slate-100">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Level Visibility Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleLevelTypeChange('general')}
                                        className={`py-2.5 px-3 rounded-xl font-extrabold text-xs border transition-all ${
                                            level.levelType === 'general'
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        🌍 General Level
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleLevelTypeChange('support')}
                                        className={`py-2.5 px-3 rounded-xl font-extrabold text-xs border transition-all ${
                                            level.levelType === 'support'
                                                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                        }`}
                                    >
                                        🎯 Support Level
                                    </button>
                                </div>
                                {level.levelType === 'support' && (
                                    <p className="text-[11px] text-purple-600 font-semibold mt-2">
                                        ✨ Auto-assigned to matching student profiles. Grants +20% bonus XP multiplier!
                                    </p>
                                )}
                            </div>

                            {level.levelType === 'support' && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Target Support Profile</label>
                                    <select
                                        className="w-full p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl font-bold transition-all"
                                        value={level.targetProfile}
                                        onChange={(e) => setLevel({ ...level, targetProfile: e.target.value })}
                                    >
                                        <option value="READING_SUPPORT">📖 Reading Support</option>
                                        <option value="NUMBER_SUPPORT">🔢 Number/Math Support</option>
                                        <option value="VOICE_INPUT">🗣️ Speech & Voice Support</option>
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Difficulty Tier</label>
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm"
                                        value={level.difficulty}
                                        onChange={(e) => setLevel({ ...level, difficulty: e.target.value })}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Order Sequence</label>
                                    <input
                                        type="number"
                                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm"
                                        value={level.order}
                                        onChange={(e) => setLevel({ ...level, order: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Base XP Reward</label>
                                <input
                                    type="number"
                                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm"
                                    value={level.xpReward}
                                    onChange={(e) => setLevel({ ...level, xpReward: parseInt(e.target.value) || 500 })}
                                />
                            </div>
                        </div>

                        <button
                            onClick={saveLevel}
                            disabled={isSaving}
                            className="w-full py-4 bg-green-600 text-white rounded-xl font-black text-lg shadow-lg hover:bg-green-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {isSaving ? "Saving..." : <><Save size={20} /> PUBLISH LEVEL</>}
                        </button>
                    </div>

                    {/* Right Column: Task Builder */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Task Type Selector */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="font-bold text-slate-700">Add Task</h2>
                                <button
                                    onClick={() => autoGenerateTask('quiz')}
                                    disabled={isGenerating}
                                    className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-bold text-xs hover:shadow-md hover:scale-105 transition-all flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    <Sparkles size={14} />
                                    {isGenerating ? 'Generating...' : 'Auto-Generate via AI'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <button onClick={() => addTask('quiz')} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 hover:scale-105 transition-all font-bold text-slate-600 flex flex-col items-center gap-2">
                                    <span className="text-2xl">❓</span> Quiz
                                </button>
                                <button onClick={() => addTask('jumbled')} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 hover:scale-105 transition-all font-bold text-slate-600 flex flex-col items-center gap-2">
                                    <span className="text-2xl">🧩</span> Jumbled
                                </button>
                                <button onClick={() => addTask('speech')} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-xl hover:border-pink-500 hover:bg-pink-50 hover:scale-105 transition-all font-bold text-slate-600 flex flex-col items-center gap-2">
                                    <span className="text-2xl">🗣️</span> Speech
                                </button>
                            </div>
                        </div>

                        {/* Task List */}
                        <div className="space-y-4">
                            {level.tasks.length === 0 && (
                                <div className="text-center p-12 border-4 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold">
                                    No tasks added yet. Click a button above to start building!
                                </div>
                            )}

                            {level.tasks.map((task, index) => (
                                <div key={task.id || index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group">
                                    <div className="absolute top-4 right-4">
                                        <button onClick={() => removeTask(task.id)} className="text-red-400 hover:text-red-600 p-2 transition-colors">
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
                                                value={task.props.question || ''}
                                                onChange={(e) => updateTaskProp(task.id, 'question', e.target.value)}
                                            />
                                            <div className="grid grid-cols-2 gap-3">
                                                {(task.props.options || ['', '', '', '']).map((opt, i) => (
                                                    <input
                                                        key={i}
                                                        className="p-3 bg-white border border-slate-200 rounded-xl text-sm"
                                                        placeholder={`Option ${i + 1}`}
                                                        value={opt}
                                                        onChange={(e) => {
                                                            const newOpts = [...(task.props.options || [])];
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
                                                    value={task.props.correctAnswer || ''}
                                                    onChange={(e) => updateTaskProp(task.id, 'correctAnswer', e.target.value)}
                                                />
                                                <input
                                                    className="flex-1 p-3 bg-yellow-50 border border-yellow-200 rounded-xl font-medium text-yellow-700"
                                                    placeholder="Hint (Optional)"
                                                    value={task.props.hint || ''}
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
                                                value={task.props.sentence || ''}
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
                                                value={task.props.promptText || ''}
                                                onChange={(e) => updateTaskProp(task.id, 'promptText', e.target.value)}
                                            />
                                            <input
                                                className="w-full p-3 bg-pink-50 border border-pink-200 rounded-xl font-medium text-pink-700"
                                                placeholder="Expected Keywords (comma separated)"
                                                value={Array.isArray(task.props.expectedKeywords) ? task.props.expectedKeywords.join(', ') : task.props.expectedKeywords || ''}
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
