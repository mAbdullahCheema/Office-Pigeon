'use client';

export default function PipAITypingIndicator() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm border border-cyan-100 bg-white px-3 py-2 shadow-sm">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:140ms]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-500 [animation-delay:280ms]" />
    </div>
  );
}
