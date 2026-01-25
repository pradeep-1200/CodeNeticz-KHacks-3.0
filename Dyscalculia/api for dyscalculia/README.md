# Math Visualizer for Dyscalculia

A chat-based educational web application designed for students with Specific Learning Disabilities (SLD), focusing on dyscalculia. It uses rule-based logic to convert natural language math questions into step-by-step visual animations.

## Project Structure

- **backend/**: Node.js + Express API. Handles natural language parsing and rule matching logic.
- **frontend/**: React + Vite. Handles the Chat UI and Animation Stage.

## Prerequisites

- Node.js installed on your system.

## How to Run

### 1. Start the Backend API

Open a terminal and:

```powershell
cd backend
npm install
npm start
```

The server will start at `http://localhost:3000`.

### 2. Start the Frontend Application

Open a **new** terminal window and:

```powershell
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## Features

- **Natural Language Input**: Type "derivative of x squared" or "integrate x from 0 to 4".
- **Visual Explanations**: Concepts are broken down into animated steps (e.g., "Bring Power Down").
- **Accessibility**: Calm colors, specific fonts (Outfit, Atkinson Hyperlegible), and simple navigation.
- **Rule-Based AI**: Uses strict logic instead of generative AI to ensure 100% mathematical accuracy for learners.
