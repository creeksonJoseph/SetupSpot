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

/**
 * Animated Skeleton Loader for Admin Dashboard Overview
 */
export const AdminDashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-pulse">
      {/* 5 Summary metric cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border bg-white space-y-3"
            style={{ borderColor: "#E2E8F0" }}
          >
            <div className="h-3.5 w-20 bg-slate-200 rounded-md" />
            <div className="h-7 w-14 bg-slate-200 rounded-md" />
            <div className="h-3 w-24 bg-slate-100 rounded-md" />
          </div>
        ))}
      </div>

      {/* 2 large overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl border bg-white space-y-4" style={{ borderColor: "#E2E8F0" }}>
          <div className="h-5 w-48 bg-slate-200 rounded-md" />
          <div className="space-y-3 pt-2">
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
          </div>
        </div>
        <div className="p-6 rounded-3xl border bg-white space-y-4" style={{ borderColor: "#E2E8F0" }}>
          <div className="h-5 w-48 bg-slate-200 rounded-md" />
          <div className="space-y-3 pt-2">
            <div className="h-16 w-full bg-slate-100 rounded-xl" />
            <div className="h-16 w-full bg-slate-100 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Animated Skeleton Loader for Post Detail Page
 */
export const PostDetailSkeleton = () => {
  return (
    <div className="px-4 py-8 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Top author bar skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-slate-200 rounded-md" />
            <div className="h-3 w-20 bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="h-9 w-24 bg-slate-200 rounded-full" />
      </div>

      {/* Main Image + Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 h-[500px] bg-slate-200 rounded-3xl" />
        <div className="space-y-4 p-6 bg-white border border-slate-200 rounded-3xl">
          <div className="h-6 w-3/4 bg-slate-200 rounded-md" />
          <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
          <div className="h-px w-full bg-slate-200 my-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 w-full bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center justify-between">
                <div className="h-4 w-36 bg-slate-200 rounded-md" />
                <div className="h-4 w-12 bg-slate-200 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Animated Skeleton Loader for Public Profile Page
 */
export const UserProfileSkeleton = () => {
  return (
    <main className="px-4 py-8 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs">
        <div className="w-20 h-20 rounded-full bg-slate-200 shrink-0" />
        <div className="space-y-3 flex-1">
          <div className="h-5 w-48 bg-slate-200 rounded-md" />
          <div className="h-3.5 w-32 bg-slate-100 rounded-md" />
        </div>
      </div>
      <div className="h-px w-full bg-slate-200" />
      <SetupGridSkeleton count={6} />
    </main>
  );
};
