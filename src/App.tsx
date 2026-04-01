/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, ChangeEvent } from 'react';
import { Sun, Moon, Upload, ChevronRight, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Question {
  id: number;
  text: string;
  answers: Answer[];
}

interface Answer {
  text: string;
  isCorrect: boolean;
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number | null>(null);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Apply theme to body
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsedQuestions = parseQuestions(text);
      setQuestions(parsedQuestions);
      if (parsedQuestions.length > 0) {
        setCurrentQuestionIndex(Math.floor(Math.random() * parsedQuestions.length));
        setSelectedAnswerIndex(null);
        setShowFeedback(false);
      }
    };
    reader.readAsText(file);
  };

  const parseQuestions = (text: string): Question[] => {
    const blocks = text.split('#').filter(block => block.trim() !== '');
    return blocks.map((block, index) => {
      const lines = block.trim().split('\n').map(line => line.trim());
      const questionText = lines[0];
      const answers: Answer[] = lines.slice(1).map(line => {
        if (line.startsWith('+')) {
          return { text: line.substring(1).trim(), isCorrect: true };
        } else if (line.startsWith('-')) {
          return { text: line.substring(1).trim(), isCorrect: false };
        }
        return null;
      }).filter((a): a is Answer => a !== null);

      return { id: index, text: questionText, answers };
    });
  };

  const currentQuestion = currentQuestionIndex !== null ? questions[currentQuestionIndex] : null;

  const shuffledAnswers = useMemo(() => {
    if (!currentQuestion) return [];
    return [...currentQuestion.answers].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);

  const handleAnswerClick = (index: number) => {
    if (showFeedback) return;
    setSelectedAnswerIndex(index);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    if (questions.length === 0) return;
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * questions.length);
    } while (nextIndex === currentQuestionIndex && questions.length > 1);
    
    setCurrentQuestionIndex(nextIndex);
    setSelectedAnswerIndex(null);
    setShowFeedback(false);
  };

  const getAnswerStyle = (index: number, isCorrect: boolean) => {
    if (!showFeedback) {
      return isDarkMode 
        ? 'bg-violet-900/20 border-violet-700/30 hover:bg-violet-900/40' 
        : 'bg-white border-violet-500 hover:bg-violet-50';
    }

    if (isCorrect) {
      return 'bg-green-100 border-green-500 text-green-900 dark:bg-green-900/30 dark:border-green-500 dark:text-green-100';
    }

    if (selectedAnswerIndex === index && !isCorrect) {
      return 'bg-red-100 border-red-500 text-red-900 dark:bg-red-900/30 dark:border-red-500 dark:text-red-100';
    }

    return isDarkMode 
      ? 'bg-violet-900/10 border-violet-800/20 opacity-50' 
      : 'bg-gray-50 border-gray-200 opacity-50';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-violet-100' : 'bg-violet-50 text-violet-900'}`}>
      {/* Header Controls */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-3 rounded-full transition-all duration-300 shadow-lg ${
            isDarkMode 
              ? 'bg-violet-800 text-violet-100 hover:bg-violet-700' 
              : 'bg-white text-violet-600 hover:bg-violet-100 border border-violet-200'
          }`}
          id="theme-toggle"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-20 flex flex-col items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          {!currentQuestion ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-6"
            >
              <div className={`p-12 rounded-3xl border-2 border-dashed transition-all duration-300 ${
                isDarkMode ? 'border-violet-800 bg-violet-900/10' : 'border-violet-300 bg-white'
              }`}>
                <Upload className="mx-auto mb-4 text-violet-500" size={48} />
                <h2 className="text-2xl font-bold mb-2">Yuklash</h2>
                <p className="text-violet-500/70 mb-6">Test faylini tanlang (.txt)</p>
                <label className="cursor-pointer bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg inline-block">
                  Faylni tanlash
                  <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
              <div className="text-sm opacity-60 space-y-1">
                <p>Format:</p>
                <p># Savol</p>
                <p>+ To'g'ri javob</p>
                <p>- Noto'g'ri javob</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full space-y-8"
            >
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-widest text-violet-500">Savol</span>
                <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
                  {currentQuestion.text}
                </h1>
              </div>

              <div className="grid gap-4">
                {shuffledAnswers.map((answer, index) => (
                  <motion.button
                    key={index}
                    whileHover={!showFeedback ? { scale: 1.01 } : {}}
                    whileTap={!showFeedback ? { scale: 0.99 } : {}}
                    onClick={() => handleAnswerClick(index)}
                    className={`w-full p-5 text-left rounded-2xl border-2 transition-all duration-200 flex items-center justify-between group ${getAnswerStyle(index, answer.isCorrect)}`}
                    disabled={showFeedback}
                  >
                    <span className="text-lg font-medium">{answer.text}</span>
                    {showFeedback && (
                      <div className="flex-shrink-0 ml-4">
                        {answer.isCorrect ? (
                          <Check className="text-green-500" size={24} />
                        ) : selectedAnswerIndex === index ? (
                          <X className="text-red-500" size={24} />
                        ) : null}
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Next Button */}
      {currentQuestion && (
        <div className="fixed bottom-8 right-8">
          <button
            onClick={handleNextQuestion}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-violet-500/20 group"
            id="next-button"
          >
            ketingi
            <ChevronRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
