import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatInterface({ onSolve, isProcessing }) {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState([
        { role: 'system', text: "Hello! I can help with calculus and numerical reasoning. Try asking: 'derivative of x squared' or 'If 1 pen costs 10 rupees...'" }
    ]);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isProcessing) return;

        const userText = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);

        onSolve(userText, (response) => {
            let replyText = "I couldn't understand that.";
            if (!response.error) {
                if (response.topic === 'numerical_reasoning') {
                    replyText = "Okay, let's break this problem down step by step.";
                } else {
                    replyText = `Okay, visualizing: ${response.topic} of ${response.expression}`;
                }
            } else {
                replyText = response.message || replyText;
            }
            setMessages(prev => [...prev, { role: 'system', text: replyText }]);
        });
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <Bot size={18} />
                </div>
                <span className="font-semibold text-gray-700">Math Assistant</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                            {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                        </div>
                        <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-gray-100 text-gray-800 rounded-tl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}
                {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <Sparkles size={16} className="text-gray-500 animate-spin" />
                        </div>
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none text-gray-500 text-sm flex gap-1 items-center">
                            Thinking <span className="animate-pulse">...</span>
                        </div>
                    </motion.div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type your math question..."
                        className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isProcessing}
                        className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:scale-95 transition-all shadow-lg shadow-indigo-200"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
