'use client';

import { ReactNode, forwardRef, HTMLAttributes } from 'react';
import Link from 'next/link';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  href?: string;
}

const variantStyles = {
  default: 'bg-white dark:bg-gray-800 shadow',
  outlined: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 shadow-lg',
  interactive: `
    bg-white dark:bg-gray-800 shadow
    hover:shadow-lg hover:-translate-y-1
    transition-all duration-200 cursor-pointer
  `,
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      href,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `rounded-xl ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`;

    if (href) {
      return (
        <Link href={href} className={`block ${baseStyles}`}>
          {children}
        </Link>
      );
    }

    return (
      <div ref={ref} className={baseStyles} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card subcomponents
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function CardHeader({ children, className = '', action }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div>{children}</div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function CardFooter({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`flex items-center gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
}

// Gradient card for featured content
interface GradientCardProps extends CardProps {
  gradient?: 'blue' | 'purple' | 'orange' | 'green' | 'indigo';
}

const gradientStyles = {
  blue: 'from-blue-500 to-blue-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-red-500',
  green: 'from-green-500 to-emerald-600',
  indigo: 'from-indigo-500 to-purple-600',
};

export function GradientCard({
  gradient = 'blue',
  children,
  className = '',
  ...props
}: GradientCardProps) {
  return (
    <Card
      className={`bg-gradient-to-br ${gradientStyles[gradient]} text-white ${className}`}
      {...props}
    >
      {children}
    </Card>
  );
}
