import { JSX } from 'react';

interface SmoothScrollProps {
  children: JSX.Element | JSX.Element[];
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  return (
    <div className="w-full">
      {children}
    </div>
  );
}

