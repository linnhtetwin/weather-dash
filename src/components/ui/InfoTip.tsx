import React from 'react';
import { Info } from 'lucide-react';

interface InfoTipProps {
  label: string;
}

export function InfoTip({ label }: InfoTipProps) {
  return (
    <span className="group relative inline-flex align-middle">
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-500 transition-colors hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        tabIndex={0}
        role="img"
        aria-label={label}
      >
        <Info className="h-3.5 w-3.5" />
      </span>
      <span className="pointer-events-none absolute left-1/2 top-full z-30 mt-2 hidden w-64 -translate-x-1/2 rounded-lg border border-white/10 bg-slate-950/95 px-3 py-2 text-xs font-normal leading-relaxed text-slate-200 shadow-2xl shadow-slate-950/50 group-hover:block group-focus-within:block">
        {label}
      </span>
    </span>
  );
}
