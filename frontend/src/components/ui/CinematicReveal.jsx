import React from 'react';
import { motion } from 'framer-motion';

/**
 * CinematicReveal Component
 * 
 * Wraps content in an overflow-hidden container and reveals it by translating Y from 100% to 0%.
 * This creates a "rising from a line" effect.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Content to reveal (usually text)
 * @param {number} props.delay - Delay in seconds before starting animation
 * @param {number} props.duration - Duration of the animation
 * @param {string} props.className - Additional classes for the wrapper
 * @param {string} props.tag - HTML tag to use (default: div)
 */
export const CinematicReveal = ({ 
  children, 
  delay = 0, 
  duration = 0.8,
  className = "",
  tag = "div" 
}) => {
  const Component = motion[tag] || motion.div;

  return (
    <div className={`overflow-hidden relative ${className}`}>
      <Component
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        transition={{
          duration: duration,
          delay: delay,
          ease: [0.25, 1, 0.5, 1], // Cubic bezier for "cinematic" feel
        }}
        className="block"
      >
        {children}
      </Component>
    </div>
  );
};
