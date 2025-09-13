'use client';

import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface SidebarProps {
  isVisible: boolean;
  title: string | ReactNode;
  onClose: () => void;
  children: ReactNode;
  loadingOverlay?: {
    isLoading: boolean;
    progress?: number;
    text: string | React.ReactNode;
  };
  className?: string;
  headerAction?: ReactNode;
}

export function Sidebar({ 
  isVisible, 
  title, 
  onClose, 
  children, 
  loadingOverlay,
  className = "",
  headerAction
}: SidebarProps) {
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={`h-full bg-stone-50/30 dark:bg-stone-950/50 border-r border-stone-200/50 dark:border-stone-700/50 overflow-hidden ${className}`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="px-6 py-6 bg-stone-50 dark:bg-transparent">
            <div className="flex items-center justify-between">
              {typeof title === 'string' ? (
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">{title}</h3>
              ) : (
                <div className="text-lg font-medium text-stone-900 dark:text-stone-100 flex-1">{title}</div>
              )}
              <button
                onClick={onClose}
                className="text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 transition-colors ml-4 p-1 rounded-lg bg-stone-200/50 dark:bg-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hide relative">
            {/* Loading Overlay */}
            {loadingOverlay?.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-stone-950/80 backdrop-blur-sm z-10">
                <div className="flex flex-col items-center space-y-3">
                  <div className="text-sm text-stone-600 dark:text-stone-400">
                    {loadingOverlay.text}
                  </div>
                  
                  {/* Progress Bar */}
                  {typeof loadingOverlay.progress === 'number' && (
                    <div className="w-48">
                      <div className="w-full bg-stone-200/50 dark:bg-stone-700/50 rounded-full h-1">
                        <div 
                          className="bg-stone-600 dark:bg-stone-400 h-1 rounded-full transition-all duration-100 ease-out"
                          style={{ width: `${loadingOverlay.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {children}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface SidebarContentProps {
  children: ReactNode;
  className?: string;
}

export function SidebarContent({ children, className = "" }: SidebarContentProps) {
  return (
    <div className={`py-6 space-y-4 ${className}`}>
      {children}
    </div>
  );
}

interface SidebarSectionProps {
  children: ReactNode;
  className?: string;
}

export function SidebarSection({ children, className = "" }: SidebarSectionProps) {
  return (
    <div className={`px-6 ${className}`}>
      {children}
    </div>
  );
}
