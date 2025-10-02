'use client';

import { motion } from 'framer-motion';
import { Tooltip } from '../ui/Tooltip';

interface EnhancedStrongsTextProps {
  text: string;
  textWithStrongs: string;
  isVerseHovered: boolean;
  onStrongsClick: (strongsNumber: string) => void;
  textSize: 'small' | 'medium' | 'large' | 'xl';
}

interface StrongsWord {
  word: string;
  strongsNumber: string | null;
  isStrongsWord: boolean;
}

export function EnhancedStrongsText({ 
  textWithStrongs, 
  isVerseHovered, 
  onStrongsClick,
  textSize
}: EnhancedStrongsTextProps) {
  
  const parseTextWithStrongs = (textWithStrongs: string): StrongsWord[] => {
    const result: StrongsWord[] = [];
    const strongsMap = new Map<string, string>();
    
    // First, extract all Strong's mappings (word followed by Strong's code)
    let cleanText = textWithStrongs;
    const strongsMatches = textWithStrongs.matchAll(/([\w']+)\{([HG]\d+)\}/g);
    
    for (const match of strongsMatches) {
      const [fullMatch, word, strongsNumber] = match;
      strongsMap.set(word, strongsNumber);
      // Remove the Strong's code but keep the word
      cleanText = cleanText.replace(fullMatch, word);
    }
    
    // Remove any remaining morphological codes like {(H8804)}
    cleanText = cleanText.replace(/\{\([HG]\d+\)\}/g, '');
    
    // Remove any standalone Strong's codes like {H853} that weren't attached to words
    cleanText = cleanText.replace(/\{[HG]\d+\}/g, '');
    
    // Split into words and spaces, preserving both
    const tokens = cleanText.split(/(\s+|[.,;:!?()[\]"])/); 
    
    tokens.forEach(token => {
      if (token) {
        const trimmedToken = token.trim();
        if (trimmedToken && strongsMap.has(trimmedToken)) {
          result.push({
            word: token, // Keep original spacing
            strongsNumber: strongsMap.get(trimmedToken)!,
            isStrongsWord: true
          });
        } else {
          result.push({
            word: token, // Keep original spacing/punctuation
            strongsNumber: null,
            isStrongsWord: false
          });
        }
      }
    });

    return result;
  };

  const getTextSizeClass = () => {
    switch (textSize) {
      case 'small': return 'text-lg';
      case 'medium': return 'text-xl';
      case 'large': return 'text-2xl';
      case 'xl': return 'text-3xl';
      default: return 'text-xl';
    }
  };

  const parsedWords = parseTextWithStrongs(textWithStrongs);

  return (
    <span className={`font-serif ${getTextSizeClass()} leading-relaxed text-stone-800 dark:text-stone-200`}>
      {parsedWords.map((wordData, index) => {
        if (wordData.isStrongsWord && wordData.strongsNumber) {
          return (
            <Tooltip
              key={index}
              content={`Strong's ${wordData.strongsNumber}`}
              delay={500}
              position="top"
            >
              <motion.span
                className={`cursor-pointer transition-colors duration-200`}
                onClick={(e) => {
                  e.stopPropagation();
                  onStrongsClick(wordData.strongsNumber!);
                }}
                initial={false}
                animate={{
                  color: isVerseHovered 
                    ? (typeof window !== 'undefined' && document.documentElement.classList.contains('dark') 
                        ? 'rgb(96 165 250)' // blue-400 for dark mode
                        : 'rgb(37 99 235)') // blue-600 for light mode
                    : 'inherit' // Use inherit to match parent text color
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {wordData.word}
              </motion.span>
            </Tooltip>
          );
        } else {
          return (
            <span key={index}>
              {wordData.word}
            </span>
          );
        }
      })}
    </span>
  );
}
