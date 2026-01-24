import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Play, Pause, Settings, Volume2, VolumeX, Captions } from 'lucide-react';
import { useWebSpeech } from '../hooks/useWebSpeech';
import { getNarrationText } from '../utils/narration';
import './AnimationStage.css';

// --- UTILS ---
const TERM_COLORS_CLASSES = [
    'term-blue',
    'term-orange',
    'term-emerald'
];

// Helper to convert string term (fallback) to object
// Matches backend 'parseTermDetails' logic roughly
const shimTerm = (rawStr) => {
    const clean = rawStr.replace(/\s+/g, '');
    let coeffStr = "1";
    let powerStr = "0";
    let isConst = true;
    let isLinear = false;
    let sign = clean.startsWith('-') ? '-' : '+';

    const absClean = clean.replace(/^[+-]/, '');

    if (absClean.includes('x')) {
        isConst = false;
        powerStr = "1";
        const pMatch = absClean.match(/\^(\d+)/);
        if (pMatch) powerStr = pMatch[1];
    }

    const baseMatch = absClean.split('x')[0];
    if (baseMatch === '' || baseMatch === '+') coeffStr = "1";
    else if (baseMatch === '-') coeffStr = "1";
    else coeffStr = baseMatch;

    let c = parseInt(coeffStr);
    if (sign === '-') c = c * -1;
    let p = parseInt(powerStr);

    if (p === 1 && !isConst) isLinear = true;

    return {
        original: rawStr, // keep exact string for display if needed
        coeff: c,
        power: p,
        type: isConst ? 'constant' : (isLinear ? 'linear' : 'power'),
        isConstant: isConst
    };
};

// --- TIMELINE BUILDER ---
const buildTimeline = (solution) => {
    const timeline = [];
    let currentTime = 0;
    const addPhase = (id, duration, label, extra = {}) => {
        timeline.push({ id, start: currentTime, duration, end: currentTime + duration, label, ...extra });
        currentTime += duration;
    };

    // Use backend parsedTerms if available, otherwise shim the expression strings
    let terms = [];
    if (solution.parsedTerms) {
        terms = solution.parsedTerms;
    } else if (solution.expression) {
        // Fallback split
        const parts = solution.expression.split(/(?=[+-])/).map(t => t.trim()).filter(p => p.length > 0);
        terms = parts.map(shimTerm);
    }

    if (solution.topic === "numerical_reasoning") {
        solution.steps.forEach((step, index) => {
            const phaseId = `SCENE_${step.scene}_${index}`;
            addPhase(phaseId, 6000, `Step ${step.scene}`, {
                visual: step.visual,
                text: step.text,
                sceneNumber: step.scene
            });
        });
        return { timeline, totalDuration: currentTime, terms: [] };
    }

    // 1. INTRO
    addPhase('INTRO', 3000, `Topic: ${solution.topic}`);

    // 2. RULE_INTRO
    addPhase('RULE_INTRO', 4000, 'The Rule');

    // 3. SHOW QUESTION
    addPhase('QUESTION_SHOW', 4000, 'The Problem');

    // 4. SPLIT
    const isMultiTerm = terms.length > 1;

    if (isMultiTerm && solution.topic === 'differentiation') {
        addPhase('SPLIT', 3000, 'Split Terms');

        // PARALLEL SOLVING FLOW
        addPhase('PARALLEL_STEP_1', 4000, 'Setup Terms');
        addPhase('PARALLEL_STEP_2', 4000, 'Apply Rule');
        addPhase('PARALLEL_STEP_3', 4000, 'Subtract Powers');
        addPhase('PARALLEL_STEP_4', 4000, 'Simplify');
        addPhase('PARALLEL_STEP_5', 3000, 'Finalize Terms');
        addPhase('PARALLEL_HOLD', 3000, 'Review Results');

    } else {
        // SEQUENTIAL SOLVE LOOP (for single term or fallback or integration)
        terms.forEach((term, index) => {
            // term is an Object now: { original, coeff, power, type }
            const baseId = `SOLVE_TERM_${index}`;

            if (solution.topic === 'differentiation') {
                if (term.type === 'linear') {
                    addPhase(`${baseId}_LINEAR_SETUP`, 4000, `Term ${index + 1}: Setup`, { termIndex: index, type: 'linear' });
                    addPhase(`${baseId}_LINEAR_RULE`, 4000, `Term ${index + 1}: Power Rule`, { termIndex: index, type: 'linear' });
                    addPhase(`${baseId}_LINEAR_SUBTRACT`, 4000, `Term ${index + 1}: Subtract`, { termIndex: index, type: 'linear' });
                    addPhase(`${baseId}_LINEAR_ZERO`, 4000, `Term ${index + 1}: Zero Power`, { termIndex: index, type: 'linear' });
                    addPhase(`${baseId}_LINEAR_FINAL`, 3000, `Term ${index + 1}: Simplified`, { termIndex: index, type: 'linear' });
                } else if (term.type === 'constant') {
                    addPhase(`${baseId}_SHOW`, 3000, `Term ${index + 1}: Constant`, { termIndex: index, type: 'constant' });
                    addPhase(`${baseId}_CONST_ZERO`, 3000, `Term ${index + 1}: Becomes Zero`, { termIndex: index, type: 'constant' });
                } else {
                    addPhase(`${baseId}_SHOW`, 3000, `Term ${index + 1}: Setup`, { termIndex: index, type: 'power' });
                    addPhase(`${baseId}_POWER_RULE`, 4000, `Term ${index + 1}: Power Rule`, { termIndex: index, type: 'power' });
                    addPhase(`${baseId}_SUBTRACT`, 4000, `Term ${index + 1}: Subtract`, { termIndex: index, type: 'power' });
                    addPhase(`${baseId}_SIMPLIFY`, 4000, `Term ${index + 1}: Simplify`, { termIndex: index, type: 'power' });
                    addPhase(`${baseId}_POWER_FINAL`, 3000, `Term ${index + 1}: Final`, { termIndex: index, type: 'power' });
                }
            } else {
                addPhase(`${baseId}_INTEGRATE`, 5000, `Integrate: ${term.original}`, { termIndex: index, type: 'integration' });
            }
        });
    }

    // 6. COMBINE
    addPhase('COMBINE', 4000, 'Combine Result');
    addPhase('FINAL_ANSWER', 4000, 'Final Answer');

    // 7. LIMITS (Integration)
    if (solution.limits) {
        addPhase('LIMITS_SETUP', 3000, 'Limits Setup');
        addPhase('LIMITS_CALC', 5000, 'Calculate Area');
    }

    return { timeline, totalDuration: currentTime, terms };
};

// --- VISUAL COMPONENTS ---

const IntroPhase = ({ title, sub }) => (
    <div className="intro-container">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="intro-title">{title}</motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="intro-subtitle">{sub}</motion.p>
    </div>
);

const RulePhase = ({ topic }) => {
    if (topic === 'integration') {
        return (
            <div className="rule-container">
                <h2 className="rule-label">Integration Power Rule</h2>
                <motion.div className="rule-formula" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    ∫ <span className="term-blue">x<sup>n</sup></span> dx =
                    <div style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 1rem', textAlign: 'center' }}>
                        <div style={{ borderBottom: '2px solid rgba(255,255,255,0.5)', paddingBottom: '0.2rem' }}>
                            x<sup className="term-orange">n+1</sup>
                        </div>
                        <div className="term-orange" style={{ paddingTop: '0.2rem' }}>n + 1</div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="rule-container">
            <h2 className="rule-label">Differentiation Power Rule</h2>
            <motion.div className="rule-formula" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                If <span className="term-blue">y = x<sup>n</sup></span>, then:
                <br /><br />
                <span className="term-orange">dy/dx = n · x<sup>n-1</sup></span>
            </motion.div>
        </div>
    );
};

// Granular Term Visualization - Updated for Schema Input
const GranularTermVisual = ({ termObj, phaseSuffix, type }) => {
    // termObj: { coeff, power, original, type, ... }

    // Safety check
    if (!termObj) return null;

    const c = termObj.coeff;
    const p = termObj.power;
    const cleanTerm = termObj.original.replace(/[+-]/, ''); // For display if needed

    // Check backend logic result if available for Final step
    // termObj.result might exist: { str: "4x", ... }

    const floatStyle = { display: 'inline-block' };
    const bigOp = { margin: '0 0.2em', color: '#9CA3AF' }; // Grey multiplier dot
    const numColor = '#FBBF24'; // Amber generic number
    const varColor = 'white';
    const opColor = '#EF4444'; // Red for subtraction action

    if (type === 'linear') { // ax
        if (phaseSuffix === 'LINEAR_SETUP') {
            return (
                <div className="term-large term-blue">
                    {c !== 1 ? c : ''}x<sup style={{ color: '#6B7280' }}>1</sup>
                    {c === 1 && termObj.original.includes('-') && '-'}
                </div>
            );
            // Note: simple negative handling visual. 
            // Real negative handling might want {c} to show -1.
            // If c is -2, it shows -2.
        }
        if (phaseSuffix === 'LINEAR_RULE') { // a * 1 * x^1
            return (
                <div className="term-large term-orange">
                    {c !== 1 && <>{c}<span style={bigOp}>×</span></>}
                    <span style={{ color: numColor }}>1</span>
                    <span style={bigOp}>·</span>
                    x<sup>1</sup>
                </div>
            );
        }
        if (phaseSuffix === 'LINEAR_SUBTRACT') { // a * 1 * x^(1-1)
            return (
                <div className="term-large term-orange">
                    {c !== 1 && <>{c}<span style={bigOp}>×</span></>}
                    <span style={{ color: numColor }}>1</span>
                    <span style={bigOp}>·</span>
                    x<sup>1 <span style={{ color: opColor }}>- 1</span></sup>
                </div>
            );
        }
        if (phaseSuffix === 'LINEAR_ZERO') { // a * x^0
            return (
                <div className="term-large term-emerald">
                    {c !== 1 && <>{c}<span style={bigOp}>·</span></>}
                    x<sup>0</sup>
                    <div style={{ fontSize: '0.5em', marginTop: '1rem', color: '#9CA3AF' }}>(x<sup>0</sup> = 1)</div>
                </div>
            );
        }
        if (phaseSuffix === 'LINEAR_FINAL') { // a
            // Use logical result if available
            const display = termObj.result?.str || c;
            return <div className="term-large term-emerald">{display}</div>;
        }
    }

    if (type === 'power') { // x^n
        if (phaseSuffix === 'SHOW') {
            return <div className="term-large term-blue">{c !== 1 ? c : ''}x<sup>{p}</sup></div>;
        }
        if (phaseSuffix === 'POWER_RULE') { // n * x^n
            return (
                <div className="term-large term-orange">
                    <span style={{ color: numColor }}>{p}</span>
                    <span style={bigOp}>·</span>
                    {c !== 1 && <>{c}</>}x<sup>{p}</sup>
                </div>
            );
        }
        if (phaseSuffix === 'SUBTRACT') { // n * x^(n-1)
            return (
                <div className="term-large term-orange">
                    <span style={{ color: numColor }}>{p * c}</span>
                    x<sup>{p} <span style={{ color: opColor }}>- 1</span></sup>
                </div>
            );
        }
        if (phaseSuffix === 'SIMPLIFY') {
            return (
                <div className="term-large term-emerald">
                    {p * c}x<sup>{p - 1}</sup>
                </div>
            );
        }
        if (phaseSuffix === 'POWER_FINAL') {
            // Use logic result
            const display = termObj.result?.str || `${p * c}x^${p - 1}`;

            // Format for superscripts if needed
            // Simple split by '^' for display
            const parts = display.toString().split('^');

            return (
                <div className="term-large term-emerald">
                    {parts[0]}{parts[1] ? <sup>{parts[1]}</sup> : ''}
                </div>
            );
        }
    }

    if (type === 'constant') {
        if (phaseSuffix === 'SHOW') return <div className="term-large term-blue">{termObj.original}</div>;
        return <div className="term-large term-emerald">0</div>;
    }

    return null;
};

// --- MAIN COMPONENT ---
export default function AnimationStage({ solution }) {
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showSubtitles, setShowSubtitles] = useState(true);
    const [currentSubtitle, setCurrentSubtitle] = useState("");

    const { speak, cancel } = useWebSpeech({
        rate: 0.8 * playbackRate,
        volume: isMuted ? 0 : 1
    });

    const lastSpokenRef = useRef(null);

    const { timeline, totalDuration, terms } = useMemo(() => {
        if (!solution) return { timeline: [], totalDuration: 0, terms: [] };
        return buildTimeline(solution);
    }, [solution]);

    const requestRef = useRef();
    const lastTimeRef = useRef();

    const animate = (time) => {
        if (lastTimeRef.current != undefined) {
            const deltaTime = time - lastTimeRef.current;
            setCurrentTime(prev => {
                const next = prev + (deltaTime * playbackRate);
                if (next >= totalDuration) {
                    setIsPlaying(false);
                    return totalDuration;
                }
                return next;
            });
        }
        lastTimeRef.current = time;
        if (isPlaying) requestRef.current = requestAnimationFrame(animate);
    };

    useEffect(() => {
        if (isPlaying) requestRef.current = requestAnimationFrame(animate);
        else {
            lastTimeRef.current = undefined;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        }
        return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
    }, [isPlaying, playbackRate, totalDuration]);

    useEffect(() => {
        setCurrentTime(0);
        setIsPlaying(false);
    }, [solution]);

    // Determining Active Phase
    const activePhaseIndex = timeline.findIndex(p => currentTime >= p.start && currentTime < p.end);
    const activePhase = activePhaseIndex !== -1 ? timeline[activePhaseIndex] : (currentTime >= totalDuration ? timeline[timeline.length - 1] : timeline[0]);

    // Narration Trigger
    useEffect(() => {
        if (!activePhase || !isPlaying) return;

        // Extract the pure ID key for mapping. 
        // Example: SOLVE_TERM_0_LINEAR_SETUP -> TERM_LINEAR_SETUP
        // We strip the prefix "SOLVE_TERM_\d+_"
        let narrationKey = activePhase.id;
        const match = activePhase.id.match(/SOLVE_TERM_\d+_(.+)/);
        if (match) {
            narrationKey = `TERM_${match[1]}`; // e.g. TERM_LINEAR_SETUP
        }

        // Parallel Narration Mapping
        if (activePhase.id.startsWith('PARALLEL_')) {
            narrationKey = activePhase.id; // Map directly
        }

        const signature = activePhase.id;
        if (lastSpokenRef.current !== signature) {
            let text = "";
            if (activePhase.text) {
                text = activePhase.text;
            } else {
                text = getNarrationText(narrationKey, { topic: solution?.topic, ...activePhase });
            }

            if (text) {
                speak(text);
                setCurrentSubtitle(text); // Sync subtitle text
                lastSpokenRef.current = signature;
            }
        }
    }, [activePhase, isPlaying, solution, speak]);


    // Rendering Screen
    const renderScreenContent = () => {
        if (!solution) return <div className="waiting-screen"><Play size={48} /></div>;

        // Route by ID pattern
        if (activePhase.id === 'INTRO') return <IntroPhase title={solution.topic.toUpperCase()} sub="Step-by-Step Visualization" />;
        if (activePhase.id.includes('RULE')) return <RulePhase topic={solution.topic} />;
        if (activePhase.id === 'QUESTION_SHOW') return <div className="term-large">{solution.expression}</div>;
        if (activePhase.id === 'SPLIT') return (
            <div className="math-split-row">
                {terms.map((t, i) => (
                    <div key={i} className={`math-equation-row ${TERM_COLORS_CLASSES[i % 3]}`}>
                        {t.original}
                    </div>
                ))}
            </div>
        );

        if (activePhase.id.startsWith('SCENE_')) {
            return (
                <div className="numerical-container">
                    <motion.div
                        key={activePhase.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="numerical-visual"
                    >
                        <div className="scene-badge">Step {activePhase.sceneNumber}</div>
                        <div className="term-giant">{activePhase.visual}</div>
                    </motion.div>
                </div>
            );
        }

        // --- PARALLEL VIEW RENDERER ---
        if (activePhase.id.startsWith('PARALLEL_')) {
            // Determine sub-phase for each term type
            // 1. SETUP -> LINEAR_SETUP, SHOW
            // 2. EXPAND -> LINEAR_RULE, POWER_RULE
            // 3. SUBTRACT -> LINEAR_SUBTRACT, SUBTRACT
            // 4. SIMPLIFY -> LINEAR_ZERO, SIMPLIFY
            // 5. FINAL -> LINEAR_FINAL, POWER_FINAL
            // HOLD -> same as FINAL

            const stepMap = {
                'PARALLEL_STEP_1': { linear: 'LINEAR_SETUP', power: 'SHOW', constant: 'SHOW' },
                'PARALLEL_STEP_2': { linear: 'LINEAR_RULE', power: 'POWER_RULE', constant: 'CONST_ZERO' },
                'PARALLEL_STEP_3': { linear: 'LINEAR_SUBTRACT', power: 'SUBTRACT', constant: 'CONST_ZERO' },
                'PARALLEL_STEP_4': { linear: 'LINEAR_ZERO', power: 'SIMPLIFY', constant: 'CONST_ZERO' },
                'PARALLEL_STEP_5': { linear: 'LINEAR_FINAL', power: 'POWER_FINAL', constant: 'CONST_ZERO' },
                'PARALLEL_HOLD': { linear: 'LINEAR_FINAL', power: 'POWER_FINAL', constant: 'CONST_ZERO' },
            };

            const currentStepMap = stepMap[activePhase.id];

            return (
                <div className="math-split-row" style={{ width: '100%', justifyContent: 'space-around' }}>
                    {terms.map((t, i) => {
                        // t is termObject
                        const type = t.type;
                        const suffix = currentStepMap[type];

                        return (
                            <div key={i} className="parallel-term-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={suffix}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                    >
                                        <GranularTermVisual termObj={t} phaseSuffix={suffix} type={type} />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            );
        }

        if (activePhase.id.startsWith('SOLVE_TERM')) {
            // Check for integration fallback
            const termObj = terms[activePhase.termIndex];

            if (activePhase.id.endsWith('INTEGRATE')) return <div className="term-large">∫ {termObj.original} dx</div>;

            // Granular Differentiation
            const suffix = activePhase.id.split(/SOLVE_TERM_\d+_/)[1];
            return (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activePhase.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        <GranularTermVisual termObj={termObj} phaseSuffix={suffix} type={activePhase.type} />
                    </motion.div>
                </AnimatePresence>
            );
        }

        if (activePhase.id === 'COMBINE' || activePhase.id === 'FINAL_ANSWER') {
            if (solution.topic === 'integration') {
                // INTEGRATION COMBINE
                const integralTerms = terms.map(t => {
                    const { coeff, power } = t;
                    const newPower = power + 1;
                    const divisor = newPower;
                    return { c: coeff, divisor: divisor, p: newPower };
                });

                // Simplified String Construction for Integration
                const parts = integralTerms.map((item, idx) => {
                    let termStr = "";
                    const isWhole = item.c % item.divisor === 0;
                    const val = item.c / item.divisor;

                    if (isWhole) {
                        termStr = `${val !== 1 ? val : ''}x${item.p === 1 ? '' : `^${item.p}`}`;
                        if (val === 1 && item.p === 0) termStr = "x"; // unlikely case for power rule
                    } else {
                        // fraction
                        termStr = `(${item.c}/${item.divisor})x^${item.p}`;
                    }

                    if (idx === 0) return termStr;
                    return ` + ${termStr}`;
                });

                let finalStr = parts.join("");
                if (!solution.limits) finalStr += " + C";

                return <div className="term-large term-emerald">∫ = {finalStr}</div>;
            }

            // Differentiation Logic (Existing) using Object Terms
            // Reconstruct final string from Logic Engine results if possible

            let finalStr = "";
            let processedParts = [];

            terms.forEach(t => {
                if (t.result && t.result.str !== "0") {
                    processedParts.push(t.result.str);
                }
            });

            if (processedParts.length > 0) {
                // Join with logic for signs?
                // result.str usually has sign unless it's first positive
                finalStr = processedParts.join(" + ").replace(/\+ -/g, "- ");
                // Simple join for now, refinement if needed
            } else {
                finalStr = "0";
            }

            return <div className="term-large term-emerald">dy/dx = {finalStr}</div>;
        }

        if (activePhase.id.startsWith('LIMITS')) {
            // Re-calculate integral terms for evaluation
            // Logic engine integration for limits
            const integralTerms = terms.map(t => {
                // Same logic as backend calculusSolver integration
                const { coeff, power } = t;
                // t is raw term here? No t is object 
                // WAIT: If using limits, we need INTEGRATED form.
                // The terms array currently has original problem terms.
                const newPower = power + 1;
                const divisor = newPower;
                return { c: coeff, divisor: divisor, p: newPower };
            });

            // Helper to get F(x) string for display
            const getFormulaStr = () => {
                return integralTerms.map((item, idx) => {
                    let termStr = "";
                    const isWhole = item.c % item.divisor === 0;
                    const val = item.c / item.divisor;
                    if (isWhole) {
                        termStr = `${val !== 1 ? val : ''}x${item.p === 1 ? '' : `^${item.p}`}`;
                        if (val === 1 && item.p === 0) termStr = "x";
                    } else {
                        termStr = `(${item.c}/${item.divisor})x^${item.p}`;
                    }
                    if (idx === 0) return termStr;
                    return ` + ${termStr}`;
                }).join("");
            };

            // Helper to evaluate F(x) numerically
            const evalF = (x) => {
                return integralTerms.reduce((acc, item) => {
                    return acc + (item.c / item.divisor) * Math.pow(x, item.p);
                }, 0);
            };

            const [lower, upper] = solution.limits;
            const valUpper = evalF(upper);
            const valLower = evalF(lower);
            const finalArea = valUpper - valLower;

            // Format numbers to avoid crazy decimals
            const fmt = (n) => Number.isInteger(n) ? n : parseFloat(n.toFixed(2));

            if (activePhase.id === 'LIMITS_SETUP') {
                return (
                    <div className="term-large" style={{ flexDirection: 'column' }}>
                        <div className="limits-view">
                            <div className="limit-bracket limit-bracket-left"></div>
                            <div className="term-orange">{getFormulaStr()}</div>
                            <div className="limit-bracket limit-bracket-right"></div>
                            <div className="limit-values">
                                <div>{upper}</div>
                                <div>{lower}</div>
                            </div>
                        </div>
                    </div>
                );
            }

            if (activePhase.id === 'LIMITS_CALC') {
                return (
                    <div className="numerical-container">
                        <div className="term-large term-orange" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                            ({fmt(valUpper)}) - ({fmt(valLower)})
                        </div>
                        <div className="term-giant term-emerald" style={{ marginTop: '2rem' }}>
                            = {fmt(finalArea)}
                        </div>
                        <div style={{ marginTop: '1rem', color: '#9CA3AF' }}>Final Answer</div>
                    </div>
                );
            }
        }

        return null;
    };

    return (
        <div className="player-container">
            <div className="cinema-screen">
                <div className="cinema-background-grid"></div>
                {renderScreenContent()}
                <div className="phase-label-container">
                    <span className="phase-label">{activePhase?.label}</span>
                </div>

                {/* Visual Subtitles Overlay */}
                <AnimatePresence>
                    {showSubtitles && currentSubtitle && (
                        <div className="subtitle-overlay-container">
                            <motion.div
                                key={currentSubtitle}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="subtitle-text"
                            >
                                {currentSubtitle}
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="player-controls">
                <button onClick={() => setIsPlaying(!isPlaying)} className="play-pause-btn">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>

                {/* Simple Progress Bar */}
                <div className="timeline-container" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setCurrentTime(((e.clientX - rect.left) / rect.width) * totalDuration);
                }}>
                    <div className="timeline-track">
                        <div style={{ width: `${(currentTime / totalDuration) * 100}%`, height: '100%', background: '#60A5FA' }}></div>
                    </div>
                </div>

                <div className="speed-controls">
                    {/* Speed Toggle Cycle */}
                    <button
                        onClick={() => {
                            const speeds = [0.5, 1, 1.5, 2];
                            const idx = speeds.indexOf(playbackRate);
                            setPlaybackRate(speeds[(idx + 1) % speeds.length]);
                        }}
                        className="speed-btn active"
                        style={{ minWidth: '3em' }}
                        title="Playback Speed"
                    >
                        {playbackRate}x
                    </button>

                    <div className="divider-vertical"></div>

                    <button onClick={() => setShowSubtitles(!showSubtitles)} className={`speed-btn ${showSubtitles ? 'active-icon' : ''}`} title="Toggle Captions">
                        <Captions size={18} />
                    </button>

                    <button onClick={() => setIsMuted(!isMuted)} className="speed-btn" title={isMuted ? "Unmute" : "Mute"}>
                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
