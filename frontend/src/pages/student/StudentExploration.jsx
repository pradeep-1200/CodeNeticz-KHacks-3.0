import React, { useState } from 'react';
import { 
    BookOpen, 
    Edit3, 
    Calculator, 
    Settings, 
    Volume2, 
    Mic, 
    Type, 
    Eye, 
    ArrowRight, 
    Check, 
    Play, 
    ZoomIn,
    Monitor
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SECTION_DURATION = 180; // 3 minutes per section roughly

export default function StudentExploration() {
    const navigate = useNavigate();
    const [step, setStep] = useState('intro'); // intro, reading, writing, math, tools, report
    const [selectedClass, setSelectedClass] = useState('5');
    const [observations, setObservations] = useState({});
    const [preferences, setPreferences] = useState({
        tts: false,
        contrast: 'normal',
        fontSize: 'medium'
    });

    const handleStart = () => setStep('reading');

    const handleNext = (currentSection, data) => {
        setObservations(prev => ({ ...prev, [currentSection]: data }));
        if (currentSection === 'reading') setStep('writing');
        else if (currentSection === 'writing') setStep('math');
        else if (currentSection === 'math') setStep('tools');
        else if (currentSection === 'tools') setStep('report');
    };

    const togglePreference = (key) => {
        setPreferences(prev => ({
            ...prev,
            [key]: key === 'contrast' ? (prev.contrast === 'normal' ? 'high' : 'normal') :
                   key === 'fontSize' ? (prev.fontSize === 'medium' ? 'large' : 'medium') :
                   !prev[key]
        }));
    };

    const getStyles = () => ({
        fontSize: preferences.fontSize === 'large' ? '1.2rem' : '1rem',
        background: preferences.contrast === 'high' ? '#000' : '#fff',
        color: preferences.contrast === 'high' ? '#ffeb3b' : '#333',
        minHeight: '100vh',
        transition: 'all 0.3s ease'
    });

    return (
        <div style={getStyles()} className="exploration-container">
            <header style={{ 
                padding: '1rem 2rem', 
                borderBottom: '1px solid #eee', 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                background: preferences.contrast === 'high' ? '#111' : '#fff'
            }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>ACLC Exploration</div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => togglePreference('tts')} title="Text to Speech" style={{ padding: '8px', borderRadius: '50%', background: preferences.tts ? '#e3f2fd' : 'transparent', border: 'none' }}>
                        <Volume2 size={20} />
                    </button>
                    <button onClick={() => togglePreference('fontSize')} title="Adjust Font Size" style={{ padding: '8px', borderRadius: '50%', background: preferences.fontSize === 'large' ? '#e3f2fd' : 'transparent', border: 'none' }}>
                        <Type size={20} />
                    </button>
                    <button onClick={() => togglePreference('contrast')} title="High Contrast" style={{ padding: '8px', borderRadius: '50%', background: preferences.contrast === 'high' ? '#333' : 'transparent', border: 'none' }}>
                        <Eye size={20} />
                    </button>
                </div>
            </header>

            <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                {step === 'intro' && (
                    <IntroSection selectedClass={selectedClass} setSelectedClass={setSelectedClass} onStart={handleStart} />
                )}
                {step === 'reading' && (
                    <ReadingSection onNext={(data) => handleNext('reading', data)} />
                )}
                {step === 'writing' && (
                    <WritingSection onNext={(data) => handleNext('writing', data)} />
                )}
                {step === 'math' && (
                    <MathSection onNext={(data) => handleNext('math', data)} />
                )}
                {step === 'tools' && (
                    <ToolsSection onNext={(data) => handleNext('tools', data)} />
                )}
                {step === 'report' && (
                    <ReportSection observations={observations} preferences={preferences} onExit={() => navigate('/teacher/dashboard')} />
                )}
            </main>
        </div>
    );
}

// --- Sections ---

const IntroSection = ({ selectedClass, setSelectedClass, onStart }) => (
    <div className="section-card fade-in">
        <h1>Welcome! 👋</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            We're going to explore how you like to learn. There are no grades here.
            Just try the activities and let us know what feels best for you.
        </p>
        
        <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Your Class:</label>
            <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
                style={{ padding: '0.8rem', width: '100%', borderRadius: '8px', border: '1px solid #ccc' }}
            >
                {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>Class {i + 1}</option>
                ))}
            </select>
        </div>

        <button 
            onClick={onStart}
            style={{ 
                background: 'var(--primary-color, #1a73e8)', 
                color: 'white', 
                padding: '1rem 2rem', 
                borderRadius: '50px', 
                border: 'none', 
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}
        >
            Start Exploration <ArrowRight size={20} />
        </button>
    </div>
);

const ReadingSection = ({ onNext }) => {
    const [time, setTime] = useState(0);
    // In a real app, use useEffect to track time
    
    return (
        <div className="section-card fade-in">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#1a73e8' }}>
                <BookOpen size={24} />
                <h2 style={{ margin: 0 }}>Reading</h2>
            </div>
            
            <div style={{ background: '#f8f9fa', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem', lineHeight: '1.8' }}>
                <h3>The Solar System</h3>
                <p>
                    The Solar System is made up of the Sun and all the smaller objects that move around it. 
                    Apart from the Sun, the largest members of the Solar System are the eight major planets. 
                    Near the Sun are four small, rocky planets: Mercury, Venus, Earth, and Mars.
                </p>
                <p>
                    Beyond Mars are the four giant planets: Jupiter, Saturn, Uranus, and Neptune. 
                    These giants are mostly made of gas and ice. Between the rocky planets and the giants 
                    is the Asteroid Belt, a ring of thousands of rocks.
                </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                    onClick={() => onNext({ context: 'Reading', preference: 'Visual', timeSpent: '45s' })}
                    className="primary-btn"
                >
                    I'm Done Reading <Check size={18} style={{ marginLeft: '8px' }}/>
                </button>
            </div>
        </div>
    );
};

const WritingSection = ({ onNext }) => (
    <div className="section-card fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#e37400' }}>
            <Edit3 size={24} />
            <h2 style={{ margin: 0 }}>Expression</h2>
        </div>

        <p style={{ marginBottom: '1.5rem' }}>How would you describe your favorite animal?</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <button style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: '12px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <div style={{ padding: '12px', background: '#fce8e6', borderRadius: '50%', color: '#d93025' }}><Mic size={24} /></div>
                <span>Speak Answer</span>
            </button>
            <button style={{ padding: '2rem', border: '2px dashed #ccc', borderRadius: '12px', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                <div style={{ padding: '12px', background: '#e6f4ea', borderRadius: '50%', color: '#137333' }}><Type size={24} /></div>
                <span>Type Answer</span>
            </button>
        </div>

        <textarea 
            placeholder="Or type here..." 
            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '1px solid #ccc', minHeight: '100px', marginBottom: '1rem' }}
        ></textarea>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => onNext({ mode: 'Mixed', confidence: 'High' })} className="primary-btn">
                Next Activity <ArrowRight size={18} style={{ marginLeft: '8px' }}/>
            </button>
        </div>
    </div>
);

const MathSection = ({ onNext }) => (
    <div className="section-card fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#137333' }}>
            <Calculator size={24} />
            <h2 style={{ margin: 0 }}>Logic & Math</h2>
        </div>

        <div style={{ marginBottom: '2rem' }}>
            <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Solving: <strong>12 × 4</strong></p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ padding: '1rem', border: '1px solid #dadce0', borderRadius: '8px', width: '200px' }}>
                    <span style={{ display: 'block', fontSize: '0.9rem', color: '#5f6368', marginBottom: '0.5rem' }}>Visual Method</span>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {[...Array(4)].map((_, i) => (
                            <div key={i} style={{ width: '40px', height: '20px', background: '#e6f4ea', border: '1px solid #ceead6' }}>12</div>
                        ))}
                    </div>
                </div>
                
                <div style={{ padding: '1rem', border: '1px solid #dadce0', borderRadius: '8px', width: '200px' }}>
                    <span style={{ display: 'block', fontSize: '0.9rem', color: '#5f6368', marginBottom: '0.5rem' }}>Step-by-Step</span>
                    <div>10 × 4 = 40</div>
                    <div>2 × 4 = 8</div>
                    <div>40 + 8 = 48</div>
                </div>
            </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => onNext({ preference: 'Step-by-step', speed: 'Normal' })} className="primary-btn">
                Continue <ArrowRight size={18} style={{ marginLeft: '8px' }}/>
            </button>
        </div>
    </div>
);

const ToolsSection = ({ onNext }) => (
    <div className="section-card fade-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#9334e6' }}>
            <Settings size={24} />
            <h2 style={{ margin: 0 }}>Tools Exploration</h2>
        </div>

        <p>Try these tools. Which ones make the screen easier to see?</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {['Focus Mode', 'Read Aloud', 'Dark Mode', 'Large Text'].map(tool => (
                <button key={tool} style={{ padding: '1rem', border: '1px solid #dadce0', borderRadius: '8px', background: 'white', cursor: 'pointer' }}>
                    {tool}
                </button>
            ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => onNext({ likedTools: ['Focus Mode', 'Dark Mode'] })} className="primary-btn">
                Finish & See Report <Check size={18} style={{ marginLeft: '8px' }}/>
            </button>
        </div>
    </div>
);

const ReportSection = ({ observations, preferences, onExit }) => (
    <div className="section-card fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', background: '#e6f4ea', color: '#137333', marginBottom: '1rem' }}>
                <Check size={40} />
            </div>
            <h1>Good Job!</h1>
            <p>You've completed the preliminary exploration.</p>
        </div>

        <div style={{ background: '#f8f9fa', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Learning Interaction Summary</h2>
            <p style={{ marginBottom: '1rem' }}>
                The learner demonstrates a preference for <strong>visual aids</strong> and <strong>high contrast</strong> text. 
                Reading speed is steady, but comfort improves significantly with <strong>text-to-speech</strong> options available.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
                <div>
                    <h3 style={{ fontSize: '1rem', color: '#137333' }}>Strengths Observed</h3>
                    <ul style={{ paddingLeft: '1.2rem', color: '#3c4043' }}>
                        <li>Quick navigation of visual math problems</li>
                        <li>Confident expression in typing mode</li>
                        <li>Effective use of focus tools</li>
                    </ul>
                </div>
                <div>
                    <h3 style={{ fontSize: '1rem', color: '#e37400' }}>Recommended Supports</h3>
                    <ul style={{ paddingLeft: '1.2rem', color: '#3c4043' }}>
                        <li>Enable Dark Mode by default</li>
                        <li>Provide step-by-step math hints</li>
                        <li>Allow voice-to-text for long answers</li>
                    </ul>
                </div>
            </div>
        </div>

        <div style={{ textAlign: 'center' }}>
            <button onClick={onExit} className="primary-btn">
                Return to Dashboard
            </button>
        </div>
    </div>
);
