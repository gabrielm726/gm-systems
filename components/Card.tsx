import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, title }) => (
    <div className={clsx('bg-white rounded-lg shadow-sm border border-slate-200', className)}>
        {title && (
            <div className="px-4 py-3 border-b border-slate-100 font-bold text-slate-700 text-sm uppercase tracking-wider">
                {title}
            </div>
        )}
        {children}
    </div>
);
