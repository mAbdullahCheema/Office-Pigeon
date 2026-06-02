import { useEffect } from 'react';
import { BRAND } from '../config';

type ToolResult = {
  success: boolean;
  message: string;
};

type ToolParams = {
  message?: unknown;
  text?: unknown;
  prefilled_message?: unknown;
};

type ConvaiCallEvent = Event & {
  detail?: {
    config?: {
      clientTools?: Record<string, (params?: ToolParams) => ToolResult>;
    };
  };
};

declare global {
  interface Window {
    OfficePigeonElevenLabsClientTools?: {
      open_consultation_page: () => ToolResult;
      open_whatsapp_contact: (params?: ToolParams) => ToolResult;
    };
  }
}

function safeMessage(params?: ToolParams) {
  const raw = params?.message || params?.prefilled_message || params?.text;
  return typeof raw === 'string' ? raw.trim().slice(0, 500) : '';
}

function openClientUrl(url: string, successMessage: string): ToolResult {
  if (typeof window === 'undefined') {
    return { success: false, message: 'This tool can only run in a browser.' };
  }

  try {
    const opened = window.open(url, '_blank', 'noopener,noreferrer');
    if (!opened) {
      window.location.assign(url);
    }
    return { success: true, message: successMessage };
  } catch {
    return { success: false, message: 'The browser could not open the requested page.' };
  }
}

export function createOfficePigeonElevenLabsClientTools() {
  return {
    open_consultation_page: () =>
      openClientUrl(BRAND.calComUrl, 'Consultation page opened.'),
    open_whatsapp_contact: (params?: ToolParams) => {
      const message = safeMessage(params);
      const url = message ? `${BRAND.whatsappUrl}?text=${encodeURIComponent(message)}` : BRAND.whatsappUrl;
      return openClientUrl(url, 'WhatsApp contact opened.');
    }
  };
}

export default function ElevenLabsClientTools() {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const tools = createOfficePigeonElevenLabsClientTools();
    window.OfficePigeonElevenLabsClientTools = tools;

    const attachToWidget = (widget: Element) => {
      if ((widget as HTMLElement).dataset.officePigeonClientTools === 'ready') return;
      (widget as HTMLElement).dataset.officePigeonClientTools = 'ready';

      widget.addEventListener('elevenlabs-convai:call', ((event: ConvaiCallEvent) => {
        if (!event.detail?.config) return;
        event.detail.config.clientTools = {
          ...event.detail.config.clientTools,
          open_consultation_page: tools.open_consultation_page,
          open_whatsapp_contact: tools.open_whatsapp_contact
        };
      }) as EventListener);
    };

    const attachAllWidgets = () => {
      document.querySelectorAll('elevenlabs-convai').forEach(attachToWidget);
    };

    attachAllWidgets();

    const observer = new MutationObserver(attachAllWidgets);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      if (window.OfficePigeonElevenLabsClientTools === tools) {
        delete window.OfficePigeonElevenLabsClientTools;
      }
    };
  }, []);

  return null;
}
