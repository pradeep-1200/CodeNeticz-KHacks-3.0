import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import './LandingPage.css';

export default function LandingPage({ onSearch, isProcessing }) {
    const [input, setInput] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !isProcessing) {
            onSearch(input);
        }
    };

    const suggestions = [
        "What is 20 percent of 50?",
        "If 1 pen costs 10 rupees, how much do 4 pens cost?",
        "A car goes 50 km in 1 hour. How far in 3 hours?",
        "integrate x from 1 to 3"
    ];

    return (
        <div className="landing-page">

            {/* Title Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="landing-content"
            >
                <h1 className="landing-title">
                    Math Visual Assistant
                </h1>
                <div className="landing-subtitle">
                    <p>I can explain Differentiation and Integration visually.</p>
                    <p className="landing-hint">Type something like:</p>
                </div>
            </motion.div>

            {/* Search Box */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="search-container"
            >
                <form onSubmit={handleSubmit} className="search-form">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="integrate x squared from one to two"
                        className="search-input"
                        disabled={isProcessing}
                    />

                    <button
                        type="submit"
                        disabled={!input.trim() || isProcessing}
                        className="search-button"
                    >
                        {isProcessing ? (
                            <Sparkles className="spinner" size={20} />
                        ) : (
                            <Send size={20} style={{ marginLeft: '2px' }} />
                        )}
                    </button>
                </form>
            </motion.div>

            {/* Suggestions */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="suggestions-container"
            >
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setInput(s);
                        }}
                        className="suggestion-chip"
                    >
                        {s}
                    </button>
                ))}
            </motion.div>

        </div>
    );
}
