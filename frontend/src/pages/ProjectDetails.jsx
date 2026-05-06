import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Loader2, CheckCircle2, Clock, Circle, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import api from '../api';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create task state
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('todo');

  // Edit/Delete task state
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');
  const [editTaskDesc, setEditTaskDesc] = useState('');

  useEffect(() => {
    fetchProjectAndTasks();
    const handleClickOutside = () => setMenuOpenId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [id]);

  const fetchProjectAndTasks = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`projects/${id}/`),
        api.get(`tasks/?project=${id}`)
      ]);
      setProject(projectRes.data);
      // Wait, is tasks filtered by project? Let's check backend logic. 
      // If it's not, we filter here or just fetch from project details.
      // Usually project serializer includes tasks.
      setTasks(projectRes.data.tasks || []);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
      console.error('Failed to fetch', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('tasks/', {
        title: newTaskTitle,
        description: newTaskDesc,
        status: newTaskStatus,
        project: id
      });
      setIsCreating(false);
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskStatus('todo');
      fetchProjectAndTasks();
    } catch (err) {
      console.error('Failed to create task', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.patch(`tasks/${taskId}/`, { status: newStatus });
      fetchProjectAndTasks();
    } catch (err) {
      console.error('Failed to update task', err);
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      // Find the existing task to get its status
      const existingTask = tasks.find(t => t.id === editingTaskId);
      await api.put(`tasks/${editingTaskId}/`, {
        title: editTaskTitle,
        description: editTaskDesc,

        
        status: existingTask?.status || 'todo',
        project: id
      });
      setEditingTaskId(null);
      fetchProjectAndTasks();
    } catch (err) {
      console.error('Failed to update task', err);
      alert('Failed to update task: ' + (err.response?.data ? JSON.stringify(err.response.data) : err.message));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`tasks/${taskId}/`);
        fetchProjectAndTasks();
      } catch (err) {
        console.error('Failed to delete task', err);
      }
    }
  };

  const toggleMenu = (e, taskId) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpenId(menuOpenId === taskId ? null : taskId);
  };

  const startEditing = (e, task) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
    setEditTaskDesc(task.description);
    setMenuOpenId(null);
  };

  const triggerDelete = (e, taskId) => {
    e.preventDefault();
    e.stopPropagation();
    handleDeleteTask(taskId);
    setMenuOpenId(null);
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-500" />;
      default: return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!project) return <div>Project not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="mt-2 text-gray-600">{project.description}</p>
          </div>
          {localStorage.getItem('role') === 'admin' && (
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              New Task
            </button>
          )}
        </div>
      </div>

      {isCreating && localStorage.getItem('role') === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Task Title</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                rows="3"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {editingTaskId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Task Title</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  rows="3"
                  value={editTaskDesc}
                  onChange={(e) => setEditTaskDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingTaskId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {tasks.map((task) => (
            <li key={task.id} className="p-6 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="mt-1">{getStatusIcon(task.status)}</div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 ml-4 flex-shrink-0">
                  {localStorage.getItem('role') === 'member' ? (
                    <select
                      className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                      value={task.status}
                      onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  ) : (
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {task.status === 'todo' ? 'To Do' : task.status === 'in_progress' ? 'In Progress' : 'Completed'}
                    </span>
                  )}
                  
                  {localStorage.getItem('role') === 'admin' && (
                    <div className="relative">
                      <button
                        onClick={(e) => toggleMenu(e, task.id)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 focus:outline-none"
                      >
                        <MoreVertical className="h-5 w-5" />
                      </button>
                      {menuOpenId === task.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                          <button
                            onClick={(e) => startEditing(e, task)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                          >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Task
                          </button>
                          <button
                            onClick={(e) => triggerDelete(e, task.id)}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Task
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
          {tasks.length === 0 && !isCreating && (
            <li className="p-12 text-center text-gray-500">
              No tasks found for this project. Create one to get started!
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ProjectDetails;