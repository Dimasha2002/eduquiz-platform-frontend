import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { moduleAPI, quizAPI, attemptAPI } from '../../services/api';

const StudentModuleDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [module, setModule] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState({});
  const [expandedQuiz, setExpandedQuiz] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id, location.state?.refresh]);

  const fetchData = async () => {
    setLoading(true);
    console.log('=== FETCHING DATA ===');
    console.log('Module ID:', id);
    try {
      const [moduleRes, quizzesRes, attemptsRes] = await Promise.all([
        moduleAPI.getById(id),
        quizAPI.getByModule(id),
        attemptAPI.getByModule(id),
      ]);
      
      console.log('Module Response:', moduleRes.data);
      console.log('Quizzes Response:', quizzesRes.data);
      console.log('Quizzes Array:', quizzesRes.data.quizzes);
      console.log('Quizzes Length:', quizzesRes.data.quizzes?.length);
      
      setModule(moduleRes.data.module);
      const fetchedQuizzes = quizzesRes.data.quizzes || [];
      console.log('Setting quizzes state with:', fetchedQuizzes);
      setQuizzes(fetchedQuizzes);
      
      // Group attempts by quiz
      const attemptsMap = {};
      (attemptsRes.data.attempts || []).forEach((attempt) => {
        const quizId = attempt.quiz._id;
        if (!attemptsMap[quizId]) {
          attemptsMap[quizId] = [];
        }
        attemptsMap[quizId].push(attempt);
      });
      setAttempts(attemptsMap);
      
      console.log('Final quizzes state should be:', fetchedQuizzes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBestScore = (quizId) => {
    const quizAttempts = attempts[quizId] || [];
    if (quizAttempts.length === 0) return null;
    return Math.max(...quizAttempts.map((a) => a.percentage));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/student/dashboard" className="text-primary hover:text-primary-dark mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">{module?.title}</h1>
          <p className="text-gray-600 mt-1">{module?.description}</p>
          <p className="text-sm text-gray-500 mt-2">
            Teacher: {module?.teacher?.name}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Quizzes ({quizzes.length})</h2>
          <button 
            onClick={() => fetchData()}
            className="text-sm px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
          >
            🔄 Refresh
          </button>
        </div>
        
        {quizzes.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">No quizzes available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const bestScore = getBestScore(quiz._id);
              const attemptCount = attempts[quiz._id]?.length || 0;
              const quizAttempts = attempts[quiz._id] || [];
              const isExpanded = expandedQuiz === quiz._id;
              
              return (
                <div key={quiz._id} className="card border-l-4 border-secondary">
                  <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <p><strong>Questions:</strong> {quiz.questions?.length || 0}</p>
                    <p><strong>Total Points:</strong> {quiz.totalPoints}</p>
                    <p><strong>Duration:</strong> {quiz.duration} minutes</p>
                    {attemptCount > 0 && (
                      <>
                        <p><strong>Attempts:</strong> {attemptCount}</p>
                        <p><strong>Best Score:</strong> {bestScore?.toFixed(1)}%</p>
                      </>
                    )}
                  </div>

                  {/* My Attempts Section */}
                  {attemptCount > 0 && (
                    <div className="mb-4">
                      <button
                        onClick={() => setExpandedQuiz(isExpanded ? null : quiz._id)}
                        className="w-full text-left text-sm font-semibold text-primary hover:text-primary-dark flex items-center justify-between py-2 border-t pt-3"
                      >
                        <span>📊 My Attempts ({attemptCount})</span>
                        <span>{isExpanded ? '▼' : '▶'}</span>
                      </button>
                      
                      {isExpanded && (
                        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                          {quizAttempts
                            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                            .map((attempt, index) => (
                              <div 
                                key={attempt._id}
                                className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs"
                              >
                                <div className="flex justify-between items-center mb-1">
                                  <span className="font-semibold text-gray-700">
                                    Attempt #{attemptCount - index}
                                  </span>
                                  <span className={`px-2 py-1 rounded font-bold ${
                                    attempt.percentage >= 70 ? 'bg-green-100 text-green-700' :
                                    attempt.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {attempt.percentage.toFixed(0)}%
                                  </span>
                                </div>
                                <p className="text-gray-600">
                                  {new Date(attempt.createdAt).toLocaleString()}
                                </p>
                                <p className="text-gray-700 mt-1">
                                  Score: <strong>{attempt.score}</strong> / {quiz.totalPoints} points
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  <Link
                    to={`/student/quiz/${quiz._id}`}
                    className="block w-full text-center btn-primary"
                  >
                    {attemptCount > 0 ? 'Retake Quiz' : 'Start Quiz'}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentModuleDetail;
