
import sys
import json
import os

# Import from Dyslexia folder if possible
try:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dyslexia_path = os.path.abspath(os.path.join(current_dir, '../../../Dyslexia'))
    sys.path.append(dyslexia_path)
    
    # Check if we can use any specific extraction tools from there
    # The folder list showed 'keyword_extraction_minilm.py', might be useful
    try:
        from keyword_extraction_minilm import extract_keywords
        USING_ADVANCED_MODEL = True
    except ImportError:
        USING_ADVANCED_MODEL = False
except Exception:
    USING_ADVANCED_MODEL = False

def extract_text(image_path):
    try:
        try:
            from PIL import Image
            import pytesseract
        except ImportError:
            return {"error": "Missing dependencies. Please install: pip install pytesseract pillow"}

        # Attempt OCR
        text = pytesseract.image_to_string(Image.open(image_path))
        
        return {"text": text.strip(), "success": True}

    except Exception as e:
        return {"error": str(e), "success": False}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)

    image_path = sys.argv[1]
    result = extract_text(image_path)
    print(json.dumps(result))
