import React from "react";

/**
 * Animated Skeleton Loader for Setup Cards grid
 */
export const SetupGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border bg-white overflow-hidden shadow-2xs space-y-3 p-3 animate-pulse"
          style={{ borderColor: "#E2E8F0" }}
        >
          {/* Image skeleton */}
          <div className="w-full h-56 bg-slate-200 rounded-2xl" />

          {/* Footer details skeleton */}
          <div className="flex items-center justify-between px-2 pt-1 pb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-200" />
              <div className="h-3.5 w-24 bg-slate-200 rounded-md" />
            </div>
            <div className="h-3.5 w-12 bg-slate-200 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Animated Skeleton Loader for Collection Cards grid
 */
export const CollectionGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border bg-white overflow-hidden shadow-2xs p-4 space-y-4 animate-pulse"
          style={{ borderColor: "#E2E8F0" }}
        >
          {/* 2x2 grid cover skeleton */}
          <div className="grid grid-cols-2 gap-2 h-44 bg-slate-100 p-2 rounded-2xl">
            <div className="bg-slate-200 rounded-xl" />
            <div className="bg-slate-200 rounded-xl" />
            <div className="bg-slate-200 rounded-xl" />
            <div className="bg-slate-200 rounded-xl" />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="h-4 w-32 bg-slate-200 rounded-md" />
            <div className="h-3.5 w-16 bg-slate-200 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};
