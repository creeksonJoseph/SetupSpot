import React, { useState } from "react";
import { useAccount } from "../hooks/useAccount";
import { UserProfileHeader } from "../components/account/UserProfileHeader";
import { UserSetupsGrid } from "../components/account/UserSetupsGrid";
import { PasswordChangeCard } from "../components/account/PasswordChangeCard";

const AccountPage = () => {
  const [showSettings, setShowSettings] = useState(false);
  const {
    user,
    loading,
    pwdStep,
    setPwdStep,
    pwdForm,
    setPwdForm,
    showPwd,
    setShowPwd,
    pwdLoading,
    pwdError,
    setPwdError,
    pwdSuccess,
    pwdCountdown,
    handleRequestChangeOtp,
    handleResendChangeOtp,
    handleChangePassword,
    deleteSetup,
    handleLogout,
  } = useAccount();

  if (loading) {
    return (
      <main className="flex-1 flex justify-center items-center min-h-[500px]">
        <div className="flex items-center gap-3 text-slate-500">
          <svg
            className="animate-spin h-6 w-6 text-violet-600"
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
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
          <span className="text-sm font-semibold">Loading profile...</span>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex-1 flex justify-center items-center min-h-[500px]">
        <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 max-w-md">
          <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">person_off</span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">User profile not found</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please sign in again to view your profile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Profile Header */}
        <UserProfileHeader
          user={user}
          handleLogout={handleLogout}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
        />

        {/* Settings / Password Change Drawer Section */}
        {showSettings && (
          <div className="mb-12 transition-all duration-300">
            <PasswordChangeCard
              user={user}
              pwdStep={pwdStep}
              setPwdStep={setPwdStep}
              pwdForm={pwdForm}
              setPwdForm={setPwdForm}
              showPwd={showPwd}
              setShowPwd={setShowPwd}
              pwdLoading={pwdLoading}
              pwdError={pwdError}
              setPwdError={setPwdError}
              pwdSuccess={pwdSuccess}
              pwdCountdown={pwdCountdown}
              handleRequestChangeOtp={handleRequestChangeOtp}
              handleResendChangeOtp={handleResendChangeOtp}
              handleChangePassword={handleChangePassword}
            />
          </div>
        )}

        {/* Divider */}
        <div className="h-px w-full bg-slate-200 dark:bg-slate-800 mb-12" />

        {/* Your Posts Section */}
        <UserSetupsGrid setups={user.setups || []} deleteSetup={deleteSetup} />
      </div>
    </main>
  );

};

export default AccountPage;

