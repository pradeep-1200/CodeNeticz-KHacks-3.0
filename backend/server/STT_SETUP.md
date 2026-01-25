# Speech-to-Text (STT) Setup Guide

## Overview
This backend includes a Speech-to-Text API endpoint that transcribes audio files using Whisper AI.

## Prerequisites

### 1. Python Installation
- Python 3.8 or higher
- Recommended: Create a virtual environment

### 2. Required Python Packages
```bash
pip install openai-whisper
pip install torch
```

### 3. FFmpeg Installation
FFmpeg is required for audio format conversion.

**Windows:**
- Download from https://ffmpeg.org/download.html
- Add to system PATH

**Linux:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**macOS:**
```bash
brew install ffmpeg
```

## Configuration

### Environment Variables
Create or update your `.env` file with the following variables:

```env
# Optional: Path to Python executable
# Leave empty to use system Python
PYTHON_EXECUTABLE=python

# Optional: Path to STT utils directory
# Only needed if your STT module is in a different location
STT_PATH=
```

### For Custom Python Environment
If you're using a virtual environment with Whisper installed:

**Windows:**
```env
PYTHON_EXECUTABLE=d:\path\to\your\venv\Scripts\python.exe
```

**Linux/Mac:**
```env
PYTHON_EXECUTABLE=/path/to/your/venv/bin/python
```

## API Endpoint

### POST `/api/stt/process`

Transcribes an audio file to text.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with `audio` field containing the audio file

**Supported Audio Formats:**
- MP3 (`.mp3`)
- WAV (`.wav`)
- WebM (`.webm`)
- OGG (`.ogg`)
- M4A (`.m4a`)
- MP4 (`.mp4`)

**Response (Success):**
```json
{
  "success": true,
  "text": "Transcribed text here",
  "language": "en",
  "original_result": { ... }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Testing

### Using cURL
```bash
curl -X POST http://localhost:5000/api/stt/process \
  -F "audio=@/path/to/your/audio.mp3"
```

### Using Postman
1. Create a new POST request to `http://localhost:5000/api/stt/process`
2. Go to Body tab
3. Select `form-data`
4. Add a key named `audio` with type `File`
5. Choose your audio file
6. Send the request

## Troubleshooting

### Error: "Failed to start transcription process"
- **Cause:** Python executable not found
- **Solution:** 
  - Verify Python is installed: `python --version`
  - Set `PYTHON_EXECUTABLE` in `.env` to the correct path

### Error: "Import failed"
- **Cause:** Whisper or required packages not installed
- **Solution:** 
  - Install Whisper: `pip install openai-whisper`
  - If using venv, make sure `PYTHON_EXECUTABLE` points to the venv Python

### Error: "FFmpeg not found"
- **Cause:** FFmpeg is not installed or not in PATH
- **Solution:** 
  - Install FFmpeg (see Prerequisites)
  - Verify installation: `ffmpeg -version`

### Error: "Invalid audio file format"
- **Cause:** Unsupported file format
- **Solution:** Convert your audio to one of the supported formats

## File Structure

```
backend/server/
├── routes/
│   └── stt.js              # Express route handler
├── bridge_stt.py           # Python bridge script
├── uploads/                # Temporary upload directory
└── .env                    # Environment configuration
```

## How It Works

1. Client uploads audio file via POST request
2. Express (Node.js) receives the file and saves it temporarily
3. Node.js spawns a Python process running `bridge_stt.py`
4. Python script:
   - Converts audio to WAV format (if needed) using FFmpeg
   - Runs Whisper transcription
   - Returns JSON result
5. Node.js parses the result and sends response to client
6. Temporary files are cleaned up

## Performance Notes

- First transcription may take longer as Whisper downloads the model
- Model is cached for subsequent requests
- Processing time depends on audio length and system resources
- Default model: Whisper base (can be configured in the Python script)

## Security Considerations

- File size limited to 10MB (configurable in `stt.js`)
- Only audio file types are accepted
- Temporary files are automatically deleted after processing
- Ensure `.env` file is in `.gitignore` to protect credentials
