import React from "react";

/**
 * 1:1 Match Animated Skeleton Loader for Setup Cards Masonry Grid
 */
export const SetupGridSkeleton = ({ count = 10 }) => {
  const aspectRatios = [
    'aspect-[4/5]', 'aspect-[4/3]', 'aspect-[1/1]', 'aspect-[4/5]', 'aspect-[3/4]',
    'aspect-[4/3]', 'aspect-[4/5]', 'aspect-[1/1]', 'aspect-[3/4]', 'aspect-[4/5]'
  ];

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="break-inside-avoid mb-4 animate-pulse">
          <div
            className={`w-full rounded-2xl bg-slate-200 border border-slate-200/60 ${aspectRatios[i % aspectRatios.length]}`}
          />
          {/* Mobile caption text skeleton */}
          <div className="sm:hidden mt-1.5 space-y-1 px-0.5">
            <div className="h-3 w-3/4 bg-slate-200 rounded-md" />
            <div className="h-2.5 w-1/2 bg-slate-100 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * 1:1 Match Animated Skeleton Loader for Collection Cards grid
 */
export const CollectionGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border bg-white overflow-hidden shadow-2xs aspect-[4/3] relative p-3 flex flex-col justify-between animate-pulse"
          style={{ borderColor: "#E2E8F0" }}
        >
          {/* 4-Quadrant Setup Photo Collage Cover Skeleton */}
          <div className="grid grid-cols-2 gap-1 h-full w-full rounded-xl overflow-hidden bg-slate-100 p-1">
            <div className="bg-slate-200 rounded-lg" />
            <div className="bg-slate-200 rounded-lg" />
            <div className="bg-slate-200 rounded-lg" />
            <div className="bg-slate-200 rounded-lg" />
          </div>
          {/* Title & item count overlay skeleton */}
          <div className="space-y-1.5 pt-2 px-1">
            <div className="h-4 w-36 bg-slate-200 rounded-md" />
            <div className="h-3 w-20 bg-slate-100 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * 1:1 Match Animated Skeleton Loader for Admin Dashboard Overview
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
        <div className="p-6 border bg-white space-y-4 rounded-2xl" style={{ borderColor: "#E2E8F0" }}>
          <div className="h-5 w-48 bg-slate-200 rounded-md" />
          <div className="space-y-3 pt-2">
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
            <div className="h-10 w-full bg-slate-100 rounded-xl" />
          </div>
        </div>
        <div className="p-6 border bg-white space-y-4 rounded-2xl" style={{ borderColor: "#E2E8F0" }}>
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
 * 1:1 Match Animated Skeleton Loader for Post Detail Page
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
        <div className="lg:col-span-2 aspect-[4/3] bg-slate-200 rounded-2xl" />
        <div className="space-y-4 p-6 bg-white border border-slate-200 rounded-2xl">
          <div className="h-6 w-3/4 bg-slate-200 rounded-md" />
          <div className="h-4 w-1/2 bg-slate-100 rounded-md" />
          <div className="h-px w-full bg-slate-200 my-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 w-full bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
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
 * 1:1 Match Animated Skeleton Loader for User Profile Header (Avatar, Username, Bio, Stats)
 */
export const ProfileHeaderSkeleton = () => {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-8 animate-pulse">
      <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full bg-slate-200 shrink-0" />
      <div className="flex-1 space-y-3 w-full text-center sm:text-left">
        <div className="h-7 w-44 bg-slate-200 rounded-md mx-auto sm:mx-0" />
        <div className="h-4 w-32 bg-slate-100 rounded-md mx-auto sm:mx-0" />
        <div className="h-3.5 w-full max-w-md bg-slate-100 rounded-md mx-auto sm:mx-0" />
        <div className="flex items-center justify-center sm:justify-start gap-6 pt-4 border-t border-slate-100">
          <div className="h-6 w-16 bg-slate-200 rounded-md" />
          <div className="h-6 w-24 bg-slate-200 rounded-md" />
          <div className="h-6 w-20 bg-slate-200 rounded-md" />
        </div>
      </div>
    </div>
  );
};

/**
 * 1:1 Match Animated Skeleton Loader for Public Profile Page
 */
export const UserProfileSkeleton = () => {
  return (
    <main className="px-4 py-8 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* Top bar skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 w-20 bg-slate-200 rounded-xl" />
        <div className="h-8 w-20 bg-slate-200 rounded-xl" />
      </div>
      {/* Profile Header skeleton */}
      <div className="flex flex-col sm:flex-row items-start gap-8 mb-8">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-3 w-full">
          <div className="h-7 w-44 bg-slate-200 rounded-md" />
          <div className="h-4 w-28 bg-slate-100 rounded-md" />
          <div className="h-3.5 w-full max-w-md bg-slate-100 rounded-md" />
          <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
            <div className="h-6 w-16 bg-slate-200 rounded-md" />
            <div className="h-6 w-24 bg-slate-200 rounded-md" />
            <div className="h-6 w-20 bg-slate-200 rounded-md" />
          </div>
        </div>
      </div>
      {/* Tabs skeleton */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <div className="h-8 w-24 bg-slate-200 rounded-xl" />
        <div className="h-8 w-28 bg-slate-100 rounded-xl" />
      </div>
      <SetupGridSkeleton count={8} />
    </main>
  );
};

/**
 * 1:1 Match Animated Skeleton Loader for Comments Section
 */
export const CommentsSkeleton = ({ count = 3 }) => {
  return (
    <div className="px-4 py-4 space-y-4 animate-pulse">
      {/* Comment composer skeleton */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 h-9 bg-slate-100 rounded-xl border border-slate-200" />
      </div>
      {/* Comment rows skeleton */}
      <div className="space-y-4 pt-1">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-200 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 bg-slate-200 rounded-md" />
              <div className="h-3 w-full bg-slate-100 rounded-md" />
              <div className="h-3 w-3/4 bg-slate-100 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 1:1 Match Animated Skeleton Loader for Similar Setups panel
 */
export const SimilarSetupsSkeleton = ({ count = 6 }) => {
  return (
    <div className="flex flex-col animate-pulse h-full">
      <div className="h-4 w-36 bg-slate-200 rounded-md mb-3 shrink-0" />
      <div
        className="rounded-xl border p-2.5 flex-1"
        style={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0' }}
      >
        <div className="columns-2 gap-2 space-y-2">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="break-inside-avoid mb-2">
              <div
                className="w-full rounded-lg bg-slate-200"
                style={{ aspectRatio: i % 3 === 0 ? '4/5' : '4/4' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * 1:1 Match Animated Skeleton Loader for Setup Image Canvas & Hero Author Bar
 */
export const SetupHeroSkeleton = () => {
  return (
    <div className="flex flex-col rounded-xl border bg-white overflow-hidden animate-pulse shadow-2xs" style={{ borderColor: "#E2E8F0" }}>
      {/* Hero Image Canvas Skeleton with pin placeholders */}
      <div className="relative aspect-[4/5] lg:aspect-[4/3] max-h-[68vh] w-full bg-slate-200 flex items-center justify-center">
        {/* Hotspot pin placeholders */}
        <div className="absolute top-[35%] left-[40%] w-6 h-6 rounded-full bg-white/60 border-2 border-white shadow-sm flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        </div>
        <div className="absolute bottom-[30%] right-[35%] w-6 h-6 rounded-full bg-white/60 border-2 border-white shadow-sm flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
        </div>
      </div>
      {/* PostSocialBar Skeleton */}
      <div className="flex items-center justify-between px-4 py-3 border-t bg-white" style={{ borderColor: "#E2E8F0" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0" />
          <div className="h-4 w-28 bg-slate-200 rounded-md" />
        </div>
        <div className="flex items-center gap-1">
          <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
          <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
          <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
        </div>
      </div>
    </div>
  );
};

/**
 * 1:1 Match Animated Skeleton Loader for Items Breakdown List
 */
export const ItemsListSkeleton = ({ count = 5 }) => {
  return (
    <div className="flex flex-col h-full animate-pulse">
      <div className="h-4 w-36 bg-slate-200 rounded-md mb-3 shrink-0" />
      <div className="rounded-xl border bg-white divide-y overflow-hidden flex-1 shadow-2xs" style={{ borderColor: "#E2E8F0" }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-3 gap-2.5">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-5 h-5 rounded-full bg-slate-200 shrink-0" />
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="h-3.5 w-3/4 bg-slate-200 rounded-md" />
                <div className="h-3 w-12 bg-blue-100/80 rounded-md" />
              </div>
            </div>
            <div className="w-7 h-7 bg-slate-100 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * 1:1 Match Animated Skeleton Loader for Settings Page
 */
export const SettingsSkeleton = () => {
  return (
    <main className="flex-1 px-4 py-4 sm:px-6 md:px-8 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-6 w-48 bg-slate-200 rounded-md" />
        <div className="h-4 w-72 bg-slate-100 rounded-md" />
      </div>
      <div className="h-10 w-64 bg-slate-200 rounded-xl" />
      <div className="p-6 border bg-white rounded-2xl space-y-4" style={{ borderColor: "#E2E8F0" }}>
        <div className="h-4 w-32 bg-slate-200 rounded-md" />
        <div className="h-10 w-full bg-slate-100 rounded-xl" />
        <div className="h-4 w-32 bg-slate-200 rounded-md pt-2" />
        <div className="h-20 w-full bg-slate-100 rounded-xl" />
      </div>
    </main>
  );
};
