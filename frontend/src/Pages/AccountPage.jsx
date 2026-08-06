import React, { useState } from "react";
import { useAccount } from "../hooks/useAccount";
import { UserProfileHeader } from "../components/account/UserProfileHeader";
import { UserSetupsGrid } from "../components/account/UserSetupsGrid";
import { SetupGridSkeleton } from "../components/CardSkeleton";

const AccountPage = () => {
  const { user, loading, deleteSetup, handleLogout } = useAccount();

  if (loading) {
    return (
      <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
        <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
          <div className="flex items-center gap-6 p-6 bg-white rounded-3xl border border-slate-200 shadow-2xs">
            <div className="w-20 h-20 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="h-5 w-48 bg-slate-200 rounded-md" />
              <div className="h-3.5 w-32 bg-slate-100 rounded-md" />
            </div>
          </div>
          <div className="h-px w-full bg-slate-200" />
          <SetupGridSkeleton count={4} />
        </div>
      </main>
    );
  }


  if (!user) {
    return (
      <main className="flex-1 flex justify-center items-center min-h-[500px]">
        <div className="text-center p-8 bg-white rounded-2xl border border-[#E2E8F0] max-w-md">
          <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">person_off</span>
          <h2 className="text-lg font-bold text-slate-900">User profile not found</h2>
          <p className="text-sm text-slate-500 mt-1">Please sign in again to view your profile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Profile Header */}
        <UserProfileHeader user={user} handleLogout={handleLogout} />

        {/* Divider */}
        <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mb-4 sm:mb-8" />

        {/* Your Posts Section */}
        <UserSetupsGrid setups={user.setups || []} deleteSetup={deleteSetup} />
      </div>
    </main>
  );
};

export default AccountPage;


