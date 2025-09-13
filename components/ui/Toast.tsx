import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  actionButton?: {
    text: string;
    onClick: () => void;
  };
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  isVisible, 
  onClose, 
  duration = 3000,
  actionButton
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ 
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 0.8
          }}
          className="fixed top-6 right-6 z-50"
        >
          <motion.div 
            className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-700 rounded-2xl shadow-lg px-5 py-4 flex items-center space-x-4 min-w-[320px]"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <span className="text-sm text-stone-700 dark:text-stone-300 font-medium flex-1">
              {message}
            </span>
            {actionButton && (
              <motion.button
                onClick={actionButton.onClick}
                className="flex-shrink-0 px-3 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 text-xs font-medium rounded-full hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                {actionButton.text}
              </motion.button>
            )}
            <motion.button
              onClick={onClose}
              className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center justify-center transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <X className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400" />
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
