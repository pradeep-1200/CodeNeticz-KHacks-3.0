from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download NLTK resources (run once)
nltk.download('punkt', quiet=True)
nltk.download('punkt_tab', quiet=True)
nltk.download('stopwords', quiet=True)

# Load MiniLM model
model = SentenceTransformer("all-MiniLM-L6-v2")

# -------------------------------
# Preprocessing
# -------------------------------
def preprocess_text(text):
    tokens = word_tokenize(text.lower())
    stop_words = set(stopwords.words("english"))
    words = [
        word for word in tokens
        if word.isalpha() and word not in stop_words
    ]
    return list(set(words))  # unique candidates


# -------------------------------
# Keyword Extraction
# -------------------------------
def extract_keywords(text, top_n=5):
    candidates = preprocess_text(text)

    if not candidates:
        return []

    text_embedding = model.encode([text])
    candidate_embeddings = model.encode(candidates)

    similarities = cosine_similarity(
        text_embedding,
        candidate_embeddings
    )[0]

    ranked_keywords = sorted(
        zip(candidates, similarities),
        key=lambda x: x[1],
        reverse=True
    )

    return [word for word, score in ranked_keywords[:top_n]]


# -------------------------------
# User Input Section
# -------------------------------
if __name__ == "__main__":
    print("🔹 Enter text for keyword extraction (press Enter twice to finish):")

    # Multi-line user input
    lines = []
    while True:
        line = input()
        if line.strip() == "":
            break
        lines.append(line)

    user_text = " ".join(lines)

    keywords = extract_keywords(user_text, top_n=6)

    print("\n🔑 Extracted Keywords:")
    if keywords:
        for i, kw in enumerate(keywords, 1):
            print(f"{i}. {kw}")
    else:
        print("No keywords found.")



# -------------------------------
# Integration Function
# -------------------------------
def get_keywords(text, top_n=5):
    return extract_keywords(text, top_n)
