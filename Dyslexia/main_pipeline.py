from keyword_extraction_minilm import get_keywords
from bart_summarization import summarize_text
from text_simplification_advanced import simplify_text

if __name__ == "__main__":
    print("🔹 Enter text (press Enter twice to finish):")

    lines = []
    while True:
        line = input()
        if line.strip() == "":
            break
        lines.append(line)

    user_text = " ".join(lines)

    # 1️⃣ Keyword Extraction
    keywords = get_keywords(user_text, top_n=6)

    # 2️⃣ Summarization
    summary = summarize_text(user_text)

    # 3️⃣ Text Simplification
    simplified_text = simplify_text(summary)

    print("\n🔑 Keywords:")
    print(keywords)

    print("\n📝 Summary:")
    print(summary)

    print("\n📘 Simplified Text:")
    print(simplified_text)
