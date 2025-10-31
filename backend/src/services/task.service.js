// backend/src/services/task.service.js
const { getDatabase } = require('../db/database');

class TaskService {
  createTask(taskData) {
    const { title, description, priority, due_date, status } = taskData;
    
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO tasks (title, description, priority, due_date, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      title,
      description || null,
      priority || 'Medium',
      due_date,
      status || 'Open'
    );
    
    return { id: result.lastInsertRowid, ...taskData };
  }

  getTasks(filters = {}) {
    const db = getDatabase();
    let query = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    // Apply filters
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.priority) {
      query += ' AND priority = ?';
      params.push(filters.priority);
    }

    // Apply sorting
    if (filters.sortBy === 'due_date') {
      query += ' ORDER BY due_date ASC';
    } else if (filters.sortBy === 'priority') {
      query += ' ORDER BY CASE priority WHEN "High" THEN 1 WHEN "Medium" THEN 2 WHEN "Low" THEN 3 END';
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }

  updateTask(id, updates) {
    const db = getDatabase();
    const fields = [];
    const params = [];

    if (updates.status !== undefined) {
      fields.push('status = ?');
      params.push(updates.status);
    }

    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      params.push(updates.priority);
    }

    if (updates.title !== undefined) {
      fields.push('title = ?');
      params.push(updates.title);
    }

    if (updates.description !== undefined) {
      fields.push('description = ?');
      params.push(updates.description);
    }

    if (updates.due_date !== undefined) {
      fields.push('due_date = ?');
      params.push(updates.due_date);
    }

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(id);
    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`;
    
    const stmt = db.prepare(query);
    const result = stmt.run(...params);

    if (result.changes === 0) {
      throw new Error('Task not found');
    }

    return this.getTaskById(id);
  }

  getTaskById(id) {
    const db = getDatabase();
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id);
  }

  deleteTask(id) {
    const db = getDatabase();
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      throw new Error('Task not found');
    }

    return { deleted: true, id };
  }
}

module.exports = new TaskService();