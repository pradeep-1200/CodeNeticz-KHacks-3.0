import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import AnimationStage from './components/AnimationStage';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import './App.css';

import ErrorBoundary from './components/ErrorBoundary';

function App() {
    const [currentSolution, setCurrentSolution] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [view, setView] = useState('landing'); // 'landing' | 'player'

    const handleSolve = async (question) => {
        setIsProcessing(true);
        try {
            const res = await axios.post('/api/solve', { question });

            if (res.data && !res.data.error) {
                setCurrentSolution(res.data);
                setView('player'); // Switch to video player
            } else {
                alert(res.data.message || "Could not understand that math problem.");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong connecting to the brain.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBack = () => {
        setView('landing');
        setCurrentSolution(null);
    };

    return (
        <ErrorBoundary>
            <div className="app-container">
                {view === 'landing' && (
                    <LandingPage onSearch={handleSolve} isProcessing={isProcessing} />
                )}

                {view === 'player' && (
                    <div className="player-view">
                        {/* Back Button Overlay */}
                        <div className="back-button-container">
                            <button
                                onClick={handleBack}
                                className="back-button"
                            >
                                <ChevronLeft size={20} />
                                <span>Back to Search</span>
                            </button>
                        </div>

                        {/* The Video Player */}
                        <AnimationStage solution={currentSolution} />
                    </div>
                )}
            </div>
        </ErrorBoundary>
    );
}

export default App;
