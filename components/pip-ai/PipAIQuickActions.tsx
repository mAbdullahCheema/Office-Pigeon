'use client';

export interface PipAction {
  type: string;
  label: string;
  payload?: Record<string, unknown>;
}

const defaultActions: PipAction[] = [
  { type: 'recommend_service', label: 'Recommend a Service' },
  { type: 'view_website_packages', label: 'View Website Packages' },
  { type: 'view_chatbot_packages', label: 'View Chatbot Packages' },
  { type: 'ask_automations', label: 'Ask About Automations' },
  { type: 'book_call', label: 'Book Free Consultation' },
  { type: 'whatsapp', label: 'Continue on WhatsApp' }
];

export default function PipAIQuickActions({ onAction, actions = defaultActions }: { onAction: (action: PipAction) => void; actions?: PipAction[] }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {actions.map((action) => (
        <button
          key={action.type}
          type="button"
          onClick={() => onAction(action)}
          className="shrink-0 rounded-full border border-cyan-100 bg-white px-3 py-2 text-[11px] font-bold text-gray-700 shadow-sm transition hover:border-cyan-200 hover:bg-cyan-50 focus:outline-none focus:ring-2 focus:ring-cyan-200"
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
