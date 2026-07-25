import { useState, useRef, useCallback } from 'react';

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

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setError(null);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Microphone access denied or not available");
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    const processAudio = async (audioBlob) => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        try {
            const res = await fetch('http://localhost:5000/api/stt/process', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                setTranscript(data.text);

                // Try to insert into active element if it's an input/textarea
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                    const start = activeElement.selectionStart;
                    const end = activeElement.selectionEnd;
                    const text = activeElement.value;
                    const before = text.substring(0, start);
                    const after = text.substring(end, text.length);
                    activeElement.value = before + (before && !before.endsWith(' ') ? ' ' : '') + data.text + after;

                    // Dispatch input event so React state updates
                    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
                }
            } else {
                setError(data.message || "Transcription failed");
            }
        } catch (err) {
            console.error("STT Error:", err);
            setError("Server error during transcription");
        }
    };

    return {
        isRecording,
        transcript,
        error,
        startRecording,
        stopRecording
    };
};

export default useSTT;
