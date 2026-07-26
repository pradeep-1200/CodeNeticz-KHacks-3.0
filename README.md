# Adaptive Cognitive Learning Classroom (ACLC)

> **CodeNeticz — K Hacks 3.0**  
> *An AI-powered inclusive educational platform designed for students with Dyslexia, Dyscalculia, and Dysgraphia.*

---

## 🚀 Live Production Links

- **Frontend App (Vercel):** [https://code-neticz-k-hacks-3-0.vercel.app](https://code-neticz-k-hacks-3-0.vercel.app)  
- **Backend API (Render):** [https://codeneticz-khacks-3-0.onrender.com](https://codeneticz-khacks-3-0.onrender.com)  

---

## 🌟 Overview & Features

The **Adaptive Cognitive Learning Classroom (ACLC)** transforms traditional learning environments into personalized, accessible experiences tailored to neurodivergent students:

- 📖 **Dyslexia AI Assistant**: Automated text summarization (via HuggingFace BART/Bionic Reading), word spacing adjustment, open-dyslexic font switching, and simplified text rewrites.
- 🧮 **Dyscalculia Math Suite**: Visual math solver with step-by-step breakdown, interactive number-line visualizations, and spatial layout accommodations.
- 🎙️ **Dysgraphia Dictation Hub**: Integrated Speech-to-Text (STT) for hands-free answer submission and essay composition.
- 🎯 **Adaptive Learning Path**: Dynamic gamified level progression based on student prelims diagnostic assessment.
- 👩‍🏫 **Teacher Management Suite**: Classroom creation, level builder, assignment tracking, automated evaluation analytics, and accessibility profiling.

---

## 🔐 User Registration & Authentication Guide

ACLC uses **domain-based automatic role provisioning** upon registration. Users do **not** need to manually select a role — the backend automatically assigns permissions based on your email domain.

> [!IMPORTANT]
> **Registration Rule**: Registration **only** creates the user account and does **not** auto-log you in. After registering, you will be redirected to the **Login Page** to enter your credentials explicitly.

### 1. Staff / Faculty / Teacher Accounts
To register as a **Teacher/Staff member** with full classroom management permissions:
- **Email format requirement**: Use an email ending with `@staff.com` or a domain starting with `staff.`  
- **Examples**:
  - `professor@staff.com`
  - `teacher.jane@staff.university.edu`

**Staff Permissions:**
- Create and manage classrooms
- Design custom levels and assessments
- View student progress analytics and AI diagnostic reports
- Upload accessible learning materials

---

### 2. Student Accounts
To register as a **Student** with access to personalized learning tools:
- **Email format requirement**: Use an email ending with `@student.com` or a domain starting with `student.`  
- **Examples**:
  - `alex@student.com`
  - `john.doe@student.college.edu`

**Student Permissions:**
- Take Prelims diagnostic assessment
- Access personalized gamified level map
- Use Dyslexia AI text simplifier & Bionic Reader
- Use Dyscalculia math solver & Speech-to-Text dictation
- View personal progress reports

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TailwindCSS / Custom CSS Design Tokens, Zustand, Axios, Lucide React
- **Backend**: Node.js, Express, Mongoose, JWT (Access & Refresh Tokens), Argon2 / Bcrypt, Helmet, Express-Rate-Limit
- **Database**: MongoDB Atlas
- **Cloud Storage**: Cloudinary (for learning material attachments)
- **AI / ML Integration**: Python scripts (BART text summarization & simplification models)
- **Hosting**: Vercel (Frontend SPA with rewrite configuration), Render (Backend Express Web Service)

---

## 💻 Local Development Setup

### Prerequisites
Make sure you have the following installed locally:
- **Node.js**: `v18.x` or higher
- **npm**: `v9.x` or higher
- **MongoDB**: Local MongoDB instance OR a MongoDB Atlas connection string
- **Python**: `v3.9+` (optional, required if running Python AI scripts locally)

---

### 1. Clone Repository

```bash
git clone https://github.com/pradeep-1200/CodeNeticz-KHacks-3.0.git
cd CodeNeticz-KHacks-3.0
```

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend/server
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in `backend/server/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=""
   JWT_SECRET=your_super_secret_jwt_access_key_32_chars
   JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_32_chars
   CLIENT_URL=http://localhost:5173
   ALLOWED_ORIGINS=""
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *Backend will run on `http://localhost:5000`*

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the frontend Vite dev server:
   ```bash
   npm run dev
   ```
   *Frontend will run on `http://localhost:5173`*

---

## 📁 Repository Structure

```
CodeNeticz-KHacks-3.0/
├── backend/
│   └── server/
│       ├── src/
│       │   ├── config/         # Database & environment configs
│       │   ├── middleware/     # Auth, rate-limiter, error handling
│       │   ├── models/         # Mongoose DB schemas (User, Class, Assessment, Level)
│       │   ├── modules/
│       │   │   └── auth/       # Auth routes, controller, service
│       │   └── utils/          # JWT, crypto, logger
│       ├── routes/             # Feature API routes (analytics, dyslexia, prelims, etc.)
│       ├── uploads/            # Static file attachments
│       ├── index.js            # Express server entry point
│       └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/         # Reusable UI components & Layouts
│   │   ├── context/            # Accessibility & Adaptive Contexts
│   │   ├── pages/              # Public, Student & Staff page views
│   │   │   ├── staff/          # Teacher dashboard & management pages
│   │   │   └── student/        # Student dashboard, tools & assessments
│   │   ├── services/           # Axios API instance & service helpers
│   │   ├── store/              # Zustand state stores (authStore, etc.)
│   │   ├── App.jsx             # React Router setup & protected routes
│   │   ├── main.jsx
│   │   └── index.css           # Global design system & theme tokens
│   ├── vercel.json             # Vercel SPA rewrite configuration
│   └── package.json
├── README.md                   # Project documentation
└── .gitignore                  # Root Git ignore rules
```

---

## 👥 Team CodeNeticz

- **Pradeep P** (Team Leader) — GitHub: [@pradeep-1200](https://github.com/pradeep-1200)
- **Madan P A** — GitHub: [@Madanpa20](https://github.com/Madanpa20)
- **Nakulan S V** — GitHub: [@NAKULAN727](https://github.com/NAKULAN727)
- **Saravana Perumal M** — GitHub: [@Saravana-creator](https://github.com/Saravana-creator)

---

## 📄 License

This project was built for **K Hacks 3.0**. All rights reserved.
