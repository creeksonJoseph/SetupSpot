import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';
import { ProfileTab } from '../components/settings/ProfileTab';
import { SecurityTab } from '../components/settings/SecurityTab';
import { KeyRound, User, ArrowLeft } from 'lucide-react';

const SettingsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'security' ? 'security' : 'profile';
  const [activeTab, setActiveTab] = useState(initialTab);

  const settingsState = useSettings();
  const { loading } = settingsState;

  useEffect(() => {
    if (searchParams.get('tab') === 'security') {
      setActiveTab('security');
    }
  }, [searchParams]);

  if (loading) {
    return (
      <main className="flex-1 flex justify-center items-center min-h-[400px]">
        <div className="flex items-center gap-3" style={{ color: '#727687' }}>
          <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24" style={{ color: '#0066ff' }}>
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              fill="currentColor"
            />
          </svg>
          <span className="text-sm font-semibold">Loading settings...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 px-4 py-4 sm:px-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-4 px-1 flex flex-col gap-2">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold self-start transition-all hover:bg-slate-100 shadow-2xs"
            style={{ borderColor: '#E2E8F0', color: '#0F172A', backgroundColor: '#ffffff' }}
          >
            <ArrowLeft size={15} />
            <span>Back</span>
          </button>

          <div>
            <h1 className="text-3xl font-black leading-tight tracking-[-0.033em]" style={{ color: '#0F172A' }}>
              {activeTab === 'security' ? 'Password & Security' : 'Edit Account Details'}
            </h1>
            <p className="text-sm font-normal leading-normal mt-1" style={{ color: '#475569' }}>
              {activeTab === 'security'
                ? 'Manage your account password and security preferences.'
                : 'Update your public profile, bio, and account details.'}
            </p>
          </div>
        </div>

        {/* Tab Selector — Hidden on mobile so mobile displays strictly the selected section */}
        <div className="hidden sm:flex items-center gap-2 mb-5 border-b pb-2.5" style={{ borderColor: '#E2E8F0' }}>
          <button
            onClick={() => setActiveTab('profile')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === 'profile' ? 'rgba(0,102,255,0.08)' : 'transparent',
              color: activeTab === 'profile' ? '#0066ff' : '#727687',
            }}
          >
            <User size={16} />
            Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer"
            style={{
              backgroundColor: activeTab === 'security' ? 'rgba(0,102,255,0.08)' : 'transparent',
              color: activeTab === 'security' ? '#0066ff' : '#727687',
            }}
          >
            <KeyRound size={16} />
            Password & Security
          </button>
        </div>

        {/* Active Tab View */}
        {activeTab === 'profile' ? <ProfileTab {...settingsState} /> : <SecurityTab {...settingsState} />}
      </div>
    </main>
  );
};

export default SettingsPage;
