'use client';

import React, { useState } from 'react';
import { Check, Share } from 'lucide-react';
import { useUrlState } from '@/hooks/useUrlState';

interface ShareButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ShareButton({ className = '', size = 'md' }: ShareButtonProps) {
  const { generateShareUrl } = useUrlState();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = generateShareUrl();
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
      // Fallback: select the URL text
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <button
      onClick={handleShare}
      className={`${sizeClasses[size]} flex items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 transition-all duration-200 group ${className}`}
      title={copied ? 'Link copied!' : 'Copy share link'}
    >
      {copied ? (
        <Check className={iconSizes[size]} />
      ) : (
        <Share className={iconSizes[size]} />
      )}
    </button>
  );
}
