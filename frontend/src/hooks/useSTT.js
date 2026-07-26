import { useState, useRef, useCallback } from 'react';
import { transcribeAudio } from '../services/api';   // uses VITE_API_URL + auth token

const useSTT = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState(null);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);

    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                await processAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setError(null);
        } catch (err) {
            console.error('Error accessing microphone:', err);
            setError('Microphone access denied or not available');
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const processAudio = async (audioBlob) => {
        try {
            // transcribeAudio in api.js uses the centralized axios instance with
            // VITE_API_URL and the Authorization header — no hardcoded URL here.
            const data = await transcribeAudio(audioBlob);

            if (data.success) {
                setTranscript(data.text);

                // Insert into focused input/textarea if available
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                    const start  = activeElement.selectionStart;
                    const end    = activeElement.selectionEnd;
                    const text   = activeElement.value;
                    const before = text.substring(0, start);
                    const after  = text.substring(end, text.length);
                    activeElement.value = before + (before && !before.endsWith(' ') ? ' ' : '') + data.text + after;
                    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                }
            } else {
                setError(data.message || 'Transcription failed');
            }
        } catch (err) {
            console.error('STT Error:', err);
            setError('Server error during transcription');
        }
    };

    return { isRecording, transcript, error, startRecording, stopRecording };
};

export default useSTT;
