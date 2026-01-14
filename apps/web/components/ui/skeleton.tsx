'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200 dark:bg-gray-700';

  const variantStyles = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseStyles} ${variantStyles.text} ${className}`}
            style={{
              ...style,
              width: i === lines - 1 ? '75%' : style.width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
      <Skeleton variant="rectangular" height={200} className="w-full" />
      <Skeleton variant="text" className="w-3/4" />
      <Skeleton variant="text" lines={2} className="w-full" />
      <div className="flex gap-2">
        <Skeleton variant="rectangular" width={80} height={24} />
        <Skeleton variant="rectangular" width={60} height={24} />
      </div>
    </div>
  );
}

export function SkeletonEpisodeCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-4 space-y-3">
      <div className="flex items-start gap-4">
        <Skeleton variant="rectangular" width={80} height={80} className="rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" height={20} />
          <Skeleton variant="text" lines={2} className="w-full" />
          <div className="flex gap-2 pt-1">
            <Skeleton variant="rectangular" width={60} height={20} className="rounded-full" />
            <Skeleton variant="rectangular" width={80} height={20} className="rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonAudioPlayer() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-1/2" height={18} />
          <Skeleton variant="text" className="w-1/3" height={14} />
        </div>
      </div>
      <Skeleton variant="rectangular" height={8} className="w-full rounded-full" />
      <div className="flex justify-center gap-4">
        <Skeleton variant="circular" width={40} height={40} />
        <Skeleton variant="circular" width={56} height={56} />
        <Skeleton variant="circular" width={40} height={40} />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonEpisodeCard key={i} />
      ))}
    </div>
  );
}
