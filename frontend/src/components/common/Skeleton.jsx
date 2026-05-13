import React from 'react';

const Skeleton = ({ className = '', variant = 'rect', width, height }) => {
  const baseStyles = 'animate-pulse bg-dark-700/50';
  const variantStyles = {
    rect: 'rounded-md',
    circle: 'rounded-full',
    text: 'rounded h-3 w-full'
  };

  const style = {
    width: width || undefined,
    height: height || undefined,
  };

  return (
    <div 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`} 
      style={style}
    />
  );
};

export const SidebarSkeleton = () => {
  return (
    <div className="space-y-4 p-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton variant="rect" width="16px" height="16px" />
            <Skeleton variant="text" width="60%" />
          </div>
          <div className="ml-6 space-y-2">
            {[1, 2].map((j) => (
              <div key={j} className="flex items-center gap-2">
                <Skeleton variant="rect" width="12px" height="12px" className="opacity-50" />
                <Skeleton variant="text" width="40%" className="opacity-50" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const RequestBuilderSkeleton = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-2">
        <Skeleton variant="rect" width="100px" height="40px" />
        <Skeleton variant="rect" className="flex-1" height="40px" />
        <Skeleton variant="rect" width="80px" height="40px" />
      </div>
      <div className="flex gap-4 border-b border-dark-800 pb-2">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} variant="rect" width="60px" height="20px" />
        ))}
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-2">
            <Skeleton variant="rect" className="flex-1" height="32px" />
            <Skeleton variant="rect" className="flex-1" height="32px" />
          </div>
        ))}
      </div>
    </div>
  );
};

export const ResponseSkeleton = () => {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Skeleton variant="rect" width="60px" height="24px" />
          <Skeleton variant="rect" width="80px" height="24px" />
        </div>
        <Skeleton variant="rect" width="100px" height="24px" />
      </div>
      <Skeleton variant="rect" className="w-full" height="200px" />
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full space-y-4">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border-b border-dark-800">
          {[...Array(cols)].map((_, j) => (
            <Skeleton key={j} variant="rect" className="flex-1" height="24px" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const TabBarSkeleton = () => {
  return (
    <div className="flex gap-1 p-2 bg-dark-900 border-b border-dark-800">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} variant="rect" width="120px" height="32px" className="rounded-t-lg" />
      ))}
    </div>
  );
};

export default Skeleton;
