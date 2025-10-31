// frontend/src/components/TaskList.jsx
import { useState } from 'react';

function TaskList({ tasks, loading, onTaskUpdated, onTaskDeleted, apiUrl }) {
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingTaskId(taskId);
    try {
      const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Failed to update task');
      
      onTaskUpdated();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handlePriorityChange = async (taskId, newPriority) => {
    setUpdatingTaskId(taskId);
    try {
      const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: newPriority })
      });

      if (!response.ok) throw new Error('Failed to update task');
      
      onTaskUpdated();
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task priority');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`${apiUrl}/tasks/${taskId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete task');
      
      onTaskDeleted();
      alert('✅ Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'Done': return 'status-done';
      case 'In Progress': return 'status-progress';
      case 'Open': return 'status-open';
      default: return '';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);
    
    const diffTime = taskDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${dateString} (Overdue!)`;
    if (diffDays === 0) return `${dateString} (Today)`;
    if (diffDays === 1) return `${dateString} (Tomorrow)`;
    if (diffDays <= 7) return `${dateString} (In ${diffDays} days)`;
    return dateString;
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks found. Create your first task above!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map(task => (
        <div key={task.id} className="task-card">
          <div className="task-header">
            <h3>{task.title}</h3>
            <div className="task-badges">
              <span className={`badge ${getPriorityClass(task.priority)}`}>
                {task.priority}
              </span>
              <span className={`badge ${getStatusClass(task.status)}`}>
                {task.status}
              </span>
            </div>
          </div>

          {task.description && (
            <p className="task-description">{task.description}</p>
          )}

          <div className="task-meta">
            <span className="task-date">📅 {formatDate(task.due_date)}</span>
          </div>

          <div className="task-actions">
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(task.id, e.target.value)}
              disabled={updatingTaskId === task.id}
              className="task-select"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            <select
              value={task.priority}
              onChange={(e) => handlePriorityChange(task.id, e.target.value)}
              disabled={updatingTaskId === task.id}
              className="task-select"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>

            <button 
              onClick={() => handleDelete(task.id)}
              className="btn btn-danger btn-small"
              disabled={updatingTaskId === task.id}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskList;