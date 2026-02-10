
import React, { useState } from 'react';
import { GoalDetails } from '../types';

interface GoalFormProps {
  onSubmit: (details: GoalDetails) => void;
}

const GoalForm: React.FC<GoalFormProps> = ({ onSubmit }) => {
  const [goal, setGoal] = useState('');
  const [deadline, setDeadline] = useState('');
  const [dailyAvailability, setDailyAvailability] = useState('');
  const [level, setLevel] = useState<GoalDetails['level']>('');


  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal && deadline && dailyAvailability && level) {
      onSubmit({ goal, deadline, dailyAvailability, level });
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-2xl shadow-2xl shadow-indigo-500/10 transition-all duration-300">
      <h2 className="text-2xl font-bold text-center mb-6 text-sky-300">Define Your Learning Goal</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="goal" className="block text-sm font-medium text-slate-300 mb-2">
            What do you want to learn?
          </label>
          <input
            type="text"
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., Master React for frontend development"
            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-slate-300 mb-2">
                Target deadline?
              </label>
              <input
                type="date"
                id="deadline"
                min={today}
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="availability" className="block text-sm font-medium text-slate-300 mb-2">
                Daily commitment?
              </label>
              <input
                type="text"
                id="availability"
                value={dailyAvailability}
                onChange={(e) => setDailyAvailability(e.target.value)}
                placeholder="e.g., 2 hours"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                required
              />
            </div>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
                What is your current skill level?
            </label>
            <div className="grid grid-cols-3 gap-3">
                {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`p-3 rounded-lg text-center font-medium transition-all duration-200 border-2 ${
                    level === lvl
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-md'
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500 hover:bg-slate-700'
                    }`}
                >
                    {lvl}
                </button>
                ))}
            </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!goal || !deadline || !dailyAvailability || !level}
        >
          Generate My Learning Plan
        </button>
      </form>
    </div>
  );
};

export default GoalForm;
