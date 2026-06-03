'use client';

import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { PageId } from '../../src/types';
import PipAIButton from './PipAIButton';
import PipAIChatWindow from './PipAIChatWindow';

function calUrl() {
  return (import.meta as any).env?.VITE_CALCOM_URL || process.env.NEXT_PUBLIC_CALCOM_URL || 'https://cal.com/office-pigeon/demo-call';
}

export default function PipAIWidget({ onPageChange }: { onPageChange: (page: PageId) => void }) {
  const [open, setOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);

  const openWidget = () => {
    setHasOpened(true);
    setOpen(true);
  };

  const bookCall = () => {
    window.open(calUrl(), '_blank', 'noreferrer,noopener');
  };

  const openWhatsApp = async () => {
    const response = await fetch('/api/pip/whatsapp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'general' })
    }).catch(() => null);
    const data = response ? await response.json().catch(() => ({})) : {};

    window.open(
      data.url || 'https://wa.me/19176726764?text=Hi%20Office%20Pigeon%2C%20I%20want%20help%20from%20your%20team.',
      '_blank',
      'noreferrer,noopener'
    );
  };

  return (
    <>
      <AnimatePresence>
        {!open ? <PipAIButton onClick={openWidget} onBookCall={bookCall} onWhatsApp={() => void openWhatsApp()} /> : null}
      </AnimatePresence>
      {hasOpened ? <PipAIChatWindow isOpen={open} onClose={() => setOpen(false)} onPageChange={onPageChange} /> : null}
    </>
  );
}
