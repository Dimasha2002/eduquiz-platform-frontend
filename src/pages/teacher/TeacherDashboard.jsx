import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { moduleAPI } from '../../services/api';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await moduleAPI.getMyModules();
      setModules(response.data.modules);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModule = async (e) => {
    e.preventDefault();
    try {
      await moduleAPI.create(formData);
      setShowCreateModal(false);
      setFormData({ title: '', description: '', subject: '' });
      fetchModules();
    } catch (error) {
      console.error('Error creating module:', error);
      alert(error.response?.data?.message || 'Failed to create module');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <img src="/logo.png" alt="EduQuiz Logo" className="h-12 w-12" />
              <h1 className="text-2xl font-bold">
                Edu<span className="text-primary">Quiz</span> <span className="text-lg text-gray-600">Teacher</span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Modules</h3>
            <p className="text-4xl font-bold">{modules.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900">
            <h3 className="text-lg font-semibold mb-2">Total Quizzes</h3>
            <p className="text-4xl font-bold">
              {modules.reduce((sum, m) => sum + (m.quizzes?.length || 0), 0)}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-gray-700 to-gray-800 text-white">
            <h3 className="text-lg font-semibold mb-2">Subjects</h3>
            <p className="text-4xl font-bold">{user?.subjects?.length || 0}</p>
          </div>
        </div>

        {/* Modules Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Modules</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            + Create Module
          </button>
        </div>

        {modules.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">You haven't created any modules yet.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First Module
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <Link
                key={module._id}
                to={`/teacher/module/${module._id}`}
                className="card hover:shadow-lg transition-shadow duration-200 border-l-4 border-primary"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{module.description}</p>
                <div className="flex items-center justify-between">
                  <span className="bg-secondary px-3 py-1 rounded-full text-sm font-semibold">
                    {module.subject}
                  </span>
                  <span className="text-sm text-gray-600">
                    {module.quizzes?.length || 0} quizzes
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Module Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Create New Module</h2>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module Title
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Introduction to Algebra"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  required
                  rows="3"
                  className="input-field"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what students will learn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  required
                  className="input-field"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                >
                  <option value="">Select subject</option>
                  {user?.subjects?.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Module
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
