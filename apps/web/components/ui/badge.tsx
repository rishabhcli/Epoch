'use client';

import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  secondary: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-500',
  primary: 'bg-blue-500',
  secondary: 'bg-purple-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-cyan-500',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1 text-sm',
};

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
      {removable && (
        <button
          onClick={onRemove}
          className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Remove"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
}

// Episode type badges with preset colors
export function EpisodeTypeBadge({ type }: { type: 'NARRATIVE' | 'INTERVIEW' | 'DEBATE' | 'ADVENTURE' }) {
  const typeConfig: Record<string, { variant: BadgeVariant; label: string }> = {
    NARRATIVE: { variant: 'primary', label: 'Narrative' },
    INTERVIEW: { variant: 'secondary', label: 'Interview' },
    DEBATE: { variant: 'danger', label: 'Debate' },
    ADVENTURE: { variant: 'info', label: 'Adventure' },
  };

  const config = typeConfig[type] || { variant: 'default', label: type };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

// Status badges
export function StatusBadge({ status }: { status: 'DRAFT' | 'PROCESSING' | 'PUBLISHED' | 'FAILED' }) {
  const statusConfig: Record<string, { variant: BadgeVariant; label: string; dot: boolean }> = {
    DRAFT: { variant: 'default', label: 'Draft', dot: true },
    PROCESSING: { variant: 'warning', label: 'Processing', dot: true },
    PUBLISHED: { variant: 'success', label: 'Published', dot: true },
    FAILED: { variant: 'danger', label: 'Failed', dot: true },
  };

  const config = statusConfig[status] || { variant: 'default', label: status, dot: false };

  return <Badge variant={config.variant} dot={config.dot}>{config.label}</Badge>;
}
