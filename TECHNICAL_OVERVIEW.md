# CodeNeticz-KHacks-3.0: Technical Overview & Stack Breakdown

## 🚀 Project Overview
**CodeNeticz-KHacks-3.0** is an adaptive educational assessment platform designed to support students with specific learning disabilities (SLDs) like **Dyslexia, Dysgraphia, and Dyscalculia**.

The core technical differentiator is its **"Cognitive Adaptability" engine**—a system that dynamically reconfigures the user interface and functionality based on the user's selected learning profile. Instead of a one-size-fits-all approach, the application changes its behavior (e.g., enabling text-to-speech, simplifying complex words, or providing visual math aids) in real-time.

---

## 🛠️ Tech Stack Overview

### Frontend (Client-Side)
- **Framework:** **React.js** (bootstrapped with **Vite** for fast build times).
- **Styling:** **Tailwind CSS** (for responsive, utility-first design) + **Lucide React** (icons).
- **State Management:** React `useState`/`useEffect` (Local state) + Context API (for global theme/auth state).
- **Key Libraries:**
  - `react-router-dom`: Navigation.
  - **Native Fetch API**: Used instead of Axios for lightweight HTTP requests.
  - **Web Speech API**: Browser-native API used for Text-to-Speech (TTS) and Speech-to-Text (STT).

### Backend (Server-Side)
- **Runtime:** **Node.js**.
- **Framework:** **Express.js** (REST API architecture).
- **Database:** **MongoDB** (with **Mongoose** ODM) for storing user profiles and assessment data.
- **File Storage:** **Cloudinary** (integrated via `multer`) for managing image/audio uploads.
- **Authentication:** Custom JWT-based auth (implied by standard MERN patterns).

### AI & Cognitive Services (The "Brain")
- **Language:** **Python 3.x**.
- **Integration Method:** **Child Processes** (`child_process.spawn`). The Node.js backend spawns Python scripts on-demand to perform heavy ML tasks.
- **ML Libraries:**
  - **Transformers (Hugging Face):** Specifically the `facebook/bart-large-cnn` model for text summarization.
  - **PyTorch (Torch):** Backend tensor computation for the models.
  - **Custom NLP Algorithms:** Evaluation logic for text simplification.

---

## 🧠 Cognitive Adaptability: Modules & Functions

This is the most critical part for your interview. The system is divided into **"Learning Modes."**

### 1. Dyslexia Module (Language Processing)
- **Function:** Helps users process text by simplifying complex words and summarizing long passages.
- **Stack Implementation:**
  - **Input:** User selects text in frontend -> sent to Node.js backend.
  - **Processing:** Node.js spawns `Dyslexia/simplify_wrapper.py` or `Dyslexia/bart_summarization.py`.
  - **AI Model:** Uses **BART (Bidirectional and Auto-Regressive Transformers)** for high-quality abstractive summarization.
  - **Feature:** **Text Simplifier** (replaces complex synonyms) and **Text Summarizer** (shortens content).

### 2. Dysgraphia Module (Speech-to-Text)
- **Function:** Removes the barrier of writing/typing for users with fine motor control issues.
- **Stack Implementation:**
  - **Frontend:** Uses the **MediaRecorder API** to capture audio blobs directly in the browser.
  - **Backend:** Routes audio to `/api/stt/transcribe`.
  - **Processing:** Integrated speech-to-text logic processing audio streams.

### 3. Dyscalculia Module (Visual Math)
- **Function:** Breaks down mathematical concepts into visual, step-by-step animations rather than abstract numbers.
- **Stack Implementation:**
  - **Logic:** **Rule-Based AI** (not generative). It parses natural language (e.g., "derivative of x^2") and maps it to specific visual animation frames.
  - **Components:**
    - `AnimationStage.jsx`: A massive React component (22KB+) that acts as the rendering engine for math animations.
    - **Standalone API:** Found in `Dyscalculia/api for dyscalculia`, suggesting a microservice architecture for the math parsing logic to keep it separate from the main assessment engine.

---

## 📂 Key Files & Folders (For Interview Walkthrough)

| Directory / File | Description & Technical Significance |
| :--- | :--- |
| **`src/components/Assessment.jsx`** | **The Core Controller.** Holds the state machine that toggles between Default, Dyslexia, Dysgraphia, and Dyscalculia modes. It conditionally renders the "AI Assistant" panel. |
| **`backend/server/routes/dyslexia.js`** | **The Bridge.** Express routes that handle frontend requests and trigger the Python scripts. Acts as the API gateway for the AI features. |
| **`Dyslexia/text_simplification_advanced.py`** | **The Logic.** A Python script containing NLP logic to map complex English words to simpler synonyms based on frequency lists or embeddings. |
| **`Dyslexia/bart_summarization.py`** | **The Model.** Loads the BART model to generate summaries. Optimized to read from `stdin` and write to `stdout` for fast pipe communication with Node.js. |
| **`Dyscalculia/api for dyscalculia`** | **The Math Engine.** Contains the specific logic for parsing math queries and generating visual steps. |
| **`PROJECT_SUMMARY.md`** | **Documentation.** Contains the "Success Criteria" and implementation details—great for explaining *why* certain architectural choices (like `spawn`) were made. |

---

## 💡 Interview Talking Points (Why this architecture?)

### 1. Hybrid Architecture (Node + Python)
- **Why?** Node.js is excellent for I/O and handling real-time web requests (Express), but Python is the industry standard for AI/ML.
- **How?** Instead of building two separate servers (microservices), the project uses `child_process` to keep the deployment simple (monolith) while leveraging Python's ML ecosystem.

### 2. Cognitive Load Management
- The UI isn't just "themed"; it's **structurally adaptive**. 
- For **Dyslexia**, contrast increases and text density decreases. 
- For **Dyscalculia**, numbers are visualized. 
- This defines the project's focus on **Human-Computer Interaction (HCI)** and accessibility.

### 3. Performance Optimization
- The AI models (like BART) act as loaded resources.
- The use of local scripts means no dependency on expensive external APIs (like OpenAI), reducing latency and cost.

### 4. Accessibility First
- The use of standard **Web APIs (Web Speech, MediaRecorder)** ensures the app works natively in the browser without requiring users to install 3rd party plugins or software.
