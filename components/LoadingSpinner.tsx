
import React from 'react';

const LoadingSpinner: React.FC = () => {
  const messages = [
    "Analyzing your goal...",
    "Decomposing tasks...",
    "Finding the best resources...",
    "Building your personalized plan...",
    "Finalizing your schedule..."
  ];
  
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-center p-8 bg-slate-800/50 border border-slate-700 rounded-2xl">
      <div className="flex justify-center items-center mb-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
      </div>
      <h3 className="text-xl font-semibold text-sky-300">Crafting Your Plan</h3>
      <p className="text-slate-400 mt-2 transition-opacity duration-500">{messages[messageIndex]}</p>
    </div>
  );
};

export default LoadingSpinner;
