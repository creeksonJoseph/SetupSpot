import React, { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
    const location = useLocation()
    const { auth } = useAuth()
    const username = auth?.username || auth?.user?.username

    const getActiveTab = () => {
        const path = location.pathname
        if (path.startsWith('/admin')) return 'admin'
        if (path.startsWith('/favorites')) return 'favorites'
        if (path.startsWith('/collections')) return 'collections'
        if (path.startsWith('/create')) return 'create'
        if (path.startsWith('/account')) return 'account'
        if (path.startsWith('/settings')) return 'account'
        return 'explore'
    }

    const activeTab = getActiveTab()

    const navItems = [
        { key: 'explore', icon: 'grid_view', title: 'Explore', path: '/explore' },
        { key: 'favorites', icon: 'favorite', title: 'Favorites', path: '/favorites' },
        { key: 'collections', icon: 'bookmarks', title: 'Collections', path: '/collections' },
        { key: 'create', icon: 'add', title: 'Create', path: '/create' },
    ]

    const isAdmin = Boolean(auth?.is_admin || auth?.user?.is_admin || (auth?.email && auth.email.toLowerCase() === "charanajoseph@gmail.com") || (auth?.user?.email && auth.user.email.toLowerCase() === "charanajoseph@gmail.com"))

    return (
        <div className="flex min-h-screen font-sans" style={{ backgroundColor: "#f7f9fb", fontFamily: "Inter, sans-serif" }}>
            {/* ── Desktop Sidebar (hidden on mobile) ── */}
            <nav className="w-20 fixed left-0 top-0 bottom-0 flex-col items-center py-8 z-30 border-r hidden lg:flex" style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}>
                {/* Logo */}
                <div className="mb-12">
                    <img src="/favicon_io/android-chrome-192x192.png" alt="SetupSpot" className="w-10 h-10 rounded-xl object-contain" />
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
                    {isAdmin && (
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
                                    <span className="text-black">Guest (Sign in)</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Main Content ── */}
            <main className="flex-1 lg:ml-20 pt-2 pb-20 lg:pb-8 px-4 sm:px-6 lg:p-8">
                <Outlet />
            </main>

            {/* ── Mobile Bottom Navigation Bar (hidden on desktop) ── */}
            <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around px-2 py-2 border-t lg:hidden" style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0", paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
                {navItems.map(({ key, icon, title, path }) => (
                    <Link
                        key={key}
                        to={path}
                        className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{
                            color: activeTab === key ? "#0066ff" : "#727687",
                        }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "22px", fontVariationSettings: activeTab === key ? "'FILL' 1" : "'FILL' 0" }}
                        >
                            {icon}
                        </span>
                        <span className="text-[10px] font-semibold">{title}</span>
                    </Link>
                ))}

                {/* Account tab */}
                <Link
                    to="/account"
                    className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                    style={{
                        color: activeTab === 'account' ? "#0066ff" : "#727687",
                    }}
                >
                    <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "22px", fontVariationSettings: activeTab === 'account' ? "'FILL' 1" : "'FILL' 0" }}
                    >
                        person
                    </span>
                    <span className="text-[10px] font-semibold">Account</span>
                </Link>

                {/* Admin tab — only for admins */}
                {isAdmin && (
                    <Link
                        to="/admin"
                        className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        style={{
                            color: activeTab === 'admin' ? "#0066ff" : "#727687",
                        }}
                    >
                        <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "22px", fontVariationSettings: activeTab === 'admin' ? "'FILL' 1" : "'FILL' 0" }}
                        >
                            shield_person
                        </span>
                        <span className="text-[10px] font-semibold">Admin</span>
                    </Link>
                )}
            </nav>
        </div>
    )
}
