
import React, { useState } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = isLoginView
        ? authService.login(username, password)
        : authService.signUp(username, password);
      if (user) {
        onLogin(user);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6 text-sky-300">
        {isLoginView ? 'Welcome Back' : 'Create Your Account'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password"className="block text-sm font-medium text-slate-300 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
            required
          />
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all"
        >
          {isLoginView ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <p className="text-center text-slate-400 mt-6">
        {isLoginView ? "Don't have an account?" : 'Already have an account?'}
        <button
          onClick={() => {
            setIsLoginView(!isLoginView);
            setError('');
          }}
          className="font-semibold text-sky-400 hover:text-sky-300 ml-2"
        >
          {isLoginView ? 'Sign Up' : 'Login'}
        </button>
      </p>
    </div>
  );
};

export default AuthPage;
