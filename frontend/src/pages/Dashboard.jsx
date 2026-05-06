import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, FolderGit2, ChevronRight, Loader2, MoreVertical, Edit2, Trash2, Users } from 'lucide-react';
import api from '../api';

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const [assigningProjectId, setAssigningProjectId] = useState(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
    if (localStorage.getItem('role') === 'admin') {
      fetchMembers();
    }
    // Close menu when clicking outside
    const handleClickOutside = () => setMenuOpenId(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get('members/');
      setAllMembers(response.data);
    } catch (err) {
      console.error('Failed to fetch members', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('projects/');
      setProjects(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login');
      }
      console.error('Failed to fetch projects', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('projects/', { 
        name: newProjectName, 
        description: newProjectDesc
      });
      setIsCreating(false);
      setNewProjectName('');
      setNewProjectDesc('');
      fetchProjects();
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`projects/${editingProjectId}/`, {
        name: editName,
        description: editDesc
      });
      setEditingProjectId(null);
      fetchProjects();
    } catch (err) {
      console.error('Failed to update project', err);
    }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`projects/${id}/`);
        fetchProjects();
      } catch (err) {
        console.error('Failed to delete project', err);
      }
    }
  };

  const toggleMenu = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpenId(menuOpenId === id ? null : id);
  };

  const startEditing = (e, project) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProjectId(project.id);
    setEditName(project.name);
    setEditDesc(project.description);
    setMenuOpenId(null);
  };

  const triggerDelete = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    handleDeleteProject(id);
    setMenuOpenId(null);
  };

  const startAssigning = (e, project) => {
    e.preventDefault();
    e.stopPropagation();
    setAssigningProjectId(project.id);
    setSelectedMembers(project.assigned_members || []);
    setMenuOpenId(null);
  };

  const handleAssignMembers = async (e) => {
    e.preventDefault();
    try {
      await api.post(`projects/${assigningProjectId}/assign_members/`, {
        member_ids: selectedMembers
      });
      setAssigningProjectId(null);
      setSelectedMembers([]);
      fetchProjects();
    } catch (err) {
      console.error('Failed to assign members', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        {localStorage.getItem('role') === 'admin' && (
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Project
          </button>
        )}
      </div>

      {isCreating && localStorage.getItem('role') === 'admin' && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Project Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                rows="3"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
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
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {assigningProjectId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Assign Members</h2>
            <form onSubmit={handleAssignMembers} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Members</label>
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3 space-y-3 bg-gray-50">
                  {allMembers.map(member => (
                    <label key={member.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded border border-transparent hover:border-gray-200 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        checked={selectedMembers.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers([...selectedMembers, member.id]);
                          } else {
                            setSelectedMembers(selectedMembers.filter(id => id !== member.id));
                          }
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">{member.first_name} {member.last_name}</span>
                        <span className="text-xs text-gray-500">@{member.username}</span>
                      </div>
                    </label>
                  ))}
                  {allMembers.length === 0 && (
                    <p className="text-sm text-gray-500 italic text-center py-4">No members available.</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setAssigningProjectId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Save Assignments
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingProjectId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Project</h2>
            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  rows="3"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditingProjectId(null)}
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative group"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <FolderGit2 className="h-6 w-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 truncate">{project.name}</h3>
                </div>
                {localStorage.getItem('role') === 'admin' && (
                  <div className="relative">
                    <button
                      onClick={(e) => toggleMenu(e, project.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {menuOpenId === project.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                        <button
                          onClick={(e) => startEditing(e, project)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Project
                        </button>
                        <button
                          onClick={(e) => startAssigning(e, project)}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Assign Members
                        </button>
                        <button
                          onClick={(e) => triggerDelete(e, project.id)}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Project
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <p className="text-gray-600 line-clamp-2 mb-4 h-12">
                {project.description || 'No description provided.'}
              </p>
              <Link 
                to={`/project/${project.id}`}
                className="flex items-center text-sm text-indigo-600 font-medium group-hover:text-indigo-800"
              >
                View Project Tasks
                <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ))}
        {projects.length === 0 && !isCreating && (
          <div className="col-span-full bg-white p-12 text-center rounded-xl border border-gray-200 border-dashed">
            <FolderGit2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
            {localStorage.getItem('role') === 'admin' ? (
              <>
                <p className="text-gray-500 mb-6">Get started by creating your first project.</p>
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  New Project
                </button>
              </>
            ) : (
              <p className="text-gray-500 mb-6">You have not been assigned to any projects yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;