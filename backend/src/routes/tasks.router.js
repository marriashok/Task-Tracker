// backend/src/routes/tasks.router.js
const express = require('express');
const router = express.Router();
const taskService = require('../services/task.service');

// GET /tasks - Retrieve all tasks with optional filters
router.get('/', (req, res) => {
  try {
    const { status, priority, sortBy } = req.query;
    const filters = { status, priority, sortBy };
    
    const tasks = taskService.getTasks(filters);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /tasks/:id - Retrieve a single task by ID
router.get('/:id', (req, res) => {
  try {
    const task = taskService.getTaskById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST /tasks - Create a new task
router.post('/', (req, res) => {
  try {
    const { title, description, priority, due_date, status } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!due_date) {
      return res.status(400).json({ error: 'Due date is required' });
    }

    if (priority && !['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    if (status && !['Open', 'In Progress', 'Done'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const newTask = taskService.createTask({
      title: title.trim(),
      description: description?.trim(),
      priority: priority || 'Medium',
      due_date,
      status: status || 'Open'
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /tasks/:id - Update task status or priority
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate updates
    if (updates.priority && !['Low', 'Medium', 'High'].includes(updates.priority)) {
      return res.status(400).json({ error: 'Invalid priority value' });
    }

    if (updates.status && !['Open', 'In Progress', 'Done'].includes(updates.status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updatedTask = taskService.updateTask(id, updates);
    res.json(updatedTask);
  } catch (error) {
    if (error.message === 'Task not found') {
      return res.status(404).json({ error: 'Task not found' });
    }
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /tasks/:id - Delete a task
router.delete('/:id', (req, res) => {
  try {
    const result = taskService.deleteTask(req.params.id);
    res.json(result);
  } catch (error) {
    if (error.message === 'Task not found') {
      return res.status(404).json({ error: 'Task not found' });
    }
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;