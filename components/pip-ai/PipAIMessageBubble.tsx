'use client';

import { PipAction } from './PipAIQuickActions';

export interface PipMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: PipAction[];
}

export default function PipAIMessageBubble({ message, onAction }: { message: PipMessage; onAction: (action: PipAction) => void }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[86%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${
          isUser
            ? 'rounded-tr-sm bg-cyan-600 text-white'
            : 'rounded-tl-sm border border-gray-100 bg-white text-gray-800'
        }`}
      >
        {message.content}
      </div>
      {message.actions?.length ? (
        <div className="mt-2 flex w-full max-w-[86%] flex-col gap-1.5">
          {message.actions.map((action) => (
            <button
              key={`${message.id}-${action.type}`}
              type="button"
              onClick={() => onAction(action)}
              className="rounded-xl border border-cyan-100 bg-white px-3 py-2 text-left text-[11px] font-bold text-cyan-700 shadow-sm transition hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-200"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
