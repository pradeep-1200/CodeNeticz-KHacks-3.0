from keyword_extraction_minilm import get_keywords
from bart_summarization import summarize_text
from text_simplification_advanced import simplify_text


def main():
    print("🔹 Enter text (press Enter twice to finish):")

    # Multi-line input
    lines = []
    while True:
        line = input()
        if line.strip() == "":
            break
        lines.append(line)

    user_text = " ".join(lines)

    if not user_text.strip():
        print("❌ No input text provided.")
        return

    print("\n⚙️ Processing...\n")

    # 1️⃣ Keyword Extraction
    keywords = get_keywords(user_text, top_n=6)

    # 2️⃣ Automatic Summarization
    summary = summarize_text(user_text)

    # 3️⃣ Text Simplification (applied on summary)
    simplified_text = simplify_text(summary)

    # -------------------------------
    # Output
    # -------------------------------
    print("🔑 Keywords:")
    if keywords:
        for i, kw in enumerate(keywords, 1):
            print(f"{i}. {kw}")
    else:
        print("No keywords found.")

    print("\n📝 Summary:")
    print(summary)

    print("\n📘 Simplified Text:")
    print(simplified_text)


# -------------------------------
# Entry Point
# -------------------------------
if __name__ == "__main__":
    main()
