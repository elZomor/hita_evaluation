import { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  text: string;
  className?: string;
}

export function Tooltip({ children, text, className = '' }: TooltipProps) {
  return (
    <span className={`group relative inline-block ${className}`}>
      {children}
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 whitespace-normal rounded bg-foreground px-2 py-1 text-xs text-background shadow-lg group-hover:block max-w-xs text-center">
        {text}
      </span>
    </span>
  );
}

export function TruncateWithTooltip({
  text,
  className = ''
}: {
  text: string;
  className?: string;
}) {
  return (
    <span className={`group relative inline-block max-w-full ${className}`}>
      <span className="block truncate">{text}</span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 whitespace-normal rounded bg-foreground px-2 py-1 text-xs text-background shadow-lg group-hover:block max-w-xs text-center">
        {text}
      </span>
    </span>
  );
}
