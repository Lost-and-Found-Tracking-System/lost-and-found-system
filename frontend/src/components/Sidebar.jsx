import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Package,
    Search,
    Bell,
    User,
    Settings,
    Plus,
    LogOut,
    FileText,
    ChevronLeft,
    ChevronRight,
    Shield,
    Menu,
} from 'lucide-react';
import LogoutConfirmModal from './LogoutConfirmModal';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

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
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Plus, label: 'Report Item', path: '/report' },
        { icon: Search, label: 'Browse Items', path: '/inventory' },
        { icon: FileText, label: 'My Claims', path: '/my-claims' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Sidebar Trigger Area - Always visible on left edge */}
            <div
                className="fixed left-0 top-0 h-full w-4 z-40"
                onMouseEnter={() => setIsExpanded(true)}
            />

            {/* Backdrop */}
            {isExpanded && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 transition-opacity"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed left-0 top-0 h-full bg-slate-900 border-r border-slate-800 flex flex-col z-50 transition-all duration-300 ease-in-out ${isExpanded ? 'w-64 translate-x-0' : 'w-16 -translate-x-12 hover:translate-x-0'
                    }`}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                {/* Logo */}
                <div className={`p-4 border-b border-slate-800 ${isExpanded ? 'px-6' : 'px-4'}`}>
                    <Link to="/dashboard" className="flex items-center gap-2">
                        <div className="p-2 bg-primary-500/20 rounded-lg flex-shrink-0">
                            <Package size={20} className="text-primary-500" />
                        </div>
                        {isExpanded && (
                            <span className="text-xl font-bold text-white whitespace-nowrap">L&F</span>
                        )}
                    </Link>
                </div>

                {/* User Info */}
                {isExpanded && (
                    <div className="p-4 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <User size={18} className="text-primary-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium truncate text-sm">{user?.fullName || 'User'}</p>
                                <p className="text-primary-400 text-xs truncate capitalize">{user?.role || 'Student'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className={`flex-1 space-y-1 overflow-y-auto ${isExpanded ? 'p-4' : 'p-2'}`}>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isActive(item.path)
                                    ? 'bg-primary-500/10 text-primary-500'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                } ${!isExpanded ? 'justify-center' : ''}`}
                            title={!isExpanded ? item.label : undefined}
                        >
                            <item.icon size={20} className="flex-shrink-0" />
                            {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}
                        </Link>
                    ))}

                    {/* Admin Link */}
                    {(user?.role === 'admin' || user?.role === 'delegated_admin') && (
                        <>
                            {isExpanded && <div className="my-3 border-t border-slate-800" />}
                            <Link
                                to="/admin"
                                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${location.pathname.startsWith('/admin')
                                        ? 'bg-yellow-500/10 text-yellow-400'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    } ${!isExpanded ? 'justify-center' : ''}`}
                                title={!isExpanded ? 'Admin Panel' : undefined}
                            >
                                <Shield size={20} className="flex-shrink-0" />
                                {isExpanded && <span className="whitespace-nowrap">Admin Panel</span>}
                            </Link>
                        </>
                    )}
                </nav>

                {/* Logout */}
                <div className={`border-t border-slate-800 ${isExpanded ? 'p-4' : 'p-2'}`}>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className={`flex items-center gap-3 px-3 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors ${!isExpanded ? 'justify-center' : ''
                            }`}
                        title={!isExpanded ? 'Logout' : undefined}
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        {isExpanded && <span className="whitespace-nowrap">Logout</span>}
                    </button>
                </div>

                {/* Expand/Collapse Indicator */}
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 transition-opacity ${isExpanded ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="bg-slate-800 rounded-l-lg p-1">
                        <ChevronRight size={16} className="text-slate-400" />
                    </div>
                </div>
            </aside>

            {/* Logout Confirmation Modal */}
            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
            />
        </>
    );
};

export default Sidebar;
