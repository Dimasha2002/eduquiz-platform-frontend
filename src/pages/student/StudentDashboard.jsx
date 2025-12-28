import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { moduleAPI, enrollmentAPI } from '../../services/api';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [allModules, setAllModules] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modulesRes, coursesRes] = await Promise.all([
        moduleAPI.getAll(),
        enrollmentAPI.getMyCourses(),
      ]);
      setAllModules(modulesRes.data.modules);
      setMyCourses(coursesRes.data.enrollments);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (moduleId) => {
    try {
      await enrollmentAPI.enroll(moduleId);
      fetchData();
      alert('Successfully enrolled!');
    } catch (error) {
      console.error('Error enrolling:', error);
      alert(error.response?.data?.message || 'Failed to enroll');
    }
  };

  const isEnrolled = (moduleId) => {
    return myCourses.some((course) => course.module._id === moduleId);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1">
              <img src="/logo.png" alt="EduQuiz Logo" className="h-12 w-12" />
              <h1 className="text-2xl font-bold">
                Edu<span className="text-primary">Quiz</span> <span className="text-lg text-gray-600">Student</span>
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
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'browse'
                ? 'border-b-4 border-primary text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Browse Modules
          </button>
          <button
            onClick={() => setActiveTab('mycourses')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'mycourses'
                ? 'border-b-4 border-primary text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Courses ({myCourses.length})
          </button>
        </div>

        {/* Browse Modules */}
        {activeTab === 'browse' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Available Modules</h2>
            {allModules.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600">No modules available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allModules.map((module) => (
                  <div key={module._id} className="card border-l-4 border-primary">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{module.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{module.description}</p>
                    <p className="text-sm text-gray-500 mb-3">
                      Teacher: {module.teacher?.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="bg-secondary px-3 py-1 rounded-full text-sm font-semibold">
                        {module.subject}
                      </span>
                      {isEnrolled(module._id) ? (
                        <Link
                          to={`/student/module/${module._id}`}
                          className="text-primary font-semibold hover:text-primary-dark"
                        >
                          View →
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleEnroll(module._id)}
                          className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold text-sm"
                        >
                          Enroll
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Courses */}
        {activeTab === 'mycourses' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">My Enrolled Courses</h2>
            {myCourses.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600 mb-4">You haven't enrolled in any courses yet.</p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="btn-primary"
                >
                  Browse Modules
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myCourses.map((enrollment) => (
                  <Link
                    key={enrollment._id}
                    to={`/student/module/${enrollment.module._id}`}
                    className="card hover:shadow-lg transition-shadow border-l-4 border-secondary"
                  >
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {enrollment.module.title}
                    </h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {enrollment.module.description}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      Teacher: {enrollment.module.teacher?.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
                        {enrollment.module.subject}
                      </span>
                      <span className="text-sm text-gray-600">
                        {enrollment.module.quizzes?.length || 0} quizzes
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
