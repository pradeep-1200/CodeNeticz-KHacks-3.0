# Dyslexia AI Assistants - Setup Guide

## ⚠️ Important: Virtual Environment Not Included in Git

The `Dyslexia/venv/` folder contains large ML model files (PyTorch, Transformers) that exceed GitHub's file size limits. Therefore, it's excluded from version control.

## 🔧 Setting Up the Virtual Environment

### First-Time Setup

1. **Navigate to the Dyslexia folder:**
   ```bash
   cd Dyslexia
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **Linux/Mac:**
     ```bash
     source venv/bin/activate
     ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Download required models (first run):**
   ```bash
   python -c "from transformers import BartTokenizer, BartForConditionalGeneration; BartTokenizer.from_pretrained('facebook/bart-large-cnn'); BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')"
   ```

### Verification

Test the setup by running:
```bash
python bart_summarization.py
```

Enter some text when prompted. If you see a summary, the setup is complete!

## 📦 Dependencies Included

- **transformers** - Hugging Face Transformers library
- **torch** - PyTorch for ML models
- **requests** - HTTP library for API calls
- **nltk** - Natural Language Toolkit
- **spacy** - Advanced NLP library

## 🚀 Backend Integration

The backend (`backend/server/routes/dyslexia.js`) is already configured to use:
```javascript
const venvPython = path.join(__dirname, '../../Dyslexia/venv/Scripts/python.exe');
```

This ensures all API calls use the virtual environment's Python with all dependencies.

## 🔍 Troubleshooting

### "Module not found" errors
- Ensure you activated the venv before installing packages
- Verify all packages in `requirements.txt` are installed

### Backend can't find Python
- Check that `venv/Scripts/python.exe` exists (Windows)
- For Linux/Mac, update the path to `venv/bin/python`

### Models downloading slowly
- First run will download ~1.5GB of model files
- Subsequent runs will use cached models
- Models are stored in `~/.cache/huggingface/`

## 📝 Note for Deployment

When deploying to production:
1. Create the venv on the server
2. Install dependencies from `requirements.txt`
3. Ensure the backend has read/execute permissions for the venv
4. Consider using a process manager like PM2 for the Node.js backend

## 🎯 Alternative: System-Wide Python

If you prefer not to use a virtual environment, you can:
1. Install dependencies globally: `pip install -r requirements.txt`
2. Update `backend/server/routes/dyslexia.js` to use `'python'` instead of `venvPython`

However, using a virtual environment is **strongly recommended** to avoid dependency conflicts.
