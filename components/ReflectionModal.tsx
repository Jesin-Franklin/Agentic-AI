import React, { useState, useEffect } from 'react';
import { Task, Reflection } from '../types';
import { evaluateReflection } from '../services/geminiService';

interface ReflectionModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onComplete: (task: Task, reflection: Reflection) => void;
}

const ReflectionModal: React.FC<ReflectionModalProps> = ({ isOpen, task, onClose, onComplete }) => {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal is closed
      setTimeout(() => {
        setNotes('');
        setFeedback(null);
        setIsLoading(false);
      }, 300); // Delay to allow for closing animation
    }
  }, [isOpen]);

  if (!isOpen || !task) {
    return null;
  }

  const handleSubmit = async () => {
    if (!task) return;
    setIsLoading(true);
    const aiFeedback = await evaluateReflection(task, notes);
    setFeedback(aiFeedback);
    setIsLoading(false);
  };

  const handleSaveOnly = () => {
    if (task) {
      onComplete(task, { notes, feedback: '' });
    }
  };

  const handleFinish = () => {
    if (task && feedback !== null) {
      onComplete(task, { notes, feedback });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-slate-700">
            <h3 className="text-xl font-bold text-sky-300">Task Completed: <span className="text-white">{task.title}</span></h3>
            <p className="text-sm text-slate-400">Time for a quick reflection!</p>
        </header>
        
        <main className="p-6 flex-grow overflow-y-auto">
            {feedback === null && (
                <>
                    <label htmlFor="reflection-notes" className="block text-lg font-semibold text-slate-300 mb-2">
                        What did you learn?
                    </label>
                    <textarea
                        id="reflection-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Jot down the key takeaways, any challenges you faced, or new ideas you have..."
                        className="w-full h-48 bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-sky-500"
                        disabled={isLoading}
                    />
                </>
            )}

            {isLoading && (
                <div className="text-center p-8">
                    <div className="flex justify-center items-center mb-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-400"></div>
                    </div>
                    <p className="text-slate-400">Your AI mentor is evaluating your reflection...</p>
                </div>
            )}

            {feedback !== null && (
                 <div>
                    <h4 className="text-lg font-semibold text-slate-300 mb-2">Your Original Notes:</h4>
                    <div className="bg-slate-700/50 p-3 rounded-lg text-slate-300 mb-6 whitespace-pre-wrap">{notes}</div>
                    
                    <h4 className="text-lg font-semibold text-sky-300 mb-2">AI Mentor Feedback:</h4>
                    <div className="bg-sky-900/50 border border-sky-700 p-4 rounded-lg text-sky-200">{feedback}</div>
                 </div>
            )}
        </main>

        <footer className="px-6 py-4 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-4">
            {feedback === null && (
                <>
                    <button
                        onClick={onClose}
                        className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveOnly}
                        className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                        disabled={!notes.trim() || isLoading}
                    >
                        Save without Feedback
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                        disabled={!notes.trim() || isLoading}
                    >
                        {isLoading ? 'Evaluating...' : 'Get AI Feedback'}
                    </button>
                </>
            )}
            {feedback !== null && (
                <button
                    onClick={handleFinish}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Finish & Close
                </button>
            )}
        </footer>
      </div>
    </div>
  );
};

export default ReflectionModal;