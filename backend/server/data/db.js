// Mock Data for ACLC Application

const studentProfile = {
  id: 1,
  name: "Student",
  email: "student@example.com",
  level: 5,
  password: "12345",
  levelTitle: "Intermediate",
  xp: 3800,
  nextLevelXp: 5000,
  xpToNextLevel: 1200,
  streak: 5, // days
  badges: ["Early Bird", "Math Whiz", "Science Star"]
};

const dashboardStats = {
  activeClasses: { count: 4, newMaterial: 1 },
  pendingInvites: { count: 2, actionRequired: true },
  weeklyGoal: { progress: 85, status: "On track" }
};

const recentActivity = [
  { id: 1, type: "material", title: "Mathematics: Algebra Basics", time: "2 hours ago" },
  { id: 2, type: "assessment", title: "Completed Assessment: Science", time: "4 hours ago" },
  { id: 3, type: "badge", title: "Earned Badge: Early Bird", time: "1 day ago" }
];

const dailyTip = {
  title: "Daily Tip 💡",
  content: "Taking breaks improves focus! Try the '20-20-20' rule: Every 20 minutes, look at something 20 feet away for 20 seconds."
};

const materials = [
  { 
    id: 1, 
    title: 'Introduction to Linked Lists', 
    desc: 'Watch this animation to understand how nodes connect in memory compared to arrays.',
    type: 'video', 
    date: 'Oct 24', 
    likes: 12 
  },
  { 
    id: 2, 
    title: 'Assignment 3: Stack Implementation', 
    desc: 'Read the spec sheet carefully. You need to implement Push, Pop, and Peek functions.',
    type: 'pdf', 
    date: 'Oct 23', 
    likes: 5 
  },
  { 
    id: 3, 
    title: 'Audio Lecture: Queue Real-world Examples', 
    desc: 'Listen to how printer spools and CPU scheduling use queues.',
    type: 'audio', 
    date: 'Oct 22', 
    likes: 8 
  },
  { 
    id: 4, 
    title: 'Simplified Notes: Linked Lists (Reading-Friendly)', 
    desc: 'A simplified version of the lesson with shorter sentences, highlighted keywords, and optional audio support.',
    type: 'reading-friendly', 
    date: 'Oct 25', 
    likes: 3 
  },
];

const reports = {
  improvementData: [
    { subject: 'Math', score: 65, improved: 85 },
    { subject: 'Science', score: 70, improved: 75 },
    { subject: 'History', score: 60, improved: 80 },
    { subject: 'English', score: 75, improved: 88 },
  ],
  skillData: [
    { name: 'Week 1', progress: 40 },
    { name: 'Week 2', progress: 55 },
    { name: 'Week 3', progress: 60 },
    { name: 'Week 4', progress: 85 },
  ],
  strengths: [
    "Visual Pattern Recognition",
    "Auditory Listening Skills",
    "Creative Problem Solving"
  ],
  areasToExplore: [
    "Reading Comprehension Speed",
    "Complex Arithmetic"
  ],
  beforeStats: [
      { label: "Reading Speed", value: 40, display: "Low" },
      { label: "Accuracy", value: 65, display: "Medium" },
      { label: "Confidence Level", value: 50, display: "Unsure" }
  ],
  afterStats: [
      { label: "Reading Speed", value: 85, display: "Normal" },
      { label: "Accuracy", value: 92, display: "High" },
      { label: "Confidence Level", value: 95, display: "Very Confident" }
  ]
};

const assessmentQuestions = [
  // Easy
  { 
    id: 1, 
    type: 'mcq', 
    question: "What comes next in the sequence: 2, 4, 6, _?", 
    options: ["7", "8", "9", "10"], 
    correctAnswer: "8", 
    hint: "Add 2 to the previous number.",
    difficulty: 'easy'
  },
  { 
    id: 2, 
    type: 'text', 
    question: "What is your favorite animal and why?", 
    options: [],
    correctAnswer: "open", 
    hint: "There is no wrong answer. Just describe it.",
    difficulty: 'easy'
  },
  // Medium
  { 
    id: 101, 
    type: 'mcq', 
    question: "Which planet is known as the Red Planet?", 
    options: ["Earth", "Mars", "Jupiter", "Venus"], 
    correctAnswer: "Mars", 
    hint: "It shares a name with a Roman god of war.",
    difficulty: 'medium'
  },
  { 
    id: 102, 
    type: 'text', 
    question: "Explain why plants need sunlight.", 
    options: [],
    correctAnswer: "open", 
    hint: "Think about energy and food.",
    difficulty: 'medium'
  },
  // Challenge
  { 
    id: 201, 
    type: 'mcq', 
    question: "Solve for x: 3x + 5 = 20", 
    options: ["3", "4", "5", "6"], 
    correctAnswer: "5", 
    hint: "Subtract 5 from both sides first.",
    difficulty: 'challenge'
  },
];


module.exports = {
  studentProfile,
  dashboardStats,
  recentActivity,
  dailyTip,
  materials,
  reports,
  assessmentQuestions
};
