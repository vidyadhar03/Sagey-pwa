"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

export default function ChatInterface() {
  // State to control animation of suggestion chips
  const [isVisible, setIsVisible] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollControls = useAnimation();
  const userInteractionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Effect to trigger animation when component mounts
  useEffect(() => {
    setIsVisible(true);
    
    // When the component unmounts, reset the state
    return () => setIsVisible(false);
  }, []);

  // Handle user scrolling interactions
  const handleUserInteractionStart = () => {
    setIsUserScrolling(true);
    scrollControls.stop(); // Stop the auto-scroll animation

    // Clear any existing timeout
    if (userInteractionTimeoutRef.current) {
      clearTimeout(userInteractionTimeoutRef.current);
    }
  };

  const handleUserInteractionEnd = () => {
    // Wait a short period before resuming auto-scroll
    if (userInteractionTimeoutRef.current) {
      clearTimeout(userInteractionTimeoutRef.current);
    }

    userInteractionTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 3000); // Wait 3 seconds after user stops scrolling
  };

  // Effect to trigger auto-scrolling after the initial animation
  useEffect(() => {
    if (isVisible && scrollContainerRef.current && !isUserScrolling) {
      // Wait for the initial pop-up animation to complete
      const startAutoScroll = setTimeout(() => {
        const scrollWidth = scrollContainerRef.current?.scrollWidth || 0;
        const clientWidth = scrollContainerRef.current?.clientWidth || 0;
        
        // Only scroll if the content overflows
        if (scrollWidth > clientWidth) {
          const scrollDistance = scrollWidth - clientWidth;
          
          // Start the auto-scrolling animation
          const startScroll = async () => {
            // Get the current scroll position
            const currentScrollX = scrollContainerRef.current ? 
              scrollContainerRef.current.scrollLeft : 0;
              
            // Calculate remaining distance (for future reference)
            // const remainingDistance = scrollDistance - currentScrollX;
            
            while (!isUserScrolling) {
              await scrollControls.start({
                x: -scrollDistance,
                transition: { 
                  duration: 60,
                  ease: "linear" 
                }
              });
              
              // Pause briefly at the end
              await new Promise(resolve => setTimeout(resolve, 1500));
              
              // Reset to beginning with a brief pause
              await scrollControls.start({
                x: 0,
                transition: { 
                  duration: 0.5,
                  ease: "easeOut" 
                }
              });
              
              // Pause briefly at the beginning before scrolling again
              await new Promise(resolve => setTimeout(resolve, 1500));
            }
          };
          
          startScroll();
        }
      }, 3000); // Reduced from 4500ms to 3000ms since chips appear faster now
      
      return () => clearTimeout(startAutoScroll);
    }
  }, [isVisible, isUserScrolling, scrollControls]);

  // Add event listeners for user scrolling
  useEffect(() => {
    const container = scrollContainerRef.current;
    
    if (container) {
      // Mouse events
      container.addEventListener('mousedown', handleUserInteractionStart);
      container.addEventListener('mouseup', handleUserInteractionEnd);
      
      // Touch events for mobile
      container.addEventListener('touchstart', handleUserInteractionStart);
      container.addEventListener('touchend', handleUserInteractionEnd);
      
      // Wheel event for mousewheel scrolling
      container.addEventListener('wheel', handleUserInteractionStart, { passive: true });
      
      return () => {
        // Clean up the event listeners
        container.removeEventListener('mousedown', handleUserInteractionStart);
        container.removeEventListener('mouseup', handleUserInteractionEnd);
        container.removeEventListener('touchstart', handleUserInteractionStart);
        container.removeEventListener('touchend', handleUserInteractionEnd);
        container.removeEventListener('wheel', handleUserInteractionStart);
        
        if (userInteractionTimeoutRef.current) {
          clearTimeout(userInteractionTimeoutRef.current);
        }
      };
    }
  }, [handleUserInteractionStart, handleUserInteractionEnd]);

  // Input bar animation variants
  const inputBarVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { 
        type: "spring", 
        damping: 20, 
        stiffness: 300,
        delay: 0.1 // Just a slight delay after initial animation starts
      }
    }
  };

  // Suggestion prompts - expanded to 7
  const suggestions = [
    "How are you feeling today?",
    "What's on your mind?",
    "What are you grateful for?",
    "Tell me about your day",
    "What's your goal today?",
    "Need help with something?",
    "What made you smile today?"
  ];

  // Custom delay function with faster staggered timing
  const getAnimationDelay = (index: number) => {
    switch(index) {
      case 0: return 0;    // First item appears immediately
      case 1: return 0.3;  // Reduced from 0.7s
      case 2: return 0.6;  // Reduced from 1.4s
      case 3: return 0.9;  // Reduced from 2.0s
      case 4: return 1.2;  // Reduced from 2.5s
      case 5: return 1.5;  // Reduced from 3.0s
      case 6: return 1.8;  // Reduced from 3.5s
      default: return 0;
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-10 flex flex-col items-center pt-[1px] transition-all duration-300 ease-in-out pointer-events-none">
      {/* Background blur layer */}
      <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none"></div>
      
      <div className="w-full max-w-7xl mx-auto pb-[4px] relative z-10 pointer-events-none">
        {/* Horizontally Scrolling Suggestion Chips */}
        <div className="w-full flex justify-center overflow-hidden mb-[4px] px-0 mt-[1px] pointer-events-auto">
          <AnimatePresence>
            {isVisible && (
              <div className="w-full">
                <div 
                  ref={scrollContainerRef}
                  className="flex gap-2 overflow-x-auto touch-pan-x w-full px-4"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  <motion.div 
                    className="flex gap-2 flex-nowrap w-full"
                    animate={scrollControls}
                    initial="hidden"
                  >
                    {suggestions.map((suggestion, index) => (
                      <motion.button 
                        key={index}
                        className="px-3 py-1.5 rounded-full bg-[#2A2A2D]/80 backdrop-blur-sm text-[#E0E0E0] text-xs whitespace-nowrap shadow-sm border border-white/10"
                        initial={{ opacity: 0, y: 20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.8 }}
                        transition={{ 
                          delay: getAnimationDelay(index),
                          type: "spring", 
                          damping: 12, 
                          stiffness: 200 
                        }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Chat Input Bar with Animation */}
        <div className="px-4 pointer-events-auto">
          <AnimatePresence>
            {isVisible && (
              <motion.div 
                className="h-14 rounded-[34px] border border-white/10 flex items-center justify-between px-4 mb-[2px]"
                style={{
                  backgroundColor: 'rgba(30, 30, 32, 0.75)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)'
                }}
                variants={inputBarVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                {/* Left: Search icon + placeholder */}
                <div className="flex items-center gap-2 flex-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-[#A0A0A0]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  <span className="text-sm text-[#A0A0A0]">Chat with Sagey…</span>
                </div>
                
                {/* Right: Send button - Original arrow icon without background */}
                <button className="w-11 h-11 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-[#1DB954]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}