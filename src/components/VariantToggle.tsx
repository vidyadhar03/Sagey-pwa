"use client";

import { motion } from 'framer-motion';

interface VariantToggleProps {
  variant: "witty" | "poetic";
  onVariantChange: (variant: "witty" | "poetic") => void;
  disabled?: boolean;
  isHydrated?: boolean; // For SSR handling
}

export default function VariantToggle({
  variant,
  onVariantChange,
  disabled = false,
  isHydrated = true
}: VariantToggleProps) {
  return (
    <div className="w-full mb-6">
      <motion.div 
        className="bg-zinc-900/50 border border-white/10 rounded-xl p-1 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHydrated ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="relative flex">
          {/* Background slider */}
          <motion.div
            className="absolute inset-y-1 bg-white/10 rounded-lg"
            layout
            initial={false}
            animate={{
              x: variant === "witty" ? 0 : "100%",
              width: "50%",
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />
          
          {/* Witty Tab */}
          <button
            className={`
              relative z-10 flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors duration-200
              ${variant === "witty" 
                ? 'text-white' 
                : 'text-zinc-400 hover:text-zinc-300'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
            onClick={() => !disabled && onVariantChange("witty")}
            disabled={disabled}
          >
            <motion.span
              initial={false}
              animate={{
                scale: variant === "witty" ? 1.05 : 1,
                opacity: variant === "witty" ? 1 : 0.8,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
            >
              ✨ Witty
            </motion.span>
          </button>
          
          {/* Poetic Tab */}
          <button
            className={`
              relative z-10 flex-1 py-3 px-4 text-sm font-medium rounded-lg transition-colors duration-200
              ${variant === "poetic" 
                ? 'text-white' 
                : 'text-zinc-400 hover:text-zinc-300'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
            `}
            onClick={() => !disabled && onVariantChange("poetic")}
            disabled={disabled}
          >
            <motion.span
              initial={false}
              animate={{
                scale: variant === "poetic" ? 1.05 : 1,
                opacity: variant === "poetic" ? 1 : 0.8,
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
            >
              🎭 Poetic
            </motion.span>
          </button>
        </div>
      </motion.div>
      
      {/* Subtle description */}
      <motion.div
        className="mt-2 text-xs text-zinc-500 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {variant === "witty" 
          ? "Upbeat & playful with emoji flair" 
          : "Metaphorical & artistic with flowing prose"
        }
      </motion.div>
    </div>
  );
} 