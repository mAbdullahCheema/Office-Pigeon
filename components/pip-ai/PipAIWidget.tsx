'use client';

import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import PipAIButton from './PipAIButton';
import PipAIChatWindow from './PipAIChatWindow';

export default function PipAIWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {open ? <PipAIChatWindow onClose={() => setOpen(false)} /> : <PipAIButton onClick={() => setOpen(true)} />}
      </AnimatePresence>
    </>
  );
}
