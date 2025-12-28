import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { moduleAPI, quizAPI, attemptAPI } from '../../services/api';

const ModuleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [module, setModule] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showAttemptsModal, setShowAttemptsModal] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    duration: 30,
    questions: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'single',
    options: ['', '', '', ''],
    correctAnswers: [],
    points: 1,
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [moduleRes, quizzesRes] = await Promise.all([
        moduleAPI.getById(id),
        quizAPI.getByModule(id),
      ]);
      setModule(moduleRes.data.module);
      setQuizzes(quizzesRes.data.quizzes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.questionText || currentQuestion.correctAnswers.length === 0) {
      alert('Please fill in question text and select correct answer(s)');
      return;
    }
    setQuizForm({
      ...quizForm,
      questions: [...quizForm.questions, { ...currentQuestion }],
    });
    setCurrentQuestion({
      questionText: '',
      questionType: 'single',
      options: ['', '', '', ''],
      correctAnswers: [],
      points: 1,
    });
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    if (quizForm.questions.length === 0) {
      alert('Please add at least one question');
      return;
    }
    try {
      await quizAPI.create({ ...quizForm, moduleId: id });
      setShowQuizModal(false);
      setQuizForm({ title: '', description: '', duration: 30, questions: [] });
      fetchData();
    } catch (error) {
      console.error('Error creating quiz:', error);
      alert(error.response?.data?.message || 'Failed to create quiz');
    }
  };

  const toggleCorrectAnswer = (index) => {
    const { questionType, correctAnswers } = currentQuestion;
    if (questionType === 'single') {
      setCurrentQuestion({ ...currentQuestion, correctAnswers: [index] });
    } else {
      if (correctAnswers.includes(index)) {
        setCurrentQuestion({
          ...currentQuestion,
          correctAnswers: correctAnswers.filter((i) => i !== index),
        });
      } else {
        setCurrentQuestion({
          ...currentQuestion,
          correctAnswers: [...correctAnswers, index],
        });
      }
    }
  };

  const viewQuizAttempts = async (quiz) => {
    setSelectedQuiz(quiz);
    setShowAttemptsModal(true);
    setLoadingAttempts(true);
    try {
      const response = await attemptAPI.getQuizAttempts(quiz._id);
      setAttempts(response.data.attempts);
    } catch (error) {
      console.error('Error fetching attempts:', error);
      alert('Failed to load attempts');
    } finally {
      setLoadingAttempts(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b-4 border-primary">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <Link to="/teacher/dashboard" className="text-primary hover:text-primary-dark mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold">{module?.title}</h1>
              <p className="text-gray-600 mt-1">{module?.description}</p>
            </div>
            <button onClick={() => setShowQuizModal(true)} className="btn-primary">
              + Create Quiz
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6">Quizzes ({quizzes.length})</h2>
        {quizzes.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 mb-4">No quizzes yet. Create your first quiz!</p>
            <button onClick={() => setShowQuizModal(true)} className="btn-primary">
              Create Quiz
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => (
              <div key={quiz._id} className="card border-l-4 border-secondary">
                <h3 className="text-xl font-bold mb-2">{quiz.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{quiz.description}</p>
                <div className="space-y-2 text-sm mb-4">
                  <p><strong>Questions:</strong> {quiz.questions?.length || 0}</p>
                  <p><strong>Total Points:</strong> {quiz.totalPoints}</p>
                  <p><strong>Duration:</strong> {quiz.duration} minutes</p>
                </div>
                <button
                  onClick={() => viewQuizAttempts(quiz)}
                  className="w-full btn-secondary text-sm py-2"
                >
                  View Student Attempts
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Quiz</h2>
            <form onSubmit={handleCreateQuiz} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    value={quizForm.title}
                    onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="input-field"
                    value={quizForm.duration}
                    onChange={(e) => setQuizForm({ ...quizForm, duration: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  className="input-field"
                  value={quizForm.description}
                  onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
                />
              </div>

              {/* Questions Added */}
              {quizForm.questions.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Questions Added: {quizForm.questions.length}</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {quizForm.questions.map((q, idx) => (
                      <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                        {idx + 1}. {q.questionText} ({q.questionType})
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Question Section */}
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Add Question</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                    <input
                      type="text"
                      className="input-field"
                      value={currentQuestion.questionText}
                      onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionText: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                      <select
                        className="input-field"
                        value={currentQuestion.questionType}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, questionType: e.target.value, correctAnswers: [] })}
                      >
                        <option value="single">Single Answer</option>
                        <option value="multiple">Multiple Answers</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
                      <input
                        type="number"
                        min="1"
                        className="input-field"
                        value={currentQuestion.points}
                        onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options (check correct answer{currentQuestion.questionType === 'multiple' ? 's' : ''})
                    </label>
                    {currentQuestion.options.map((option, idx) => (
                      <div key={idx} className="flex gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={currentQuestion.correctAnswers.includes(idx)}
                          onChange={() => toggleCorrectAnswer(idx)}
                          className="mt-3"
                        />
                        <input
                          type="text"
                          className="input-field"
                          placeholder={`Option ${idx + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[idx] = e.target.value;
                            setCurrentQuestion({ ...currentQuestion, options: newOptions });
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={addQuestion} className="btn-secondary w-full">
                    Add This Question
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowQuizModal(false)} className="flex-1 btn-outline">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Attempts Modal */}
      {showAttemptsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-8 max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Student Attempts: {selectedQuiz?.title}
              </h2>
              <button
                onClick={() => setShowAttemptsModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {loadingAttempts ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Loading attempts...</p>
              </div>
            ) : attempts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No students have attempted this quiz yet.</p>
              </div>
            ) : (
              <div>
                <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-semibold">
                    Total Attempts: {attempts.length}
                  </p>
                  <p className="text-sm">
                    Average Score: {(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length).toFixed(1)}%
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="text-left p-3 font-semibold">Student Name</th>
                        <th className="text-left p-3 font-semibold">Email</th>
                        <th className="text-center p-3 font-semibold">Score</th>
                        <th className="text-center p-3 font-semibold">Percentage</th>
                        <th className="text-center p-3 font-semibold">Time Taken</th>
                        <th className="text-center p-3 font-semibold">Submitted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map((attempt) => (
                        <tr key={attempt._id} className="border-b hover:bg-gray-50">
                          <td className="p-3">{attempt.student?.name}</td>
                          <td className="p-3 text-sm text-gray-600">{attempt.student?.email}</td>
                          <td className="p-3 text-center font-semibold">
                            {attempt.score} / {attempt.totalPoints}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              attempt.percentage >= 80 ? 'bg-green-100 text-green-800' :
                              attempt.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {attempt.percentage.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3 text-center text-sm">
                            {attempt.timeTaken ? `${Math.floor(attempt.timeTaken / 60)}m ${attempt.timeTaken % 60}s` : 'N/A'}
                          </td>
                          <td className="p-3 text-center text-sm text-gray-600">
                            {new Date(attempt.submittedAt).toLocaleDateString()} <br />
                            {new Date(attempt.submittedAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowAttemptsModal(false)}
                className="btn-outline"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleDetail;
