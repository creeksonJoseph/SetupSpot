import React, { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Grid3X3, Heart, Bookmark, Plus, User } from 'lucide-react'

export default function Layout() {
    const [activeTab, setActiveTab] = useState('explore')

    const navItems = [
        { key: 'explore', Icon: Grid3X3, title: 'Explore', path: '/explore' },
        { key: 'favorites', Icon: Heart, title: 'Favorites', path: '/favorites' }, 
        { key: 'collections', Icon: Bookmark, title: 'Collections', path: '/collections' }, 
        { key: 'create', Icon: Plus, title: 'Create', path: '/create' },
    ]

    return (
        <div className="flex min-h-screen font-sans bg-gray-900">
            {/* Navigation */}
            <nav className="w-20  bg-gray-800 fixed left-0 top-0 bottom-0 flex flex-col items-center py-8 z-30">
                <div className="mb-12">
                    <div className="w-10 h-10 rounded-xl bg-gray-900 shadow-lg flex items-center justify-center text-white font-bold text-xl">D</div>
                </div>
                
                {/* Navigation Items */}
                <div className="flex flex-col gap-6 flex-1">
                    {navItems.map(({ key, Icon, title, path }) => (
                        <Link
                            key={key}
                            to={path}
                            onClick={() => setActiveTab(key)}
                            className={`p-3 rounded-xl transition-colors ${
                                activeTab === key
                                    ? 'bg-gray-900 text-white shadow-md'
                                    : 'text-gray-400 hover:bg-gray-700'
                            }`}
                            title={title}
                        >
                            <Icon size={24} />
                        </Link>
                    ))}
                </div>

                <div className="flex flex-col gap-4">
                    <Link
                    to="/account"
                        onClick={() => setActiveTab('account')}
                        className={`p-3 rounded-xl transition-colors ${
                            activeTab === 'account' 
                                ? 'bg-gray-900 text-white shadow-md'
                                : 'text-gray-400 hover:bg-gray-700'
                        }`}
                        title="Account"
                    >
                        <User size={24} />
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
                <main className="ml-20 flex-1 p-8">
                    <Outlet />
                </main>
        </div>
    )
}