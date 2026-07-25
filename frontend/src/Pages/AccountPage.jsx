import React from "react";
import { useAccount } from "../hooks/useAccount";
import { UserProfileHeader } from "../components/account/UserProfileHeader";
import { UserSetupsGrid } from "../components/account/UserSetupsGrid";
import { PasswordChangeCard } from "../components/account/PasswordChangeCard";

const inputBase = "w-full rounded-lg px-3 py-2 text-sm font-light outline-none transition-all";
const inputStyle = { backgroundColor: "#ffffff", border: "1px solid #E2E8F0", color: "#0F172A" };
const onFocus = (e) => { e.target.style.borderColor = "#0050cb"; e.target.style.boxShadow = "0 0 0 2px rgba(0,80,203,0.1)"; };
const onBlur  = (e) => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; };

const AccountPage = () => {
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
      <main className="flex-1 flex justify-center items-center h-64">
        <div className="flex items-center gap-3" style={{ color: "#727687" }}>
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" style={{ color: "#0066ff" }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
          <span className="text-sm font-medium">Loading...</span>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex-1 flex justify-center items-center h-64">
        <p className="text-sm" style={{ color: "#727687" }}>
          User not found.
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 md:px-8 font-sans">
      <div className="mx-auto max-w-4xl">
        {/* Profile Header */}
        <UserProfileHeader user={user} handleLogout={handleLogout} />

        {/* Your Posts Grid */}
        <UserSetupsGrid setups={user.setups} deleteSetup={deleteSetup} />

        {/* Change Password Card */}
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
          inputBase={inputBase}
          inputStyle={inputStyle}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      </div>
    </main>
  );
};

export default AccountPage;
