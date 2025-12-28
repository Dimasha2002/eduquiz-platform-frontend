import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-yellow-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="EduQuiz Logo" className="h-24 w-24" />
          </div>
          <h1 className="text-6xl font-extrabold text-gray-900 mb-4">
            Edu<span className="text-primary">Quiz</span>
          </h1>
          <p className="text-2xl text-gray-600 mb-8">
            Create, Share, and Take Quizzes Anywhere
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            A modern educational platform for teachers to create engaging quizzes
            and students to test their knowledge. All your data securely stored in the cloud.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Get Started
            </Link>
            <Link to="/login" className="btn-outline text-lg px-8 py-3">
              Sign In
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Teacher Features */}
          <div className="card border-l-4 border-primary">
            <div className="bg-primary text-white w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              T
            </div>
            <h3 className="text-2xl font-bold mb-4">For Teachers</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                Create and manage course modules
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                Build quizzes with single & multiple choice questions
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                Track student enrollment and performance
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                Organize content by subjects
              </li>
            </ul>
          </div>

          {/* Student Features */}
          <div className="card border-l-4 border-secondary">
            <div className="bg-secondary text-gray-900 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
              S
            </div>
            <h3 className="text-2xl font-bold mb-4">For Students</h3>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-secondary mr-2">✓</span>
                Browse and enroll in available modules
              </li>
              <li className="flex items-start">
                <span className="text-secondary mr-2">✓</span>
                Take timed quizzes with instant results
              </li>
              <li className="flex items-start">
                <span className="text-secondary mr-2">✓</span>
                View your quiz history and best scores
              </li>
              <li className="flex items-start">
                <span className="text-secondary mr-2">✓</span>
                Retake quizzes to improve your knowledge
              </li>
            </ul>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-8">Built with Modern Technology</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['React', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS', 'JWT Auth'].map((tech) => (
              <span
                key={tech}
                className="bg-white px-6 py-3 rounded-full shadow-md font-semibold text-gray-700"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 text-center bg-gradient-to-r from-primary to-primary-dark text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of teachers and students using EduQuiz
          </p>
          <Link to="/register" className="bg-white text-primary hover:bg-gray-100 font-bold py-3 px-8 rounded-lg text-lg transition-colors">
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-400">
            © 2025 EduQuiz. Built with ❤️ using MERN Stack.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
