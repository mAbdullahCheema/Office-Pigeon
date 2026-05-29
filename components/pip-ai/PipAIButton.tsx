'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function PipAIButton({ onClick }: { onClick: () => void }) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      type="button"
      onClick={onClick}
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-cyan-600 px-4 py-3 text-sm font-black text-white shadow-2xl shadow-cyan-950/15 transition hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-300 sm:bottom-6 sm:right-6"
      aria-label="Ask Pip AI"
    >
      <MessageCircle size={19} />
      <span>Ask Pip AI</span>
    </motion.button>
  );
}
