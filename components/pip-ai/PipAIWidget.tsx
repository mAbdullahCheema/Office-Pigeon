'use client';

import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { PageId } from '../../src/types';
import PipAIButton from './PipAIButton';
import PipAIChatWindow from './PipAIChatWindow';

export default function PipAIWidget({ onPageChange }: { onPageChange: (page: PageId) => void }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <AnimatePresence>
        {open ? <PipAIChatWindow onClose={() => setOpen(false)} onPageChange={onPageChange} /> : <PipAIButton onClick={() => setOpen(true)} />}
      </AnimatePresence>
    </>
  );
}
