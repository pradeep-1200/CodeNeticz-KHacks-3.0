
import sys
import json
import os

# Import from Dyslexia folder
try:
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dyslexia_path = os.path.abspath(os.path.join(current_dir, '../../../Dyslexia'))
    sys.path.append(dyslexia_path)
    
    # Import the advanced simplification script
    try:
        from text_simplification_advanced import simplify_text as advanced_simplify
        USING_ADVANCED_MODEL = True
    except ImportError:
        USING_ADVANCED_MODEL = False
except Exception:
    USING_ADVANCED_MODEL = False

def simplify_logic(text):
    if USING_ADVANCED_MODEL:
         try:
             return advanced_simplify(text)
         except:
             pass
    
    # Fallback: Basic length reduction (naive)
    return text # Placeholder if advanced fails

if __name__ == "__main__":
    try:
        input_text = sys.stdin.read().strip()
    except:
        input_text = ""
    
    if not input_text and len(sys.argv) > 1:
        input_text = sys.argv[1]

    if not input_text:
         print(json.dumps({"error": "No text provided"}))
         sys.exit(1)

    # For now, just return success with original text if model not loaded, 
    # but the structure is there to use the Dyslexia folder's script.
    print(json.dumps({"text": simplify_logic(input_text), "success": True}))
