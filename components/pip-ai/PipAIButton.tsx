'use client';

import { AnimatePresence, motion } from 'motion/react';
import { Calendar, MessageCircle, Plus, Send } from 'lucide-react';
import { useState } from 'react';

type PipAIButtonProps = {
  onClick: () => void;
  onBookCall: () => void;
  onWhatsApp: () => void;
};

const actions = [
  {
    label: 'Ask Pip AI',
    Icon: MessageCircle,
    type: 'chat'
  },
  {
    label: 'Book Consultation',
    Icon: Calendar,
    type: 'book'
  },
  {
    label: 'WhatsApp Team',
    Icon: Send,
    type: 'whatsapp'
  }
] as const;

export default function PipAIButton({ onClick, onBookCall, onWhatsApp }: PipAIButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  function runAction(type: (typeof actions)[number]['type']) {
    setIsOpen(false);

    if (type === 'chat') {
      onClick();
      return;
    }

    if (type === 'book') {
      onBookCall();
      return;
    }

    onWhatsApp();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6"
    >
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, x: 10, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 10, y: 10, filter: 'blur(10px)' }}
            transition={{ duration: 0.35, type: 'spring', stiffness: 300, damping: 24 }}
            className="flex flex-col items-end gap-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.type}
                type="button"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2, delay: index * 0.04 }}
                onClick={() => runAction(action.type)}
                className="flex items-center gap-2 rounded-2xl border border-white/70 bg-gray-950/80 px-3.5 py-2.5 text-xs font-black text-white shadow-2xl shadow-cyan-950/15 backdrop-blur-md transition hover:bg-gray-950 focus:outline-none focus:ring-2 focus:ring-cyan-300"
              >
                <action.Icon size={15} />
                <span>{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-600 text-white shadow-2xl shadow-cyan-950/15 transition hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-300"
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close Pip AI menu' : 'Open Pip AI menu'}
      >
        <motion.span animate={{ rotate: isOpen ? 45 : 0 }} transition={{ duration: 0.25, type: 'spring', stiffness: 300, damping: 20 }}>
          <Plus size={22} />
        </motion.span>
      </button>
    </motion.div>
  );
}
