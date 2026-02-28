import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

const messages = [
  'Consulting ancient maps...',
  'Ignoring the obvious...',
  'Finding your drop...',
];

export default function LoadingOverlay() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink grain overflow-hidden"
    >
      {/* Pulsing terracotta blob */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-64 h-64 rounded-full animate-blob-pulse"
          style={{
            background:
              'radial-gradient(circle, rgba(196,96,58,0.5) 0%, rgba(217,123,82,0.2) 50%, transparent 70%)',
          }}
        />
      </div>

      {/* Cycling message */}
      <div className="relative z-10 h-16 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="heading text-2xl md:text-3xl text-sand text-center"
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Subtle bottom hint */}
      <p className="absolute bottom-8 text-dusk/60 text-sm font-instrument">
        This may take a moment
      </p>
    </motion.div>
  );
}
