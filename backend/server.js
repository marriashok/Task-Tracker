// backend/server.js
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./src/db/database');
const tasksRouter = require('./src/routes/tasks.router');
const { getInsights } = require('./src/services/insight.service');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();

// Routes
app.use('/tasks', tasksRouter);

app.get('/insights', async (req, res) => {
  try {
    const insights = await getInsights();
    res.json(insights);
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`📊 Test endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/tasks`);
  console.log(`   - POST http://localhost:${PORT}/tasks`);
  console.log(`   - GET  http://localhost:${PORT}/insights`);
});