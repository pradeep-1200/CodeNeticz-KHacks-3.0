import sys
import os
import json
import traceback
import subprocess
import tempfile

# Add the STT directory to path
stt_path = r"d:\student_backend\Dysgraphia\stt"
sys.path.append(stt_path)

try:
    from utils import stt
except ImportError as e:
    print(json.dumps({"error": f"Import failed: {str(e)}", "path": sys.path}))
    sys.exit(1)

def convert_to_wav(input_path):
    """Convert any audio format to WAV using ffmpeg"""
    try:
        # Create temp WAV file
        temp_wav = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
        temp_wav.close()
        
        # Use ffmpeg to convert to WAV (16kHz mono for Whisper)
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-ar', '16000',  # 16kHz sample rate
            '-ac', '1',      # Mono
            '-y',            # Overwrite
            temp_wav.name
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            return None, f"FFmpeg conversion failed: {result.stderr}"
        
        return temp_wav.name, None
        
    except FileNotFoundError:
        return None, "FFmpeg not found. Please install ffmpeg and add it to PATH."
    except Exception as e:
        return None, f"Conversion error: {str(e)}"

def run_transcription(audio_path):
    converted_path = None
    try:
        if not os.path.exists(audio_path):
            return {"error": "Audio file not found"}

        # Convert to WAV if needed
        if not audio_path.lower().endswith('.wav'):
            converted_path, error = convert_to_wav(audio_path)
            if error:
                return {"error": error}
            processing_path = converted_path
        else:
            processing_path = audio_path

        # Call the existing STT function
        result = stt.speech_to_text(processing_path)
        
        # Clean up converted file
        if converted_path and os.path.exists(converted_path):
            try:
                os.unlink(converted_path)
            except:
                pass
        
        # Ensure we return serializable dict
        if isinstance(result, dict):
            return result
        elif isinstance(result, str):
            return {"text": result.strip(), "language": "en"}
        else:
            return {"text": "", "language": "unknown", "raw_result": str(result)}
            
    except Exception as e:
        # Clean up on error
        if converted_path and os.path.exists(converted_path):
            try:
                os.unlink(converted_path)
            except:
                pass
        return {"error": str(e), "traceback": traceback.format_exc()}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No audio file provided"}))
        sys.exit(1)

    target_audio = sys.argv[1]
    
    # Run transcription
    output = run_transcription(target_audio)
    
    # Print JSON output for Node.js to capture
    print(json.dumps(output))
