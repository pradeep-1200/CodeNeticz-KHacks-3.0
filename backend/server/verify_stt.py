import os
import sys
import subprocess
import json

def check_whisper():
    print("Checking whisper dependency...")
    try:
        import whisper
        print("✅ whisper is installed")
        return True
    except ImportError:
        print("❌ whisper is NOT installed. Run: pip install openai-whisper")
        return False

def check_torch():
    print("Checking torch dependency...")
    try:
        import torch
        print(f"✅ torch is installed (version: {torch.__version__})")
        print(f"   CUDA available: {torch.cuda.is_available()}")
        return True
    except ImportError:
        print("❌ torch is NOT installed. Run: pip install torch")
        return False

def check_ffmpeg():
    print("Checking ffmpeg installation...")
    try:
        result = subprocess.run(['ffmpeg', '-version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ ffmpeg is installed and in PATH")
            return True
        else:
            print("❌ ffmpeg returned an error")
            return False
    except FileNotFoundError:
        print("❌ ffmpeg NOT found in PATH")
        return False

def check_model_downloaded(model_name="base"):
    print(f"Checking if whisper model '{model_name}' is downloaded...")
    # Whisper models are stored in ~/.cache/whisper
    cache_dir = os.path.join(os.path.expanduser("~"), ".cache", "whisper")
    model_file = os.path.join(cache_dir, f"{model_name}.pt")
    if os.path.exists(model_file):
        print(f"✅ model '{model_name}' found in {model_file}")
        return True
    else:
        print(f"⏳ model '{model_name}' not found locally. It will be downloaded on first Use (~140MB).")
        return False

def run_all():
    print("=== STT Environment Diagnostic ===\n")
    w = check_whisper()
    t = check_torch()
    f = check_ffmpeg()
    m = check_model_downloaded()
    
    print("\n=== Summary ===")
    if w and t and f:
        print("✅ Environment looks good! STT should work.")
    else:
        print("❌ Missing dependencies. Please follow STT_SETUP.md")

if __name__ == "__main__":
    run_all()
