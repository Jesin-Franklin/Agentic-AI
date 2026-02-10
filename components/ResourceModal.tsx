import React from 'react';
import { Resource } from '../types';

interface ResourceModalProps {
  resource: Resource;
  onClose: () => void;
}

const ResourceModal: React.FC<ResourceModalProps> = ({ resource, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-4 border-b border-slate-700 flex justify-between items-center">
          <div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${resource.type === 'notes' ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
              {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
            </span>
            <h3 className="text-xl font-bold mt-2 text-slate-200">{resource.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <main className="p-6 overflow-y-auto">
          <div className="prose prose-invert prose-sm sm:prose-base max-w-none prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-700 prose-code:text-sky-300">
            {/* A simple markdown renderer - assumes newlines are paragraphs */}
            {resource.content.split('\n').map((line, index) => {
              if (line.startsWith('`')) {
                return <pre key={index}><code>{line.replace(/`/g, '')}</code></pre>
              }
              // Fix: Replaced dynamic tag rendering with a switch statement to avoid JSX namespace errors.
              if (line.startsWith('#')) {
                const level = line.match(/^#+/)?.[0].length || 1;
                const content = line.replace(/^#+\s*/, '');
                switch (level) {
                  case 1: return <h1 key={index}>{content}</h1>;
                  case 2: return <h2 key={index}>{content}</h2>;
                  case 3: return <h3 key={index}>{content}</h3>;
                  case 4: return <h4 key={index}>{content}</h4>;
                  case 5: return <h5 key={index}>{content}</h5>;
                  default: return <h6 key={index}>{content}</h6>;
                }
              }
              if (line.startsWith('- ')) {
                return <li key={index}>{line.substring(2)}</li>;
              }
              return <p key={index}>{line}</p>;
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResourceModal;