import React, { useState } from 'react';
import { Play, Pause, Mic, Volume2, ArrowRight, ArrowLeft, CheckCircle, HelpCircle } from 'lucide-react';

const questionsData = {
  easy: [
    { id: 1, type: 'mcq', question: "What is 5 + 3?", options: ["6", "7", "8", "9"], answer: "8" },
    { id: 2, type: 'audio', question: "Listen and type the word you hear.", audioText: "Elephant", answer: "elephant" },
  ],
  medium: [
    { id: 1, type: 'mcq', question: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: "Mars" },
    { id: 2, type: 'mcq', question: "What is the capital of France?", options: ["Berlin", "Madrid", "Paris", "Rome"], answer: "Paris" },
  ],
  hard: [
    { id: 1, type: 'mcq', question: "Solve for x: 2x + 4 = 10", options: ["2", "3", "4", "5"], answer: "3" },
    { id: 2, type: 'audio', question: "Spell the word 'Photosynthesis'", audioText: "Photosynthesis", answer: "Photosynthesis" },
  ]
};

const Assessment = () => {
  const [difficulty, setDifficulty] = useState('easy');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [completed, setCompleted] = useState(false);

  const questions = questionsData[difficulty];
  const currentQ = questions[currentStep];

  const handleSpeech = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  const handleVoiceInput = () => {
    setIsListening(true);
    // Mock STT
    setTimeout(() => {
      setIsListening(false);
      const mockResult = currentQ.type === 'audio' ? currentQ.answer : "Mock Answer";
      handleAnswer(mockResult);
      alert(`Heard: "${mockResult}"`);
    }, 2000);
  };

  const handleAnswer = (val) => {
    setAnswers({ ...answers, [currentStep]: val });
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (completed) {
     return (
        <div className="text-center p-10 bg-[var(--bg-primary)] rounded-2xl shadow-lg border-2 border-green-500">
           <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
           <h2 className="text-3xl font-bold mb-2">Assessment Complete!</h2>
           <p className="text-[var(--text-secondary)] mb-6">Great job completing the {difficulty} level assessment.</p>
           <button 
              onClick={() => { setCompleted(false); setCurrentStep(0); setAnswers({}); }}
              className="px-6 py-3 bg-[var(--accent-primary)] text-white rounded-xl font-bold"
           >
              Try Another
           </button>
        </div>
     );
  }

  return (
    <div className="max-w-3xl mx-auto">
       
       {/* Difficulty Selector */}
       <div className="mb-8 flex justify-center gap-4">
          {['easy', 'medium', 'hard'].map((level) => (
             <button
               key={level}
               onClick={() => { setDifficulty(level); setCurrentStep(0); setAnswers({}); }}
               className={`px-4 py-2 rounded-full font-bold capitalize transition-all ${
                  difficulty === level 
                  ? 'bg-[var(--accent-primary)] text-white shadow-lg scale-105' 
                  : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] border border-[var(--border-color)]'
               }`}
             >
                {level}
             </button>
          ))}
       </div>

       {/* Progress Bar */}
       <div className="w-full bg-gray-200 dark:bg-slate-700 h-3 rounded-full mb-8 overflow-hidden">
          <div 
             className="bg-[var(--success-color)] h-full transition-all duration-500"
             style={{ width: `${((currentStep) / questions.length) * 100}%` }}
          ></div>
       </div>

       {/* Question Card */}
       <div className="bg-[var(--bg-primary)] p-8 rounded-3xl shadow-xl border border-[var(--border-color)] min-h-[400px] flex flex-col justify-between">
          
          <div>
             <div className="flex justify-between items-start mb-6">
                <span className="text-[var(--text-secondary)] font-semibold uppercase tracking-wider text-sm">Question {currentStep + 1} of {questions.length}</span>
                <button onClick={() => handleSpeech(currentQ.question)} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                   <Volume2 size={24}/>
                </button>
             </div>

             <h2 className="text-2xl md:text-3xl font-bold mb-8 text-[var(--text-primary)]">
                {currentQ.question}
             </h2>

             {/* Content Area */}
             <div className="space-y-6">
                
                {currentQ.type === 'audio' && (
                   <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">
                      <button 
                        onClick={() => handleSpeech(currentQ.audioText)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-red-500 text-white animate-pulse' : 'bg-[var(--accent-primary)] text-white'}`}
                      >
                         {isPlaying ? <Pause size={24}/> : <Play size={24}/>}
                      </button>
                      <span className="font-medium text-[var(--text-secondary)]">Click play to listen</span>
                   </div>
                )}

                {/* Input Area */}
                {currentQ.type === 'mcq' ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentQ.options.map((opt) => (
                         <button
                           key={opt}
                           onClick={() => handleAnswer(opt)}
                           className={`p-4 rounded-xl text-left border-2 transition-all text-lg font-medium ${
                              answers[currentStep] === opt 
                              ? 'border-[var(--accent-primary)] bg-blue-50 dark:bg-slate-800 dark:border-blue-500 text-[var(--accent-primary)]' 
                              : 'border-transparent bg-[var(--bg-secondary)] hover:border-gray-300 dark:hover:border-slate-600'
                           }`}
                         >
                            {opt}
                         </button>
                      ))}
                   </div>
                ) : (
                   <div className="relative">
                      <input 
                         type="text" 
                         className="w-full p-4 pr-14 text-lg rounded-xl bg-[var(--bg-secondary)] border-2 border-[var(--border-color)] focus:border-[var(--accent-primary)] outline-none transition-all"
                         placeholder="Type your answer here..."
                         value={answers[currentStep] || ''}
                         onChange={(e) => handleAnswer(e.target.value)}
                      />
                      <button 
                         onClick={handleVoiceInput}
                         className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-[var(--accent-primary)]'}`}
                      >
                         <Mic size={24} />
                      </button>
                   </div>
                )}

             </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-[var(--border-color)]">
             <button 
               onClick={prevStep} 
               disabled={currentStep === 0}
               className="flex items-center gap-2 text-[var(--text-secondary)] font-bold hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed"
             >
                <ArrowLeft size={20}/> Previous
             </button>
             
             <button 
               onClick={nextStep}
               disabled={!answers[currentStep]} 
               className="flex items-center gap-2 px-8 py-3 bg-[var(--accent-primary)] text-white rounded-xl font-bold shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
             >
                {currentStep === questions.length - 1 ? 'Submit' : 'Next'} <ArrowRight size={20}/>
             </button>
          </div>

       </div>

    </div>
  );
};

export default Assessment;
