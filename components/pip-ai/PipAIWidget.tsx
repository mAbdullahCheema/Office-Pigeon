'use client';

import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { PageId } from '../../src/types';
import PipAIButton from './PipAIButton';
import PipAIChatWindow from './PipAIChatWindow';

export default function PipAIWidget({ onPageChange }: { onPageChange: (page: PageId) => void }) {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const openWidget = () => {
    setHasOpened(true);
    setOpen(true);
  };

  return (
    <>
      <AnimatePresence>
        {!open ? <PipAIButton onClick={openWidget} /> : null}
      </AnimatePresence>
      {hasOpened ? <PipAIChatWindow isOpen={open} onClose={() => setOpen(false)} onPageChange={onPageChange} /> : null}
    </>
  );
}
