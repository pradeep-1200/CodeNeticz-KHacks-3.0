"""
Simple STT module using OpenAI Whisper
This is a basic implementation for speech-to-text transcription
"""

def speech_to_text(audio_path):
    """
    Transcribe audio file to text using Whisper
    
    Args:
        audio_path: Path to the audio file
        
    Returns:
        dict: {"text": transcribed_text, "language": detected_language}
    """
    try:
        import whisper
        import os
        
        # Load the Whisper model
        # 'base' is significantly more stable than 'tiny' for multilingual support
        # but still very fast on modern CPUs.
        model_name = os.environ.get('WHISPER_MODEL', 'base')
        model = whisper.load_model(model_name)
        
        # Transcribe with aggressive parameters to eliminate hallucinations:
        # - task="transcribe": keep original language
        # - temperature=0: deterministic decoding (reduces random errors)
        # - no_speech_threshold=0.8: strictly ignore silence/static
        # - compression_ratio_threshold=2.4: ignore repetitive nonsensical output
        # - logprob_threshold=-1.0: fallback if probability is low
        # - condition_on_previous_text=False: prevent loops
        # - initial_prompt: a neutral guide to stabilize the model
        result = model.transcribe(
            audio_path,
            task="transcribe",
            temperature=0,
            condition_on_previous_text=False,
            fp16=False,
            no_speech_threshold=0.8,
            compression_ratio_threshold=2.4,
            logprob_threshold=-1.0,
            initial_prompt="Transcribe the following educational assessment response clearly."
        )
        
        # Post-process: If Whisper still returns something like "Thank you." 
        # or common hallucination markers for very short clips, we can filter them here.
        text = result["text"].strip()
        hallucination_markers = ["Thank you.", "Thanks for watching.", "Subtitles by", "Please subscribe"]
        if len(text) < 20 and any(marker in text for marker in hallucination_markers):
            return {"text": "", "language": result.get("language", "en"), "warning": "filtered_hallucination"}

        return {
            "text": text,
            "language": result.get("language", "en")
        }
        
    except ImportError:
        return {
            "error": "Whisper not installed. Install with: pip install openai-whisper",
            "text": "",
            "language": "unknown"
        }
    except Exception as e:
        return {
            "error": f"Transcription failed: {str(e)}",
            "text": "",
            "language": "unknown"
        }


if __name__ == "__main__":
    # Test the function
    import sys
    if len(sys.argv) > 1:
        result = speech_to_text(sys.argv[1])
        print(result)
    else:
        print("Usage: python stt.py <audio_file_path>")
