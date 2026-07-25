import React, { useState } from 'react';
import LandingPage from '../../dyscalculia/components/LandingPage';
import AnimationStage from '../../dyscalculia/components/AnimationStage';
import { solveMath } from '../../services/api';
import { ChevronLeft } from 'lucide-react';
import ErrorBoundary from '../../dyscalculia/components/ErrorBoundary';

// Import CSS (ensure scope doesn't leak too badly, though classes are specific)
import '../../dyscalculia/components/LandingPage.css';
import '../../dyscalculia/components/AnimationStage.css';

import { useToast } from '../../context/ToastContext';

// Component Logic
function DyscalculiaTool() {
    const toast = useToast();
    const [currentSolution, setCurrentSolution] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [view, setView] = useState('landing'); // 'landing' | 'player'

    const handleSolve = async (question) => {
        setIsProcessing(true);
        try {
            // Using central API service
            const data = await solveMath(question);

            if (data && !data.error) {
                setCurrentSolution(data);
                setView('player'); // Switch to video player
            } else {
                toast.error(data?.message || "Could not understand that math problem.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Something went wrong connecting to the brain.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBack = () => {
        setView('landing');
        setCurrentSolution(null);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#000' }}>
            <ErrorBoundary>
                <div className="app-container" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                    {view === 'landing' && (
                        <div style={{ flex: 1, overflow: 'auto' }}>
                            <LandingPage onSearch={handleSolve} isProcessing={isProcessing} />
                        </div>
                    )}

                    {view === 'player' && (
                        <div className="player-view" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
                            {/* Back Button Overlay */}
                            <div className="back-button-container" style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 100 }}>
                                <button
                                    onClick={handleBack}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                                        padding: '0.75rem 1rem', backgroundColor: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.2)', borderRadius: '0.5rem',
                                        color: 'white', cursor: 'pointer', backdropFilter: 'blur(4px)'
                                    }}
                                >
                                    <ChevronLeft size={20} />
                                    <span>Back to Search</span>
                                </button>
                            </div>

                            {/* The Video Player */}
                            <div style={{ flex: 1 }}>
                                <AnimationStage solution={currentSolution} />
                            </div>
                        </div>
                    )}
                </div>
            </ErrorBoundary>
        </div>
    );
}

export default DyscalculiaTool;
