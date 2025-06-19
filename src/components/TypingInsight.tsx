"use client";

import { useState, useEffect } from 'react';

interface TypingInsightProps {
  text: string;
  speed?: number;
  className?: string;
}

export default function TypingInsight({ text, speed = 50, className = "" }: TypingInsightProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setIsTyping(true);
  }, [text]);

  useEffect(() => {
    if (!isTyping || currentIndex >= text.length) {
      setIsTyping(false);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayedText(prev => prev + text[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, speed, isTyping]);

  return (
    <div className={`${className} relative`}>
      <span className="text-base font-medium text-white">
        {displayedText}
        {isTyping && (
          <span className="animate-pulse text-green-400 ml-1">|</span>
        )}
      </span>
    </div>
  );
} 