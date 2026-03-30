import React from 'react';
import { cn } from '../../lib/utils';

export const Card = ({ children, className, key, style }: { children: React.ReactNode; className?: string; key?: React.Key; style?: React.CSSProperties }) => (
  <div key={key} className={cn("bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden", className)} style={style}>
    {children}
  </div>
);
