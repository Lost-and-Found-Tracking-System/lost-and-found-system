import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
import {
    LayoutDashboard,
    FileText,
    Users,
    MapPin,
    Settings,
    LogOut,
    ChevronRight,
    Shield,
    Home,
    User,
} from 'lucide-react';
import LogoutConfirmModal from './LogoutConfirmModal';

const AdminSidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navRef = useRef(null);

    // GSAP animation when sidebar expands
    useEffect(() => {
        if (!navRef.current) return;

        const navItems = navRef.current.querySelectorAll('.nav-link');

        if (isExpanded) {
            gsap.fromTo(navItems,
                { x: -15, opacity: 0.5 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.4,
                    stagger: 0.05,
                    ease: 'power3.out'
                }
            );
        }
    }, [isExpanded]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/login');
        }
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Admin Dashboard', path: '/admin' },
        { icon: FileText, label: 'Claims Management', path: '/admin/claims' },
        { icon: Users, label: 'User Management', path: '/admin/roles' },
        { icon: MapPin, label: 'Zone Management', path: '/admin/zones' },
        { icon: Settings, label: 'AI Configuration', path: '/admin/ai-config' },
    ];

    const isActive = (path) => {
        if (path === '/admin') return location.pathname === '/admin';
        return location.pathname.startsWith(path);
    };

    return (
        <>
            {/* Hover Trigger Zone */}
            <div
                className="fixed left-0 top-0 h-full w-4 z-40 bg-transparent"
                onMouseEnter={() => setIsExpanded(true)}
            />

            {/* Content Overlay */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full bg-[#020617]/95 backdrop-blur-xl border-r border-slate-800 flex flex-col z-50 transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${isExpanded ? 'w-72 shadow-2xl shadow-blue-900/20' : 'w-20 -translate-x-[calc(100%-4px)] hover:translate-x-0 opacity-80 hover:opacity-100'
                    }`}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                {/* Header / Logo */}
                <div className="p-6 border-b border-slate-800/50">
                    <Link to="/admin" className="flex items-center gap-3 group">
                        <div className="relative flex-shrink-0">
                            <div className="absolute inset-0 bg-primary-500/20 rounded-xl blur-md group-hover:bg-primary-500/30 transition-colors" />
                            <div className="relative p-2.5 bg-slate-900 border border-slate-700 rounded-xl">
                                <Shield size={24} className="text-primary-400 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                        </div>
                        {isExpanded && (
                            <div className="overflow-hidden whitespace-nowrap">
                                <h2 className="text-lg font-bold text-white leading-tight">Admin Portal</h2>
                                <p className="text-xs text-primary-400 font-mono">LOST & FOUND</p>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Profile Widget */}
                {isExpanded && (
                    <div className="p-4 mx-4 mt-6 mb-2 bg-slate-900/50 border border-slate-700/50 rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                {user?.fullName?.charAt(0) || <User size={18} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-bold truncate">{user?.fullName || 'Administrator'}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-slate-400 text-xs truncate capitalize">{user?.role || 'Super Admin'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav ref={navRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 custom-scrollbar">
                    {navItems.map((item) => {
                        const active = isActive(item.path);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`nav-link flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${active
                                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    } ${!isExpanded ? 'justify-center' : ''}`}
                                title={!isExpanded ? item.label : undefined}
                            >
                                <item.icon
                                    size={22}
                                    className={`flex-shrink-0 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}
                                />
                                {isExpanded && <span className="font-medium whitespace-nowrap">{item.label}</span>}

                                {active && isExpanded && (
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white/20 rounded-l-full" />
                                )}
                            </Link>
                        );
                    })}

                    <div className="py-4 px-2">
                        <div className="h-px bg-slate-800/80 w-full" />
                    </div>

                    <Link
                        to="/dashboard"
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-slate-400 hover:bg-slate-800 hover:text-white group ${!isExpanded ? 'justify-center' : ''}`}
                        title={!isExpanded ? 'User Dashboard' : undefined}
                    >
                        <Home size={22} className="flex-shrink-0 group-hover:text-primary-400 transition-colors" />
                        {isExpanded && <span className="font-medium whitespace-nowrap">User App</span>}
                    </Link>
                </nav>

                {/* Footer Controls */}
                <div className="p-4 border-t border-slate-800/50 bg-[#020617]">
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className={`flex items-center gap-3 px-3 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20 transition-all ${!isExpanded ? 'justify-center' : ''
                            }`}
                        title={!isExpanded ? 'Logout' : undefined}
                    >
                        <LogOut size={22} className="flex-shrink-0" />
                        {isExpanded && <span className="font-bold whitespace-nowrap">Sign Out</span>}
                    </button>
                </div>
            </aside>

            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />
        </>
    );
};

export default AdminSidebar;
