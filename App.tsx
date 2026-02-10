
import React, { useState, useEffect } from 'react';
import { User } from './types';
import * as authService from './services/authService';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  if (isLoading) {
    return null; // Or a loading spinner for the whole app
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
       <header className="w-full max-w-5xl text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-500">
          Autonomous AI Task Agent
        </h1>
        <p className="mt-2 text-slate-400 text-lg">Your personalized AI mentor for achieving learning goals.</p>
      </header>
      
      <main className="w-full max-w-5xl flex-grow">
        {!currentUser ? (
          <AuthPage onLogin={handleLogin} />
        ) : (
          <Dashboard user={currentUser} onLogout={handleLogout} />
        )}
      </main>
      
      <footer className="w-full max-w-5xl text-center mt-12 text-slate-500 text-sm">
        <p>Powered by Google Gemini. Design inspired by modern UI trends.</p>
      </footer>
    </div>
  );
};

export default App;
