
import sys
import json
import os

# Import from Dyslexia folder if possible, otherwise use fallback
try:
    # Add Dyslexia folder to path (assuming 3 levels up from here based on structure)
    # d:\student_backend2\CodeNeticz-KHacks-3.0\Dyslexia
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dyslexia_path = os.path.abspath(os.path.join(current_dir, '../../../Dyslexia'))
    sys.path.append(dyslexia_path)
    
    # Try importing the specific summarization script provided in that folder
    try:
        from bart_summarization import summarize_text as bart_summarize
        USING_ADVANCED_MODEL = True
    except ImportError:
        USING_ADVANCED_MODEL = False
except Exception:
    USING_ADVANCED_MODEL = False

def summarize_text(text, sentence_count=3):
    if USING_ADVANCED_MODEL:
        try:
             # Use the advanced model from Dyslexia folder
             summary = bart_summarize(text) 
             return {"summary": summary, "success": True, "engine": "BART"}
        except Exception as e:
            # Fallback if integration fails
            pass

    try:
        # Try importing sumy for lightweight extractive summarization as fallback
        try:
            from sumy.parsers.plaintext import PlaintextParser
            from sumy.nlp.tokenizers import Tokenizer
            from sumy.summarizers.lsa import LsaSummarizer
            from sumy.nlp.stemmers import Stemmer
            from sumy.utils import get_stop_words
        except ImportError:
             return {
                 "summary": "Summarization requires 'sumy' package. (pip install sumy numpy nltk)", 
                 "error": "Missing dependencies"
             }

        parser = PlaintextParser.from_string(text, Tokenizer("english"))
        stemmer = Stemmer("english")
        summarizer = LsaSummarizer(stemmer)
        summarizer.stop_words = get_stop_words("english")

        summary_sentences = summarizer(parser.document, sentence_count)
        
        summary = " ".join([str(sentence) for sentence in summary_sentences])
        
        if not summary:
            return {"summary": text, "note": "Text too short to summarize"}

        return {"summary": summary, "success": True, "engine": "LSA"}

    except Exception as e:
        return {"error": str(e), "success": False}

if __name__ == "__main__":
    # Read input from stdin
    try:
        input_text = sys.stdin.read().strip()
    except:
        input_text = ""
    
    if not input_text and len(sys.argv) > 1:
        input_text = sys.argv[1]

    if not input_text:
         print(json.dumps({"error": "No text provided"}))
         sys.exit(1)

    result = summarize_text(input_text)
    print(json.dumps(result))
