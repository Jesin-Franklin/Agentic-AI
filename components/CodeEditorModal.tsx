
import React, { useState, useEffect, useRef } from 'react';
import { Resource } from '../types';

interface CodeEditorModalProps {
  resource: Resource;
  onClose: () => void;
}

type TestResult = {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  error?: string;
};

const CodeEditorModal: React.FC<CodeEditorModalProps> = ({ resource, onClose }) => {
  const [code, setCode] = useState(`function solution(args) {\n  // Your code here\n}`);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const workerScript = `
      self.onmessage = function(e) {
        const { code, testCases } = e.data;
        const results = [];
        try {
          // It is critical to wrap user code in a function constructor to sandbox it
          const userFunction = new Function('return ' + code)();

          for (const testCase of testCases) {
            try {
              const args = JSON.parse(testCase.input);
              const actualRaw = userFunction(args);
              const actual = JSON.stringify(actualRaw);
              const expected = testCase.expected;
              results.push({
                input: testCase.input,
                expected: expected,
                actual: actual,
                passed: actual === expected,
              });
            } catch (runError) {
              results.push({
                input: testCase.input,
                expected: testCase.expected,
                actual: 'Error: ' + runError.message,
                passed: false,
              });
            }
          }
        } catch (compileError) {
          results.push({ error: 'Syntax Error: ' + compileError.message });
        }
        self.postMessage(results);
      };
    `;
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    workerRef.current = new Worker(URL.createObjectURL(blob));

    workerRef.current.onmessage = (e) => {
      setResults(e.data);
      setIsRunning(false);
    };

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const handleRunTests = () => {
    setIsRunning(true);
    setResults([]);
    workerRef.current?.postMessage({ code, testCases: resource.testCases });
  };
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = resource.testCases?.length || 0;
  const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="p-4 border-b border-slate-700 flex justify-between items-center flex-shrink-0">
          <div>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300">
              Coding Challenge
            </span>
            <h3 className="text-xl font-bold mt-2 text-slate-200">{resource.title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex-grow flex flex-col md:flex-row min-h-0">
          <div className="w-full md:w-1/2 p-4 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-700">
            <h4 className="font-bold text-lg mb-2 text-sky-400">Problem Description</h4>
            <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: resource.content.replace(/\n/g, '<br />') }} />
          </div>
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="flex-grow p-4">
              <h4 className="font-bold text-lg mb-2 text-sky-400">Your Solution</h4>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-48 bg-slate-900 border border-slate-600 rounded-lg p-2 text-mono text-sm text-sky-300 font-mono resize-none"
                spellCheck="false"
              />
            </div>
            <div className="p-4 border-t border-slate-700">
              <button onClick={handleRunTests} disabled={isRunning} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg disabled:opacity-50">
                {isRunning ? 'Running...' : 'Run Tests'}
              </button>
            </div>
          </div>
        </div>
        
        <footer className="p-4 border-t border-slate-700 flex-shrink-0 overflow-y-auto max-h-48">
          <h4 className="font-bold text-lg mb-2 text-sky-400">Results {totalCount > 0 && `(${passedCount}/${totalCount} Passed - ${score}%)`}</h4>
          <div className="space-y-2">
            {results.map((result, i) => (
              <div key={i} className={`p-2 rounded-md text-sm ${result.passed ? 'bg-emerald-900/50' : 'bg-red-900/50'}`}>
                <p className="font-bold">Test Case {i + 1}: {result.passed ? 'PASSED' : 'FAILED'}</p>
                <p><strong>Input:</strong> <code>{result.input}</code></p>
                <p><strong>Expected:</strong> <code>{result.expected}</code></p>
                <p><strong>Got:</strong> <code className={result.passed ? '' : 'text-red-400'}>{result.actual}</code></p>
                {result.error && <p className="text-red-400"><strong>Error:</strong> {result.error}</p>}
              </div>
            ))}
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CodeEditorModal;
