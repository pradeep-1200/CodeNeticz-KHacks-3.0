from transformers import BartTokenizer, BartForConditionalGeneration
import sys
import os
import warnings

# Suppress tokenization warning
warnings.filterwarnings("ignore", category=FutureWarning)

# Set cache directory to use existing model
os.environ['HF_HOME'] = r'C:\Users\Saravana Perumal\.cache\huggingface'
os.environ['TRANSFORMERS_CACHE'] = r'C:\Users\Saravana Perumal\.cache\huggingface\hub'

# Load tokenizer and model (will use cache if available, download if needed)
model_name = "facebook/bart-large-cnn"
print("Loading BART model...", file=sys.stderr)
tokenizer = BartTokenizer.from_pretrained(model_name)
model = BartForConditionalGeneration.from_pretrained(model_name)
print("Model loaded successfully!", file=sys.stderr)

# -------------------------------
# Summarization Function
# -------------------------------
def summarize_text(text, max_length=130, min_length=40):
    inputs = tokenizer(
        text,
        return_tensors="pt",
        max_length=1024,
        truncation=True
    )

    summary_ids = model.generate(
        inputs["input_ids"],
        max_length=max_length,
        min_length=min_length,
        length_penalty=2.0,
        num_beams=4,
        early_stopping=True
    )

    summary = tokenizer.decode(
        summary_ids[0],
        skip_special_tokens=True
    )

    return summary


# -------------------------------
# API Mode (for backend integration)
# -------------------------------
if __name__ == "__main__":
    # Read from stdin
    input_text = sys.stdin.read().strip()
    
    if input_text:
        result = summarize_text(input_text)
        print(result)
    else:
        print("Error: No input text provided", file=sys.stderr)
        sys.exit(1)
