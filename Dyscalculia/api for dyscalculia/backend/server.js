const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { solveMathProblem } = require('./solver');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Root endpoint
app.get('/', (req, res) => {
  res.send('Dyscalculia Learning API is running.');
});

// Solve endpoint
app.post('/solve', (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: "No question provided" });
    }

    const solution = solveMathProblem(question);
    res.json(solution);
  } catch (error) {
    console.error("Solver error:", error);
    res.status(500).json({ 
      error: "Could not process request", 
      message: "I can help with basic differentiation and integration like x, x², and x² + x." 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
