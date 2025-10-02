'use client';

import React, { useState, useRef, useEffect } from 'react';
import { IoSend } from 'react-icons/io5';
import { Loader2 } from 'lucide-react';

interface FloatingAskInputProps {
  isVisible: boolean;
  onSubmit: (question: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function FloatingAskInput({ 
  isVisible, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  placeholder = "Ask a question about the selected verses..."
}: FloatingAskInputProps) {
  const [question, setQuestion] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle visibility and animations
  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      // Small delay to ensure DOM is ready, then start animation
      setTimeout(() => setIsAnimating(true), 10);
      // Focus after animation starts
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 150);
    } else {
      setIsAnimating(false);
      // Remove from DOM after animation completes
      setTimeout(() => setShouldRender(false), 300);
    }
  }, [isVisible]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [question]);

  const handleSubmit = () => {
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
      setQuestion('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onCancel();
      setQuestion('');
    }
  };

  if (!shouldRender) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
      isAnimating 
        ? 'opacity-100 translate-y-0' 
        : 'opacity-0 translate-y-8'
    }`}>
      <div className="bg-gradient-to-t from-white dark:from-stone-900 via-white dark:via-stone-900 to-transparent pt-8 pb-6">
        <div className="max-w-4xl mx-auto px-6">
          <div className={`bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-3xl shadow-lg p-4 transition-all duration-300 ease-out transform ${
            isAnimating 
              ? 'scale-100 blur-0' 
              : 'scale-95 blur-sm'
          }`}>
            <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full resize-none border-0 outline-none text-base leading-6 placeholder-stone-500 dark:placeholder-stone-400 bg-transparent text-stone-900 dark:text-stone-100 max-h-32 min-h-[28px]"
                rows={1}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex items-center">
              <button
                onClick={handleSubmit}
                disabled={!question.trim() || isLoading}
                className="flex items-center justify-center w-8 h-8 bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 disabled:bg-stone-300 dark:disabled:bg-stone-600 disabled:cursor-not-allowed text-white dark:text-stone-900 rounded-full transition-all"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <IoSend className="w-4 h-4" />
                )}
              </button>
            </div>
            </div>
            
            <div className="mt-2 text-xs text-stone-400 dark:text-stone-500">
              Press Enter to send, Shift+Enter for new line, Esc to close
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
