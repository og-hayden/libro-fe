'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { TextSize } from '../types';

const PERSPECTIVE_GROUPS = {
  Orthodox: [
    { key: 'eastern_orthodox', label: 'Eastern Orthodox' },
    { key: 'oriental_orthodox', label: 'Oriental Orthodox' },
  ],
  Catholic: [
    { key: 'catholic', label: 'Catholic' },
  ],
  Protestant: [
    { key: 'baptist', label: 'Baptist' },
    { key: 'anglican', label: 'Anglican' },
    { key: 'methodist', label: 'Methodist' },
    { key: 'pentecostal', label: 'Pentecostal' },
    { key: 'lutheran', label: 'Lutheran' },
    { key: 'presbyterian', label: 'Presbyterian' },
    { key: 'puritan', label: 'Puritan' },
    { key: 'dutch_reformed', label: 'Dutch Reformed' },
    { key: 'moravian', label: 'Moravian' },
  ],
};

interface SettingsDropdownProps {
  textSize: TextSize;
  selectedPerspectives: string[];
  onTextSizeChange: (size: TextSize) => void;
  onPerspectivesChange: (perspectives: string[]) => void;
}

export function SettingsDropdown({
  textSize,
  selectedPerspectives,
  onTextSizeChange,
  onPerspectivesChange,
}: SettingsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePerspectiveToggle = (perspective: string) => {
    if (selectedPerspectives.includes(perspective)) {
      onPerspectivesChange(selectedPerspectives.filter(p => p !== perspective));
    } else {
      onPerspectivesChange([...selectedPerspectives, perspective]);
    }
  };

  const textSizeDisplay = {
    'small': 'S',
    'medium': 'M', 
    'large': 'L',
    'xl': 'XL'
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm border transition-all bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
      >
        <Settings className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full right-0 mt-2 z-50"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ 
              duration: 0.2, 
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <Card className="w-72 shadow-xl border-stone-100 dark:border-stone-700">
              <CardContent className="p-4">
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1, duration: 0.15 }}
                >
                  {/* Text Size Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: 0.05,
                      duration: 0.2,
                      ease: "easeOut"
                    }}
                  >
                    <h4 className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide px-2 mb-3">
                      Text Size
                    </h4>
                    <div className="flex items-center bg-stone-50 dark:bg-stone-900 rounded-full p-1 border border-stone-200 dark:border-stone-700">
                      {(['small', 'medium', 'large', 'xl'] as const).map((size) => (
                        <button
                          key={size}
                          onClick={() => onTextSizeChange(size)}
                          className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                            textSize === size
                              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                              : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                          }`}
                        >
                          {textSizeDisplay[size]}
                        </button>
                      ))}
                    </div>
                  </motion.div>

                  {/* Perspectives Section */}
                  {Object.entries(PERSPECTIVE_GROUPS).map(([groupName, perspectives], groupIndex) => (
                    <motion.div 
                      key={groupName} 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        delay: 0.08 + (groupIndex * 0.03),
                        duration: 0.2,
                        ease: "easeOut"
                      }}
                    >
                      <h4 className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide px-2">
                        {groupName}
                      </h4>
                      <div className="space-y-1">
                        {perspectives.map((perspective, perspectiveIndex) => (
                          <motion.button
                            key={perspective.key}
                            onClick={() => handlePerspectiveToggle(perspective.key)}
                            className="w-full flex items-center space-x-3 p-2 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-lg transition-all text-left"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.11 + (groupIndex * 0.03) + (perspectiveIndex * 0.02),
                              duration: 0.2,
                              ease: "easeOut"
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <motion.div 
                              className={`w-4 h-4 rounded-full transition-all ${
                                selectedPerspectives.includes(perspective.key)
                                  ? 'bg-stone-700 dark:bg-stone-300'
                                  : 'border-2 border-stone-300 dark:border-stone-600 hover:border-stone-400 dark:hover:border-stone-500'
                              }`}
                              animate={{
                                scale: selectedPerspectives.includes(perspective.key) ? [1, 1.2, 1] : 1
                              }}
                              transition={{ duration: 0.2 }}
                            />
                            <span className={`text-sm font-medium transition-all ${
                              selectedPerspectives.includes(perspective.key)
                                ? 'text-stone-900 dark:text-stone-100'
                                : 'text-stone-600 dark:text-stone-400'
                            }`}>
                              {perspective.label}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
