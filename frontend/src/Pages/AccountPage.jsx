import React from "react";
import { useAccount } from "../hooks/useAccount";
import { UserProfileHeader } from "../components/account/UserProfileHeader";
import { UserSetupsGrid } from "../components/account/UserSetupsGrid";
import { SetupGridSkeleton, ProfileHeaderSkeleton } from "../components/CardSkeleton";

const AccountPage = () => {
  const { user, loading, error, deleteSetup, handleLogout } = useAccount();

  if (!loading && (error || !user)) {
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
        {/* Profile Header Section — loads independently */}
        {!user ? (
          <ProfileHeaderSkeleton />
        ) : (
          <UserProfileHeader user={user} handleLogout={handleLogout} />
        )}

        {/* Divider */}
        <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mb-4 sm:mb-8" />

        {/* Your Posts Grid Section — loads independently */}
        <UserSetupsGrid setups={user?.setups} loading={loading || !user?.setups} deleteSetup={deleteSetup} />
      </div>
    </main>
  );
};

export default AccountPage;


