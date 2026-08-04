import React, { useState, useEffect } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LandingHeader from './landing/LandingHeader'

export default function Layout() {
    const location = useLocation()
    const { auth } = useAuth()
    const isLoggedIn = Boolean(auth?.token || auth?.user)
    const username = auth?.username || auth?.user?.username

    const [isScrolled, setIsScrolled] = useState(false)

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
        if (path.startsWith('/favorites')) return 'favorites'
        if (path.startsWith('/collections')) return 'collections'
        if (path.startsWith('/create')) return 'create'
        if (path.startsWith('/account')) return 'account'
        if (path.startsWith('/settings')) return 'account'
        if (path.startsWith('/explore')) return 'explore'
        return ''
    }

    const activeTab = getActiveTab()

    const navItems = [
        { key: 'explore', icon: 'grid_view', title: 'Explore', path: '/explore' },
        { key: 'favorites', icon: 'favorite', title: 'Favorites', path: '/favorites' },
        { key: 'collections', icon: 'bookmarks', title: 'Collections', path: '/collections' },
        { key: 'create', icon: 'add', title: 'Create', path: '/create' },
    ]

    // GUEST LAYOUT: No sidebar, top header navbar with active explore tab rules
    if (!isLoggedIn) {
        return (
            <div className="min-h-screen flex flex-col font-sans bg-[#f7f9fb]" style={{ fontFamily: "Inter, sans-serif" }}>
                <LandingHeader isScrolled={isScrolled} isLoggedIn={false} />
                {/* Spacer below fixed header to prevent masking page content */}
                <div className="h-16 w-full shrink-0" aria-hidden="true" />
                <main className="w-full flex-1">
                    <Outlet />
                </main>
            </div>
        )
    }

    // AUTHENTICATED APP LAYOUT: Left sidebar for logged in users
    return (
        <div className="flex min-h-screen font-sans" style={{ backgroundColor: "#f7f9fb", fontFamily: "Inter, sans-serif" }}>
            {/* Navigation Sidebar */}
            <nav className="w-20 fixed left-0 top-0 bottom-0 flex flex-col items-center py-8 z-30 border-r" style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}>
                {/* Logo — Links to Landing Page */}
                <div className="mb-12">
                    <Link to="/">
                        <img src="/favicon_io/android-chrome-192x192.png" alt="SetupSpot" className="w-10 h-10 rounded-xl object-contain transition-transform duration-200 hover:scale-105" />
                    </Link>
                </div>

                {/* Navigation Items */}
                <div className="flex flex-col gap-6 flex-1">
                    {navItems.map(({ key, icon, title, path }) => (
                        <div key={key} className="relative group flex items-center">
                            <Link
                                to={path}
                                className="p-3 rounded-xl transition-all duration-200 ease-out transform group-hover:scale-102 cursor-pointer"
                                style={{
                                    backgroundColor: activeTab === key ? "rgba(0,102,255,0.08)" : "transparent",
                                    color: activeTab === key ? "#0066ff" : "#727687",
                                }}
                            >
                                <span
                                    className="material-symbols-outlined transition-transform duration-200 ease-out block group-hover:scale-110"
                                    style={{ fontVariationSettings: activeTab === key ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                    {icon}
                                </span>
                            </Link>

                            {/* Slide-out title text pill on hover */}
                            <div className="absolute left-full ml-3.5 px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-lg border border-slate-200 whitespace-nowrap opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out z-50">
                                {title}
                            </div>
                        </div>
                    ))}

                    {/* Admin Portal Button — ONLY shown for Admin */}
                    {Boolean(auth?.is_admin || auth?.user?.is_admin || (auth?.email && auth.email.toLowerCase() === "charanajoseph@gmail.com") || (auth?.user?.email && auth.user.email.toLowerCase() === "charanajoseph@gmail.com")) && (
                        <div className="relative group flex items-center">
                            <Link
                                to="/admin"
                                className="p-3 rounded-xl transition-all duration-200 ease-out transform group-hover:scale-102 cursor-pointer"
                                style={{
                                    backgroundColor: activeTab === 'admin' ? "rgba(0,102,255,0.08)" : "transparent",
                                    color: activeTab === 'admin' ? "#0066ff" : "#727687",
                                }}
                            >
                                <span
                                    className="material-symbols-outlined transition-transform duration-200 ease-out block group-hover:scale-110"
                                    style={{ fontVariationSettings: activeTab === 'admin' ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                    shield_person
                                </span>
                            </Link>
                            <div className="absolute left-full ml-3.5 px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-lg border border-slate-200 whitespace-nowrap opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ease-out z-50">
                                Admin Portal
                            </div>
                        </div>
                    )}
                </div>

                {/* Account Icon */}
                <div className="flex flex-col gap-4">
                    <div className="relative group flex items-center">
                        <Link
                            to="/account"
                            className="p-3 rounded-xl transition-colors"
                            style={{
                                backgroundColor: activeTab === 'account' ? "rgba(0,102,255,0.08)" : "transparent",
                                color: activeTab === 'account' ? "#0066ff" : "#727687",
                            }}
                        >
                            <span
                                className="material-symbols-outlined inline-block transition-transform duration-1000 ease-in-out group-hover:rotate-[360deg]"
                                style={{ fontVariationSettings: activeTab === 'account' ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                person
                            </span>
                        </Link>

                        {/* Slide-out username pill */}
                        <div className="absolute left-full ml-3.5 px-4 py-2.5 bg-white text-black text-xs font-semibold rounded-xl shadow-xl shadow-blue-500/10 border border-blue-100 flex items-center gap-2.5 whitespace-nowrap opacity-0 -translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out z-50">
                            {username ? (
                                <span className="text-black font-bold">{username}</span>
                            ) : (
                                <>
                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                    <span className="text-black">Account</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="ml-20 flex-1 p-8">
                <Outlet />
            </main>
        </div>
    )
}