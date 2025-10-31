// frontend/src/App.jsx
import { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import InsightsPanel from './components/InsightsPanel';
import './App.css';

const API_URL = 'http://localhost:3000';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    sortBy: ''
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const response = await fetch(`${API_URL}/tasks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      alert('Failed to load tasks. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleTaskCreated = () => {
    fetchTasks();
  };

  const handleTaskUpdated = () => {
    fetchTasks();
  };

  const handleTaskDeleted = () => {
    fetchTasks();
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 Task Tracker</h1>
        <p>Manage your tasks efficiently with smart insights</p>
      </header>

      <div className="container">
        <div className="main-content">
          <section className="section">
            <h2>Create New Task</h2>
            <TaskForm onTaskCreated={handleTaskCreated} apiUrl={API_URL} />
          </section>

          <section className="section">
            <InsightsPanel apiUrl={API_URL} tasksCount={tasks.length} />
          </section>

          <section className="section">
            <div className="section-header">
              <h2>Your Tasks ({tasks.length})</h2>
              <div className="filters">
                <select 
                  value={filters.status} 
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>

                <select 
                  value={filters.priority} 
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>

                <select 
                  value={filters.sortBy} 
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="filter-select"
                >
                  <option value="">Sort by Date Created</option>
                  <option value="due_date">Sort by Due Date</option>
                  <option value="priority">Sort by Priority</option>
                </select>
              </div>
            </div>
            
            <TaskList 
              tasks={tasks} 
              loading={loading}
              onTaskUpdated={handleTaskUpdated}
              onTaskDeleted={handleTaskDeleted}
              apiUrl={API_URL}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

export default App;