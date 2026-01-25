import React, { useState, useEffect } from 'react';
import { getAssessmentQuestions, completeActivity, transcribeAudio } from '../services/api';
import {
   Play, Pause, Mic, Volume2, ArrowRight, ArrowLeft, CheckCircle,
   HelpCircle, Keyboard, Spline, Save, Trash2, Square, Eye, FileText, MessageSquare, Headphones
} from 'lucide-react';

const Assessment = () => {
   const [difficulty, setDifficulty] = useState('easy');
   const [currentStep, setCurrentStep] = useState(0);
   const [answers, setAnswers] = useState({});
   const [isPlaying, setIsPlaying] = useState(false);
   const [isListening, setIsListening] = useState(false);
   const [completed, setCompleted] = useState(false);
   const [answerMode, setAnswerMode] = useState('type');
   const [learningMode, setLearningMode] = useState('default'); // default, dyslexia, dyscalculia, dysgraphia
   const [assistantLoading, setAssistantLoading] = useState(false);
   const [simplifiedText, setSimplifiedText] = useState('');
   const [summarizedText, setSummarizedText] = useState('');
   const [assistantText, setAssistantText] = useState(''); // Text input for AI assistants

   const [questionsData, setQuestionsData] = useState({ easy: [], medium: [], challenge: [] });
   const [questionsLoaded, setQuestionsLoaded] = useState(false);

   useEffect(() => {
      const fetchQ = async () => {
         const data = await getAssessmentQuestions();
         if (data && data.length > 0) {
            const grouped = {
               easy: data.filter(q => q.difficulty === 'easy'),
               medium: data.filter(q => q.difficulty === 'medium'),
               challenge: data.filter(q => q.difficulty === 'challenge')
            };
            setQuestionsData(grouped);
         }
         setQuestionsLoaded(true);
      };
      fetchQ();
   }, []);

   const questions = questionsData[difficulty]?.length > 0 ? questionsData[difficulty] : [];
   const currentQ = questions[currentStep] || { question: "Loading...", options: [], type: 'mcq' };

   if (!questionsLoaded) return <div className="p-8 text-center">Loading Assessment...</div>;
   if (questions.length === 0) return <div className="p-8 text-center">No questions found for this level.</div>;

   const handleSpeech = (text) => {
      if ('speechSynthesis' in window) {
         // If already playing, stop first
         if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
            return;
         }

         // Cancel any pending speech
         window.speechSynthesis.cancel();

         const utterance = new SpeechSynthesisUtterance(text);
         const voices = window.speechSynthesis.getVoices();
         const preferredVoice = voices.find(v => v.lang.startsWith('en') && !v.name.includes("Microsoft")) || voices[0];
         if (preferredVoice) utterance.voice = preferredVoice;

         utterance.onend = () => setIsPlaying(false);
         utterance.onerror = (e) => {
            // Only log actual errors, not interruptions
            if (e.error !== 'interrupted') {
               console.error("TTS Error:", e);
            }
            setIsPlaying(false);
         };

         setIsPlaying(true);
         setTimeout(() => {
            window.speechSynthesis.speak(utterance);
         }, 100);
      }
   };

   const toggleVoiceInput = () => {
      if (isListening) {
         setIsListening(false);
         if (window.mediaRecorder && window.mediaRecorder.state !== 'inactive') {
            window.mediaRecorder.stop();
         }
      } else {
         navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus") ? "audio/webm;codecs=opus" : "audio/webm";
            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            window.mediaRecorder = mediaRecorder;
            const audioChunks = [];

            mediaRecorder.addEventListener("dataavailable", event => {
               if (event.data.size > 0) audioChunks.push(event.data);
            });

            mediaRecorder.addEventListener("stop", async () => {
               const audioBlob = new Blob(audioChunks, { type: mimeType });
               const audioUrl = URL.createObjectURL(audioBlob);
               setAnswers(prev => ({ ...prev, [`${currentStep}_audio`]: audioUrl }));

               try {
                  handleAnswer("Processing audio...");
                  const result = await transcribeAudio(audioBlob);
                  if (result.success && result.text) {
                     handleAnswer(result.text);
                  } else {
                     handleAnswer("Error processing audio: " + (result.message || "Unknown error"));
                  }
               } catch (err) {
                  console.error("Transcription error", err);
                  handleAnswer("Failed to transcribe audio.");
               }
            });

            mediaRecorder.start();
            setIsListening(true);

         }).catch(err => {
            console.error("Mic access denied", err);
            alert("Microphone access is required.");
         });
      }
   };

   const handleAnswer = (val) => {
      setAnswers({ ...answers, [currentStep]: val });
   };

   const nextStep = () => {
      if (currentStep < questions.length - 1) {
         setCurrentStep(currentStep + 1);
         setSimplifiedText('');
         setSummarizedText('');
      } else {
         setCompleted(true);
         completeActivity('assessment', difficulty);
      }
   };

   const prevStep = () => {
      if (currentStep > 0) {
         setCurrentStep(currentStep - 1);
         setSimplifiedText('');
         setSummarizedText('');
      }
   };

   // AI Assistant Functions
   const handleTextSimplifier = async () => {
      const textToProcess = assistantText.trim() || currentQ.question;
      if (!textToProcess) {
         setSimplifiedText('Please enter some text to simplify');
         return;
      }

      setAssistantLoading(true);
      try {
         const response = await fetch('/api/dyslexia/simplify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textToProcess })
         });
         const data = await response.json();
         setSimplifiedText(data.simplified || data.error || 'Error simplifying text');
      } catch (error) {
         console.error('Simplification error:', error);
         setSimplifiedText('Error: Backend not running or network issue');
      }
      setAssistantLoading(false);
   };

   const handleSummarizer = async () => {
      const textToProcess = assistantText.trim() || currentQ.question;
      if (!textToProcess) {
         setSummarizedText('Please enter some text to summarize');
         return;
      }

      setAssistantLoading(true);
      try {
         const response = await fetch('/api/dyslexia/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textToProcess })
         });
         const data = await response.json();
         setSummarizedText(data.summary || data.error || 'Error summarizing text');
      } catch (error) {
         console.error('Summarization error:', error);
         setSummarizedText('Error: Backend not running or network issue');
      }
      setAssistantLoading(false);
   };

   const handleOCR = () => {
      alert('Word Extraction - Coming soon! This will extract key words from the text.');
   };

   const handleTTS = () => {
      const textToSpeak = assistantText.trim() || currentQ.question;
      if (!textToSpeak) {
         alert('Please enter some text or select a question first');
         return;
      }
      handleSpeech(textToSpeak);
   };

   if (completed) {
      return (
         <div className="text-center p-12 bg-[var(--bg-primary)] rounded-3xl shadow-xl border border-[var(--border-color)] max-w-2xl mx-auto mt-10">
            <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <CheckCircle size={48} />
            </div>
            <h2 className="text-4xl font-bold mb-4 text-[var(--text-primary)]">Great Progress!</h2>
            <p className="text-xl text-[var(--text-secondary)] mb-8">
               You've completed the {difficulty} section. Remember, learning is a journey, not a race.
            </p>
            <button
               onClick={() => { setCompleted(false); setCurrentStep(0); setAnswers({}); }}
               className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:scale-105 transition-all"
            >
               Try Another Level
            </button>
         </div>
      );
   }

   return (
      <div className="max-w-4xl mx-auto space-y-8">

         {/* Assessment Intro Card */}
         <div className="bg-[var(--bg-primary)] p-8 rounded-2xl shadow-sm border border-[var(--border-color)]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
               <div>
                  <span className="text-sm font-bold text-blue-600 uppercase tracking-wide">Mathematics • Algebra Basics</span>
                  <h1 className="text-3xl font-bold mt-1 text-[var(--text-primary)]">Concept Check: Variables</h1>
               </div>
               <div className="flex gap-2">
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold border border-purple-200">🧠 Adaptive</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">♿ Accessible</span>
               </div>
            </div>
            <p className="text-[var(--text-secondary)] text-lg">
               Take your time. This helps us understand how you learn best. There is no time limit.
            </p>
         </div>

         {/* Learning Mode Selector */}
         <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
               <Spline size={20} className="text-purple-400" /> LEARNING MODE
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
               {[
                  { id: 'default', label: 'DEFAULT', color: 'bg-white text-slate-900' },
                  { id: 'dyslexia', label: 'DYSLEXIA', color: 'bg-purple-600 text-white' },
                  { id: 'dyscalculia', label: 'DYSCALCULIA', color: 'bg-white text-slate-900' },
                  { id: 'dysgraphia', label: 'DYSGRAPHIA', color: 'bg-white text-slate-900' }
               ].map((mode) => (
                  <button
                     key={mode.id}
                     onClick={() => setLearningMode(mode.id)}
                     className={`py-3 px-4 rounded-lg font-bold text-sm transition-all ${learningMode === mode.id ? mode.color : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                  >
                     {mode.label}
                  </button>
               ))}
            </div>

            {/* AI Assistants Panel */}
            {learningMode !== 'default' && (
               <div className="border-t border-slate-700 pt-4">
                  <h4 className="text-purple-400 font-bold text-sm mb-3 flex items-center gap-2">
                     <MessageSquare size={16} /> AI ASSISTANTS
                  </h4>

                  {/* Text Input for AI Assistants */}
                  {(learningMode === 'dyslexia' || learningMode === 'dysgraphia') && (
                     <div className="mb-4">
                        <textarea
                           value={assistantText}
                           onChange={(e) => setAssistantText(e.target.value)}
                           placeholder="Paste text here to simplify or summarize... (or leave empty to use the question text)"
                           className="w-full p-3 rounded-lg bg-slate-800 text-white border border-slate-600 focus:border-purple-400 focus:outline-none resize-none"
                           rows={3}
                        />
                     </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                     {/* DYSLEXIA: Text processing assistants + TTS */}
                     {learningMode === 'dyslexia' && (
                        <>
                           <button
                              onClick={handleTextSimplifier}
                              disabled={assistantLoading}
                              className="bg-white text-purple-700 py-3 px-4 rounded-lg font-bold text-sm hover:bg-purple-50 transition-all flex flex-col items-center gap-2 disabled:opacity-50"
                           >
                              <FileText size={20} />
                              <span>Text Simplifier</span>
                           </button>
                           <button
                              onClick={handleSummarizer}
                              disabled={assistantLoading}
                              className="bg-white text-purple-700 py-3 px-4 rounded-lg font-bold text-sm hover:bg-purple-50 transition-all flex flex-col items-center gap-2 disabled:opacity-50"
                           >
                              <MessageSquare size={20} />
                              <span>Summarizer</span>
                           </button>
                           <button
                              onClick={handleOCR}
                              className="bg-white text-purple-700 py-3 px-4 rounded-lg font-bold text-sm hover:bg-purple-50 transition-all flex flex-col items-center gap-2"
                           >
                              <Eye size={20} />
                              <span>Word Extraction</span>
                           </button>
                           <button
                              onClick={handleTTS}
                              className={`py-3 px-4 rounded-lg font-bold text-sm transition-all flex flex-col items-center gap-2 ${isPlaying
                                 ? 'bg-green-600 text-white hover:bg-green-700'
                                 : 'bg-white text-purple-700 hover:bg-purple-50'
                                 }`}
                           >
                              <Headphones size={20} />
                              <span>{isPlaying ? 'Stop Speech' : 'Text to Speech'}</span>
                           </button>
                        </>
                     )}

                     {/* DYSGRAPHIA: Speech to Text only */}
                     {learningMode === 'dysgraphia' && (
                        <button
                           onClick={() => setAnswerMode('voice')}
                           className="bg-white text-blue-700 py-3 px-4 rounded-lg font-bold text-sm hover:bg-blue-50 transition-all flex flex-col items-center gap-2"
                        >
                           <Mic size={20} />
                           <span>Speech to Text</span>
                        </button>
                     )}

                     {/* DYSCALCULIA: Placeholder */}
                     {learningMode === 'dyscalculia' && (
                        <div className="col-span-2 md:col-span-4 text-center text-slate-400 text-sm py-2">
                           Visual math aids coming soon
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>

         {/* Assistant Output Display */}
         {(simplifiedText || summarizedText) && (
            <div className="bg-purple-50 border-2 border-purple-200 p-6 rounded-2xl">
               <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <MessageSquare size={18} /> AI Assistant Output
               </h4>
               {simplifiedText && (
                  <div className="mb-3">
                     <p className="text-sm font-bold text-purple-700 mb-1">Simplified Text:</p>
                     <p className="text-purple-900">{simplifiedText}</p>
                  </div>
               )}
               {summarizedText && (
                  <div>
                     <p className="text-sm font-bold text-purple-700 mb-1">Summary:</p>
                     <p className="text-purple-900">{summarizedText}</p>
                  </div>
               )}
            </div>
         )}

         {/* Preference Selector */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-color)]">
               <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">Difficulty Level</label>
               <div className="flex gap-2">
                  {['easy', 'medium', 'challenge'].map((d) => (
                     <button
                        key={d}
                        onClick={() => { setDifficulty(d); setCurrentStep(0); setAnswers({}); }}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-all ${difficulty === d ? 'bg-blue-600 text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                     >
                        {d}
                     </button>
                  ))}
               </div>
            </div>

            <div className="bg-[var(--bg-primary)] p-4 rounded-xl border border-[var(--border-color)]">
               <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-2">My Answer Style</label>
               <div className="flex gap-2">
                  <button
                     onClick={() => setAnswerMode('type')}
                     className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${answerMode === 'type' ? 'bg-indigo-600 text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                  >
                     <Keyboard size={16} /> Type
                  </button>
                  <button
                     onClick={() => setAnswerMode('voice')}
                     className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${answerMode === 'voice' ? 'bg-indigo-600 text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                  >
                     <Mic size={16} /> Speak
                  </button>
               </div>
            </div>
         </div>

         {/* Question Area */}
         <div className="bg-[var(--bg-primary)] p-8 rounded-3xl shadow-lg border border-[var(--border-color)] min-h-[400px] flex flex-col relative overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-2 bg-gray-100 dark:bg-slate-800">
               <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}></div>
            </div>

            <div className="flex justify-between items-start mb-8 mt-4">
               <span className="text-sm font-bold text-[var(--text-secondary)]">QUESTION {currentStep + 1} OF {questions.length}</span>
               <button
                  onClick={() => handleSpeech(currentQ.question)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full font-bold text-sm hover:bg-blue-100 transition-colors border border-blue-100"
               >
                  <Volume2 size={18} /> Read Aloud
               </button>
            </div>

            <h2 className="text-2xl md:text-4xl font-bold mb-6 text-[var(--text-primary)] leading-tight">
               {currentQ.question}
            </h2>

            <div className="mb-8">
               <p className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] bg-[var(--bg-secondary)] px-3 py-1 rounded-lg">
                  <HelpCircle size={16} /> Hint: {currentQ.hint}
               </p>
            </div>

            {/* Answer Input */}
            <div className="flex-1">
               {currentQ.type === 'mcq' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {currentQ.options.map((opt) => (
                        <button
                           key={opt}
                           onClick={() => handleAnswer(opt)}
                           className={`p-6 rounded-2xl text-left border-2 transition-all text-xl font-bold ${answers[currentStep] === opt
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 shadow-md'
                              : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-gray-400 dark:hover:border-slate-500'
                              }`}
                        >
                           {opt}
                        </button>
                     ))}
                  </div>
               ) : (
                  <div className="space-y-4">
                     {answerMode === 'voice' && (

                        <div className="flex flex-col items-center justify-center p-8 bg-[var(--bg-secondary)] rounded-2xl border-2 border-dashed border-[var(--border-color)]">

                           {/* Recorded Audio Preview */}
                           {answers[`${currentStep}_audio`] && (
                              <div className="w-full mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-[var(--border-color)] flex items-center gap-4">
                                 <audio src={answers[`${currentStep}_audio`]} controls className="w-full h-10" />
                                 <button
                                    onClick={() => {
                                       const newAnswers = { ...answers };
                                       delete newAnswers[`${currentStep}_audio`];
                                       delete newAnswers[currentStep];
                                       setAnswers(newAnswers);
                                    }}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                                    title="Delete Recording"
                                 >
                                    <Trash2 size={20} />
                                 </button>
                                 <div className="text-green-600 font-bold flex items-center gap-1 text-sm whitespace-nowrap">
                                    <CheckCircle size={16} /> Saved
                                 </div>
                              </div>
                           )}

                           {!answers[`${currentStep}_audio`] && (
                              <>
                                 <button
                                    onClick={toggleVoiceInput}
                                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isListening ? 'bg-red-500 animate-pulse shadow-red-300' : 'bg-blue-600 hover:scale-110 shadow-lg'}`}
                                 >
                                    {isListening ? <Square size={32} className="text-white fill-current" /> : <Mic size={32} className="text-white" />}
                                 </button>
                                 <p className="mt-4 font-bold text-[var(--text-secondary)]">
                                    {isListening ? "Recording... Tap to Stop" : "Tap microphone to record"}
                                 </p>
                              </>
                           )}
                        </div>
                     )}


                     <textarea
                        className="w-full p-6 text-xl rounded-2xl border-2 border-[var(--border-color)] bg-[var(--bg-secondary)] focus:border-blue-500 focus:ring-0 outline-none transition-all resize-none min-h-[150px]"
                        placeholder={answerMode === 'voice' ? "Voice output will appear here..." : "Type your explanation here..."}
                        value={answers[currentStep] || ''}
                        onChange={(e) => handleAnswer(e.target.value)}
                     />
                  </div>
               )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-[var(--border-color)]">
               <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="px-6 py-3 font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-xl transition-colors disabled:opacity-30"
               >
                  Back
               </button>

               <div className="flex gap-4">
                  <button className="px-6 py-3 font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                     Skip for now
                  </button>
                  <button
                     onClick={nextStep}
                     className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center gap-2"
                  >
                     {currentStep === questions.length - 1 ? 'Finish' : 'Save & Continue'} <ArrowRight size={20} />
                  </button>
               </div>
            </div>

         </div>

      </div>
   );
};

export default Assessment;
