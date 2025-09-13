import { useState, useEffect } from 'react';

export function useFocusMode() {
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showFocusToast, setShowFocusToast] = useState(false);

  // ESC key handler for focus mode
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isFocusMode) {
        setIsFocusMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocusMode]);

  const toggleFocusMode = () => {
    setIsFocusMode(!isFocusMode);
    if (!isFocusMode) {
      setShowFocusToast(true);
    }
  };

  const exitFocusMode = () => {
    setIsFocusMode(false);
  };

  return {
    isFocusMode,
    showFocusToast,
    setShowFocusToast,
    toggleFocusMode,
    exitFocusMode,
  };
}
