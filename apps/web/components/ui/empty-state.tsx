'use client';

import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: 'default' | 'compact';
}

const defaultIcons = {
  episodes: (
    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  search: (
    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  error: (
    <svg className="w-16 h-16 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  folder: (
    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = 'default',
}: EmptyStateProps) {
  const isCompact = variant === 'compact';

  return (
    <div
      className={`
        flex flex-col items-center justify-center text-center
        ${isCompact ? 'py-8 px-4' : 'py-16 px-6'}
      `}
    >
      {icon && (
        <div className={`${isCompact ? 'mb-3' : 'mb-4'} opacity-80`}>
          {icon}
        </div>
      )}
      <h3
        className={`
          font-semibold text-gray-900 dark:text-white
          ${isCompact ? 'text-base' : 'text-lg'}
        `}
      >
        {title}
      </h3>
      {description && (
        <p
          className={`
            text-gray-500 dark:text-gray-400 max-w-sm
            ${isCompact ? 'mt-1 text-sm' : 'mt-2 text-base'}
          `}
        >
          {description}
        </p>
      )}
      {action && <div className={isCompact ? 'mt-4' : 'mt-6'}>{action}</div>}
    </div>
  );
}

// Preset empty states for common use cases
export function NoEpisodes({ action }: { action?: ReactNode }) {
  return (
    <EmptyState
      icon={defaultIcons.episodes}
      title="No episodes yet"
      description="Get started by creating your first AI-generated historical podcast episode."
      action={action}
    />
  );
}

export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={defaultIcons.search}
      title="No results found"
      description={`We couldn't find any matches for "${query}". Try adjusting your search or filters.`}
    />
  );
}

export function ErrorState({ message, action }: { message?: string; action?: ReactNode }) {
  return (
    <EmptyState
      icon={defaultIcons.error}
      title="Something went wrong"
      description={message || "We encountered an error while loading this content. Please try again."}
      action={action}
    />
  );
}

export function NoData({ title, description }: { title?: string; description?: string }) {
  return (
    <EmptyState
      icon={defaultIcons.folder}
      title={title || "No data available"}
      description={description}
    />
  );
}
