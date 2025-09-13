'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 animate-pulse" />
    );
  }

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    return theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />;
  };

  const tooltipContent = `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`;

  return (
    <Tooltip content={tooltipContent} delay={500} position="right">
      <button
        onClick={cycleTheme}
        className="w-9 h-9 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors flex items-center justify-center text-stone-700 dark:text-stone-300"
      >
        {getIcon()}
      </button>
    </Tooltip>
  );
}
