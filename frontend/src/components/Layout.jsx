import React, { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
    const [activeTab, setActiveTab] = useState('explore')
    const { auth } = useAuth()
    const username = auth?.username || auth?.user?.username

    const navItems = [
        { key: 'explore', icon: 'grid_view', title: 'Explore', path: '/explore' },
        { key: 'favorites', icon: 'favorite', title: 'Favorites', path: '/favorites' },
        { key: 'collections', icon: 'bookmarks', title: 'Collections', path: '/collections' },
        { key: 'create', icon: 'add', title: 'Create', path: '/create' },
    ]

    return (
        <div className="flex min-h-screen font-sans" style={{ backgroundColor: "#f7f9fb", fontFamily: "Inter, sans-serif" }}>
            {/* Navigation */}
            <nav className="w-20 fixed left-0 top-0 bottom-0 flex flex-col items-center py-8 z-30 border-r" style={{ backgroundColor: "#ffffff", borderColor: "#E2E8F0" }}>
                <div className="mb-12">
                    <img src="/favicon_io/android-chrome-192x192.png" alt="SetupSpot" className="w-10 h-10 rounded-xl object-contain" />
                </div>

                {/* Navigation Items */}
                <div className="flex flex-col gap-6 flex-1">
                    {navItems.map(({ key, icon, title, path }) => (
                        <Link
                            key={key}
                            to={path}
                            onClick={() => setActiveTab(key)}
                            className="p-3 rounded-xl transition-colors"
                            style={{
                                backgroundColor: activeTab === key ? "rgba(0,102,255,0.08)" : "transparent",
                                color: activeTab === key ? "#0066ff" : "#727687",
                            }}
                            title={title}
                        >
                            <span
                                className="material-symbols-outlined"
                                style={{ fontVariationSettings: activeTab === key ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                {icon}
                            </span>
                        </Link>
                    ))}
                </div>

                <div className="flex flex-col gap-4">
                    <div className="relative group flex items-center">
                        <Link
                            to="/account"
                            onClick={() => setActiveTab('account')}
                            className="p-3 rounded-xl transition-colors"
                            style={{
                                backgroundColor: activeTab === 'account' ? "rgba(0,102,255,0.08)" : "transparent",
                                color: activeTab === 'account' ? "#0066ff" : "#727687",
                            }}
                            title="Account"
                        >
                            <span
                                className="material-symbols-outlined inline-block transition-transform duration-1000 ease-in-out group-hover:rotate-[360deg]"
                                style={{ fontVariationSettings: activeTab === 'account' ? "'FILL' 1" : "'FILL' 0" }}
                            >
                                person
                            </span>
                        </Link>

                        {/* Slide-out username pill component (themed to SetupSpot palette) */}
                        <div className="absolute left-full ml-3.5 px-4 py-2.5 bg-white text-black text-xs font-semibold rounded-xl shadow-xl shadow-blue-500/10 border border-blue-100 flex items-center gap-2.5 whitespace-nowrap opacity-0 -translate-x-3 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out z-50">
                            {username ? (
                                <>
                                    <span className="text-black font-bold">{username}</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                                    <span className="text-[black]">Guest (Sign in)</span>
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