import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI, attemptAPI } from '../../services/api';

const TakeQuiz = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [attemptId, setAttemptId] = useState(null);
  const [previousAttempts, setPreviousAttempts] = useState([]);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const hasStartedQuiz = useRef(false);

  useEffect(() => {
    loadQuizData();
  }, [quizId]);

  useEffect(() => {
    loadQuizData();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft > 0 && !submitted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && attemptId && !submitted) {
      handleSubmit(true); // Auto-submit when time expires
    }
  }, [timeLeft, submitted]);

  const loadQuizData = async () => {
    try {
      const [quizRes, attemptsRes] = await Promise.all([
        quizAPI.getById(quizId),
        attemptAPI.getByQuiz(quizId),
      ]);
      setQuiz(quizRes.data.quiz);
      setPreviousAttempts(attemptsRes.data.attempts || []);
    } catch (error) {
      console.error('Error loading quiz:', error);
      alert(error.response?.data?.message || 'Failed to load quiz');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const startQuiz = async () => {
    try {
      const attemptRes = await attemptAPI.start(quizId);
      setAttemptId(attemptRes.data.attemptId);
      setTimeLeft(quiz.duration * 60); // Convert to seconds
      setShowStartScreen(false);
      
      // Initialize answers
      const initialAnswers = {};
      quiz.questions.forEach((q) => {
        initialAnswers[q._id] = [];
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert(error.response?.data?.message || 'Failed to start quiz');
      navigate(-1);
    }
  };

  const handleAnswerChange = (questionId, optionIndex, isMultiple) => {
    if (isMultiple) {
      const currentAnswers = answers[questionId] || [];
      if (currentAnswers.includes(optionIndex)) {
        setAnswers({
          ...answers,
          [questionId]: currentAnswers.filter((i) => i !== optionIndex),
        });
      } else {
        setAnswers({
          ...answers,
          [questionId]: [...currentAnswers, optionIndex],
        });
      }
    } else {
      setAnswers({
        ...answers,
        [questionId]: [optionIndex],
      });
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && !confirm('Are you sure you want to submit?')) return;
    
    try {
      const formattedAnswers = Object.keys(answers).map((questionId) => ({
        questionId,
        selectedAnswers: answers[questionId],
      }));

      const response = await attemptAPI.submit(attemptId, formattedAnswers);
      setResult(response.data);
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading quiz...</div>;
  }

  // Start screen with previous attempts
  if (showStartScreen) {
    const bestScore = previousAttempts.length > 0 
      ? Math.max(...previousAttempts.map(a => a.percentage)) 
      : null;

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card mb-6">
            <button
              onClick={() => navigate(-1)}
              className="text-primary hover:text-primary-dark mb-4"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-gray-600 mb-6">{quiz.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <span className="text-gray-600 text-sm">Questions</span>
                <p className="text-2xl font-bold">{quiz.questions?.length || 0}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Total Points</span>
                <p className="text-2xl font-bold">{quiz.totalPoints}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Duration</span>
                <p className="text-2xl font-bold">{quiz.duration} min</p>
              </div>
            </div>

            {previousAttempts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  📊 Your Previous Attempts ({previousAttempts.length})
                </h3>
                {bestScore !== null && (
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                    <p className="text-blue-900">
                      <span className="font-semibold">Best Score:</span> {bestScore.toFixed(1)}%
                    </p>
                  </div>
                )}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {previousAttempts
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((attempt, index) => (
                      <div 
                        key={attempt._id} 
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            Attempt #{previousAttempts.length - index} • {new Date(attempt.createdAt).toLocaleString()}
                          </p>
                          <p className="text-sm mt-1">
                            <span className="font-semibold">{attempt.score}</span> / {quiz.totalPoints} points
                          </p>
                        </div>
                        <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                          attempt.percentage >= 70 ? 'bg-green-100 text-green-700' :
                          attempt.percentage >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {attempt.percentage.toFixed(0)}%
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={startQuiz}
                className="btn-primary flex-1"
              >
                {previousAttempts.length > 0 ? 'Start New Attempt' : 'Start Quiz'}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted && result) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="card text-center">
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
              <p className="text-gray-600">{quiz.title}</p>
            </div>
            
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl p-8 mb-6">
              <div className="text-6xl font-bold mb-2">
                {result.percentage.toFixed(1)}%
              </div>
              <div className="text-xl">
                {result.score} / {result.totalPoints} points
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {result.answers.filter(a => a.isCorrect).length}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {result.answers.filter(a => !a.isCorrect).length}
                </div>
                <div className="text-sm text-gray-600">Incorrect</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {quiz.questions.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>

            <button
              onClick={() => {
                const moduleId = typeof quiz.module === 'object' ? quiz.module._id : quiz.module;
                navigate(`/student/module/${moduleId}`, { state: { refresh: true } });
              }}
              className="btn-primary"
            >
              Back to Module
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b-4 border-primary sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">{quiz.title}</h1>
              <p className="text-sm text-gray-600">{quiz.questions.length} Questions • {quiz.totalPoints} Points</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-xl font-bold ${timeLeft < 60 ? 'text-red-600' : 'text-gray-900'}`}>
                ⏱️ {formatTime(timeLeft)}
              </div>
              <button
                onClick={handleSubmit}
                className="btn-primary"
              >
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {quiz.questions.map((question, index) => (
            <div key={question._id} className="card">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-3">{question.questionText}</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {question.questionType === 'multiple' 
                      ? '(Select all that apply)' 
                      : '(Select one)'} • {question.points} {question.points === 1 ? 'point' : 'points'}
                  </p>
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label
                        key={optionIndex}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          (answers[question._id] || []).includes(optionIndex)
                            ? 'border-primary bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type={question.questionType === 'multiple' ? 'checkbox' : 'radio'}
                          name={`question-${question._id}`}
                          checked={(answers[question._id] || []).includes(optionIndex)}
                          onChange={() => handleAnswerChange(question._id, optionIndex, question.questionType === 'multiple')}
                          className="w-4 h-4"
                        />
                        <span className="flex-1">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={handleSubmit}
            className="btn-primary text-lg px-12"
          >
            Submit Quiz
          </button>
        </div>
      </main>
    </div>
  );
};

export default TakeQuiz;
