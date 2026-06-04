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
      className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-600 text-white shadow-2xl shadow-cyan-950/15 transition hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-300 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:px-5 sm:py-3.5 sm:gap-2 cursor-pointer"
      aria-label="Ask Pip AI"
    >
      <MessageCircle size={20} className="shrink-0" />
      <span className="hidden sm:inline text-xs font-black uppercase tracking-wider">Ask Pip AI</span>
    </motion.button>
  );
}
