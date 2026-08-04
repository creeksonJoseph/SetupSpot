import React, { useState, useEffect } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Settings, UserCheck, ShieldCheck, MessageSquarePlus, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import LandingHeader from './landing/LandingHeader'
import { SuggestFeatureModal } from './feedback/SuggestFeatureModal'

export default function Layout() {
    const location = useLocation()
    const navigate = useNavigate()
    const { auth, logout } = useAuth()
    const isLoggedIn = Boolean(auth?.token || auth?.user)
    const username = auth?.username || auth?.user?.username || auth?.user?.email?.split('@')[0]
    const email = auth?.email || auth?.user?.email
    const avatarUrl = auth?.user?.avatar_url || auth?.avatar_url || auth?.user?.avatar || auth?.user?.profile_picture || auth?.user?.picture

    const initialLetter = username ? username[0].toUpperCase() : 'U'

    const [isScrolled, setIsScrolled] = useState(false)
    const [accountMenuOpen, setAccountMenuOpen] = useState(false)
    const [showSuggestModal, setShowSuggestModal] = useState(false)

    const isAccountPage = location.pathname.startsWith('/account')

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll()
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const getActiveTab = () => {
        const path = location.pathname
        if (path.startsWith('/admin')) return 'admin'
        if (path.startsWith('/search')) return 'search'
        if (path.startsWith('/favorites')) return 'favorites'
        if (path.startsWith('/collections')) return 'collections'
        if (path.startsWith('/create')) return 'create'
        if (path.startsWith('/account')) return 'account'
        if (path.startsWith('/settings')) return 'account'
        if (path.startsWith('/explore')) return 'explore'
        return ''
    }

    const activeTab = getActiveTab()

    // Desktop & Mobile Nav Items (2nd icon is Search leading to /search)
    const navItems = [
        { key: 'explore', icon: 'grid_view', title: 'Explore', path: '/explore' },
        { key: 'search', icon: 'search', title: 'Search', path: '/search' },
        { key: 'favorites', icon: 'favorite', title: 'Favorites', path: '/favorites' },
        { key: 'collections', icon: 'bookmarks', title: 'Collections', path: '/collections' },
        { key: 'create', icon: 'add_circle', title: 'Create', path: '/create' },
    ]

    const isAdmin = Boolean(
        auth?.is_admin ||
        auth?.user?.is_admin ||
        (auth?.email && auth.email.toLowerCase() === "charanajoseph@gmail.com") ||
        (auth?.user?.email && auth.user.email.toLowerCase() === "charanajoseph@gmail.com")
    )

    // GUEST LAYOUT: Top landing header for guests (since guests don't have a sidebar)
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex flex-col font-sans bg-[#f7f9fb]" style={{ fontFamily: "Inter, sans-serif" }}>
                <LandingHeader isScrolled={isScrolled} isLoggedIn={false} />
                <div className="h-16 w-full shrink-0" aria-hidden="true" />
                <main className="w-full flex-1">
                    <Outlet />
                </main>
            </div>
        )
    }

    // AUTHENTICATED APP LAYOUT:
    // Mobile (< md): Top Header with Avatar / Hamburger on Profile + Bottom Navigation Bar
    // Desktop (>= md): Full-height Sidebar with Logo at top & Avatar at bottom (No Top Header)
    return (
        <div className="min-h-screen flex flex-col font-sans bg-[#f7f9fb]" style={{ fontFamily: "Inter, sans-serif" }}>
            <SuggestFeatureModal
                isOpen={showSuggestModal}
                onClose={() => setShowSuggestModal(false)}
            />

            {/* Mobile Top Navigation Header (< md ONLY) */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] z-40 flex justify-between items-center px-4 shadow-xs">
                {/* Brand Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <img
                        src="/Logo.png"
                        alt="SetupSpot Logo"
                        className="w-8 h-8 rounded-xl object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    <span className="text-xl font-bold text-[#0F172A] tracking-tight font-sans">
                        SetupSpot
                    </span>
                </Link>

                {/* Top Right: Hamburger Menu on Profile Page vs Avatar Icon on other pages */}
                <div className="flex items-center gap-3">
                    {isAccountPage ? (
                        <button
                            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                            className="p-2 text-[#0F172A] hover:text-[#0066ff] rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
                            aria-label="Account Settings Menu"
                        >
                            {accountMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    ) : (
                        <Link
                            to="/account"
                            className="flex items-center gap-2 group p-0.5 rounded-full hover:ring-2 hover:ring-[#0066ff]/20 transition-all"
                            title={username || "Account"}
                        >
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={username || "User Avatar"}
                                    className="w-9 h-9 rounded-full object-cover border-2 border-[#0066ff] shadow-xs transition-transform duration-200 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-[#0066ff] text-white flex items-center justify-center font-bold text-sm shadow-xs transition-transform duration-200 group-hover:scale-105">
                                    {initialLetter}
                                </div>
                            )}
                        </Link>
                    )}
                </div>
            </header>

            {/* Account Page Hamburger Menu Overlay for Mobile */}
            {isAccountPage && accountMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
                        onClick={() => setAccountMenuOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="fixed top-16 right-4 z-50 w-64 bg-white rounded-2xl p-3 shadow-2xl border border-[#E2E8F0] md:hidden animate-fade-in-up">
                        <div className="flex flex-col gap-1.5">
                            <button
                                onClick={() => {
                                    setAccountMenuOpen(false)
                                    navigate('/settings?tab=profile')
                                }}
                                className="flex items-center gap-2.5 text-xs font-semibold text-[#0F172A] hover:text-[#0066ff] py-2.5 px-3 rounded-xl hover:bg-[#f7f9fb] transition-colors w-full text-left cursor-pointer"
                            >
                                <UserCheck size={16} />
                                <span>Edit Account Details</span>
                            </button>

                            <button
                                onClick={() => {
                                    setAccountMenuOpen(false)
                                    navigate('/settings?tab=security')
                                }}
                                className="flex items-center gap-2.5 text-xs font-semibold text-[#0F172A] hover:text-[#0066ff] py-2.5 px-3 rounded-xl hover:bg-[#f7f9fb] transition-colors w-full text-left cursor-pointer"
                            >
                                <ShieldCheck size={16} />
                                <span>Password & Security</span>
                            </button>

                            <button
                                onClick={() => {
                                    setAccountMenuOpen(false)
                                    setShowSuggestModal(true)
                                }}
                                className="flex items-center gap-2.5 text-xs font-semibold text-[#0066ff] py-2.5 px-3 rounded-xl hover:bg-[#0066ff]/10 transition-colors w-full text-left cursor-pointer"
                            >
                                <MessageSquarePlus size={16} />
                                <span>Suggest Feature / Report Problem</span>
                            </button>

                            <div className="h-px w-full bg-[#E2E8F0] my-1" />

                            <button
                                onClick={() => {
                                    setAccountMenuOpen(false)
                                    logout()
                                }}
                                className="flex items-center gap-2.5 text-xs font-bold text-red-600 hover:text-red-700 py-2.5 px-3 rounded-xl hover:bg-red-50 transition-colors w-full text-left cursor-pointer"
                            >
                                <LogOut size={16} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Desktop Left Sidebar (>= md ONLY) — Full Height Top to Bottom */}
            <nav className="hidden md:flex w-20 fixed left-0 top-0 bottom-0 flex-col items-center py-6 z-30 border-r bg-white border-[#E2E8F0] justify-between">
                {/* Top: Logo */}
                <div className="mb-4">
                    <Link to="/">
                        <img
                            src="/Logo.png"
                            alt="SetupSpot"
                            className="w-10 h-10 rounded-xl object-contain transition-transform duration-200 hover:scale-105"
                        />
                    </Link>
                </div>

                {/* Middle: Navigation Links */}
                <div className="flex flex-col gap-6 flex-1 items-center justify-center">
                    {navItems.map(({ key, icon, title, path }) => (
                        <div key={key} className="relative group flex items-center">
                            <Link
                                to={path}
                                className="p-3 rounded-xl transition-all duration-200 ease-out transform group-hover:scale-105 cursor-pointer"
                                style={{
                                    backgroundColor: activeTab === key ? "rgba(0,102,255,0.08)" : "transparent",
                                    color: activeTab === key ? "#0066ff" : "#727687",
                                }}
                            >
                                <span
                                    className="material-symbols-outlined text-2xl block"
                                    style={{ fontVariationSettings: activeTab === key ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                    {icon}
                                </span>
                            </Link>

                            <div className="absolute left-full ml-3 px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-lg border border-slate-200 whitespace-nowrap opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out z-50">
                                {title}
                            </div>
                        </div>
                    ))}

                    {/* Admin Portal Link */}
                    {isAdmin && (
                        <div className="relative group flex items-center">
                            <Link
                                to="/admin"
                                className="p-3 rounded-xl transition-all duration-200 ease-out transform group-hover:scale-105 cursor-pointer"
                                style={{
                                    backgroundColor: activeTab === 'admin' ? "rgba(0,102,255,0.08)" : "transparent",
                                    color: activeTab === 'admin' ? "#0066ff" : "#727687",
                                }}
                            >
                                <span
                                    className="material-symbols-outlined text-2xl block"
                                    style={{ fontVariationSettings: activeTab === 'admin' ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                    shield_person
                                </span>
                            </Link>
                            <div className="absolute left-full ml-3 px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-lg border border-slate-200 whitespace-nowrap opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out z-50">
                                Admin Portal
                            </div>
                        </div>
                    )}
                </div>

                {/* Bottom: User Avatar for Desktop */}
                <div className="mt-auto pt-4 relative group flex items-center">
                    <Link
                        to="/account"
                        className="p-1 rounded-full hover:ring-2 hover:ring-[#0066ff]/20 transition-all"
                        title={username || "Account"}
                    >
                        {avatarUrl ? (
                            <img
                                src={avatarUrl}
                                alt={username || "User Avatar"}
                                className="w-9 h-9 rounded-full object-cover border-2 border-[#0066ff] shadow-xs transition-transform duration-200 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-9 h-9 rounded-full bg-[#0066ff] text-white flex items-center justify-center font-bold text-sm shadow-xs transition-transform duration-200 group-hover:scale-105">
                                {initialLetter}
                            </div>
                        )}
                    </Link>
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-lg border border-slate-200 whitespace-nowrap opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out z-50">
                        {username || "Account"}
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom Navigation Bar (< md ONLY) */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#E2E8F0] z-40 flex items-center justify-around px-2 shadow-lg">
                {navItems.map(({ key, icon, title, path }) => {
                    const isActive = activeTab === key;
                    return (
                        <Link
                            key={key}
                            to={path}
                            className="flex flex-col items-center justify-center flex-1 py-1 transition-colors"
                            style={{
                                color: isActive ? "#0066ff" : "#727687",
                            }}
                        >
                            <span
                                className="material-symbols-outlined text-2xl transition-transform duration-200"
                                style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                {icon}
                            </span>
                            <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? "text-[#0066ff] font-bold" : "text-[#727687]"}`}>
                                {title}
                            </span>
                        </Link>
                    );
                })}

                {/* Admin Tab for Mobile */}
                {isAdmin && (
                    <Link
                        to="/admin"
                        className="flex flex-col items-center justify-center flex-1 py-1 transition-colors"
                        style={{
                            color: activeTab === 'admin' ? "#0066ff" : "#727687",
                        }}
                    >
                        <span
                            className="material-symbols-outlined text-2xl"
                            style={{ fontVariationSettings: activeTab === 'admin' ? "'FILL' 1" : "'FILL' 0" }}
                        >
                            shield_person
                        </span>
                        <span className={`text-[10px] font-semibold mt-0.5 ${activeTab === 'admin' ? "text-[#0066ff] font-bold" : "text-[#727687]"}`}>
                            Admin
                        </span>
                    </Link>
                )}
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 pt-16 md:pt-6 pb-20 md:pb-8 md:ml-20 p-4 md:p-8">
                <Outlet />
            </main>
        </div>
    )
}