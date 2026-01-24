# import os
# import requests
# from dotenv import load_dotenv

# load_dotenv()

# HF_TOKEN = os.getenv("HF_TOKEN")

# MODEL_NAME = "sentence-transformers/paraphrase-MiniLM-L6-v2"
# API_URL = f"https://router.huggingface.co/hf-inference/models/{MODEL_NAME}"

# HEADERS = {
#     "Authorization": f"Bearer {HF_TOKEN}",
#     "Content-Type": "application/json"
# }

# def get_embeddings(texts):
#     response = requests.post(
#         API_URL,
#         headers=HEADERS,
#         json={"inputs": texts}
#     )

#     if response.status_code != 200:
#         raise Exception(f"API Error: {response.text}")

#     return response.json()

# def cosine_sim(a, b):
#     return sum(x*y for x, y in zip(a, b))

# def get_keywords(text, top_n=5):
#     words = list(set(text.lower().split()))

#     text_embedding = get_embeddings([text])[0]
#     word_embeddings = get_embeddings(words)

#     scores = [
#         (word, cosine_sim(text_embedding, emb))
#         for word, emb in zip(words, word_embeddings)
#     ]

#     scores.sort(key=lambda x: x[1], reverse=True)
#     return [word for word, _ in scores[:top_n]]


from huggingface_hub import InferenceClient
import os
from dotenv import load_dotenv

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")

client = InferenceClient(
    model="sentence-transformers/all-MiniLM-L6-v2",
    token=HF_TOKEN
)

def get_embeddings(texts):
    return client.feature_extraction(texts)

def cosine_sim(a, b):
    dot = sum(x*y for x, y in zip(a, b))
    norm_a = sum(x*x for x in a) ** 0.5
    norm_b = sum(y*y for y in b) ** 0.5
    return dot / (norm_a * norm_b)

def get_keywords(text, top_n=5):
    words = list(set(text.lower().split()))

    text_embedding = get_embeddings([text])[0]
    word_embeddings = get_embeddings(words)

    scores = [
        (word, cosine_sim(text_embedding, emb))
        for word, emb in zip(words, word_embeddings)
    ]

    scores.sort(key=lambda x: x[1], reverse=True)
    return [word for word, _ in scores[:top_n]]
