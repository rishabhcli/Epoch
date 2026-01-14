'use client';

import { forwardRef, ButtonHTMLAttributes, ElementType, ComponentPropsWithoutRef } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

// Polymorphic button props for rendering as different elements
type ButtonOwnProps<E extends ElementType = 'button'> = {
  as?: E;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  /** For links - makes button full width */
  fullWidth?: boolean;
};

type ButtonProps<E extends ElementType = 'button'> = ButtonOwnProps<E> &
  Omit<ComponentPropsWithoutRef<E>, keyof ButtonOwnProps<E>>;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600',
  secondary:
    'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
  outline:
    'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800',
  ghost:
    'text-gray-700 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

// Using a more flexible approach for polymorphic components
export function Button<E extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps<E>) {
  const Component = as || 'button';
  const isDisabled = disabled || isLoading;

  return (
    <Component
      disabled={Component === 'button' ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      aria-busy={isLoading || undefined}
      className={`
        inline-flex items-center justify-center gap-2
        font-medium rounded-lg
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:pointer-events-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {isLoading ? <LoadingSpinner /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </Component>
  );
}

// Icon-only button variant for accessibility
export function IconButton({
  'aria-label': ariaLabel,
  children,
  className = '',
  ...props
}: ButtonProps<'button'> & { 'aria-label': string }) {
  return (
    <Button
      className={`!p-2 ${className}`}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </Button>
  );
}
