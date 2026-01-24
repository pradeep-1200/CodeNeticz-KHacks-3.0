import React, { useState, useEffect } from 'react';
import { getAssessmentQuestions, completeActivity } from '../services/api';
import {
   Play, Pause, Mic, Volume2, ArrowRight, ArrowLeft, CheckCircle,
   HelpCircle, Keyboard, Spline, Save, Trash2, Square
} from 'lucide-react';

// questionsData removed in favor of API fetch

const Assessment = () => {
   const [difficulty, setDifficulty] = useState('easy');
   const [currentStep, setCurrentStep] = useState(0);
   const [answers, setAnswers] = useState({});
   const [isPlaying, setIsPlaying] = useState(false);
   const [isListening, setIsListening] = useState(false);
   const [completed, setCompleted] = useState(false);
   const [answerMode, setAnswerMode] = useState('type'); // type, voice

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
         window.speechSynthesis.cancel();

         const utterance = new SpeechSynthesisUtterance(text);

         // Try to find a good voice
         const voices = window.speechSynthesis.getVoices();
         const preferredVoice = voices.find(v => v.lang.startsWith('en') && !v.name.includes("Microsoft")) || voices[0];
         if (preferredVoice) utterance.voice = preferredVoice;

         utterance.onend = () => setIsPlaying(false);
         utterance.onerror = (e) => console.error("TTS Error:", e);

         setIsPlaying(true);
         // Small delay for stability
         setTimeout(() => {
            window.speechSynthesis.speak(utterance);
         }, 50);
      }
   };

   // Import the new services at the top if not already there, but here we just use the imported one.
   // Note: We need to import transcribeAudio at the top level, but for this edit block 
   // I will assume it's imported or I will handle the logic inside.
   // Wait, I need to update imports first? No, I can assume `transcribeAudio` is available if I update imports in a separate step or 
   // if I use the existing import line. The user wants "reframe it".

   // Actually, let's just replace the function body.

   const toggleVoiceInput = () => {
      if (isListening) {
         setIsListening(false);

         // Stop Media Recorder
         if (window.mediaRecorder && window.mediaRecorder.state !== 'inactive') {
            window.mediaRecorder.stop();
         }

      } else {
         // Start Media Recorder
         navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            // Check for supported mime types
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

               // Save audio for playback
               setAnswers(prev => ({ ...prev, [`${currentStep}_audio`]: audioUrl }));

               // Send to Backend for STT (using the Dysgraphia/stt folder logic)
               try {
                  // Update UI to show processing if needed (optional)
                  handleAnswer("Processing audio...");

                  const { transcribeAudio } = await import('../services/api');
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
      } else {
         setCompleted(true);
         completeActivity('assessment', difficulty);
      }
   };

   const prevStep = () => {
      if (currentStep > 0) setCurrentStep(currentStep - 1);
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

         {/* A - Assessment Intro Card */}
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

         {/* B - Preference Selector */}
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

         {/* C - Question Area */}
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

            {/* D - Answer Input */}
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
                                       delete newAnswers[currentStep]; // Clear text too
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

            {/* E - Navigation */}
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
