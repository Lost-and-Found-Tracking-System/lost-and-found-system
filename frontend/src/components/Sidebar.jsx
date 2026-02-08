import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { gsap } from 'gsap';
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
    Sparkles,
} from 'lucide-react';
import LogoutConfirmModal from './LogoutConfirmModal';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const sidebarRef = useRef(null);
    const navItemsRef = useRef(null);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            navigate('/login');
        }
    };

    // GSAP Animation on expand/collapse
    useEffect(() => {
        if (!navItemsRef.current) return;

        const navItems = navItemsRef.current.querySelectorAll('.nav-item');

        if (isExpanded) {
            gsap.fromTo(navItems,
                { x: -10, opacity: 0.5 },
                {
                    x: 0,
                    opacity: 1,
                    duration: 0.3,
                    stagger: 0.03,
                    ease: 'power2.out',
                }
            );
        }
    }, [isExpanded]);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Plus, label: 'Report Item', path: '/report' },
        { icon: Search, label: 'Browse Items', path: '/inventory' },
        { icon: FileText, label: 'My Claims', path: '/my-claims' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: User, label: 'Profile', path: '/profile' },
    ];

    const isActive = (path) => location.pathname === path;

    const handleNavHover = (e, entering) => {
        if (!isExpanded) return;

        gsap.to(e.currentTarget, {
            x: entering ? 4 : 0,
            duration: 0.2,
            ease: 'power2.out',
        });
    };

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
                    className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsExpanded(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                ref={sidebarRef}
                className={`fixed left-0 top-0 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 flex flex-col z-50 transition-all duration-300 ease-out shadow-2xl shadow-black/50 ${isExpanded ? 'w-64 translate-x-0' : 'w-16 -translate-x-12 hover:translate-x-0'
                    }`}
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                {/* Logo */}
                <div className={`p-4 border-b border-slate-800/50 ${isExpanded ? 'px-6' : 'px-4'}`}>
                    <Link to="/dashboard" className="flex items-center gap-3 group">
                        <div className="p-2.5 bg-gradient-to-br from-primary-500/30 to-indigo-500/20 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-primary-500/10">
                            <Package size={20} className="text-primary-400" />
                        </div>
                        {isExpanded && (
                            <span className="text-xl font-black text-white whitespace-nowrap tracking-tight">
                                L<span className="text-primary-400">&</span>F
                            </span>
                        )}
                    </Link>
                </div>

                {/* User Info */}
                {isExpanded && (
                    <div className="p-4 border-b border-slate-800/50">
                        <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-500/30 to-indigo-500/20 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                                <User size={18} className="text-primary-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-semibold truncate text-sm">{user?.fullName || 'User'}</p>
                                <p className="text-primary-400 text-xs truncate capitalize font-medium">{user?.role || 'Student'}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav ref={navItemsRef} className={`flex-1 space-y-1.5 overflow-y-auto ${isExpanded ? 'p-4' : 'p-2'}`}>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onMouseEnter={(e) => handleNavHover(e, true)}
                            onMouseLeave={(e) => handleNavHover(e, false)}
                            className={`nav-item flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${isActive(item.path)
                                ? 'bg-gradient-to-r from-primary-500/20 to-indigo-500/10 text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/5'
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
                                } ${!isExpanded ? 'justify-center px-3' : ''}`}
                            title={!isExpanded ? item.label : undefined}
                        >
                            <item.icon size={20} className="flex-shrink-0" />
                            {isExpanded && <span className="whitespace-nowrap font-medium">{item.label}</span>}

                            {/* Active Indicator */}
                            {isActive(item.path) && isExpanded && (
                                <div className="ml-auto w-1.5 h-1.5 bg-primary-400 rounded-full animate-pulse" />
                            )}
                        </Link>
                    ))}

                    {/* Admin Link */}
                    {(user?.role === 'admin' || user?.role === 'delegated_admin') && (
                        <>
                            {isExpanded && (
                                <div className="my-4 flex items-center gap-2">
                                    <div className="flex-1 border-t border-slate-800/50" />
                                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Admin</span>
                                    <div className="flex-1 border-t border-slate-800/50" />
                                </div>
                            )}
                            <Link
                                to="/admin"
                                onMouseEnter={(e) => handleNavHover(e, true)}
                                onMouseLeave={(e) => handleNavHover(e, false)}
                                className={`nav-item flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${location.pathname.startsWith('/admin')
                                    ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border border-amber-500/20 shadow-lg shadow-amber-500/5'
                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent'
                                    } ${!isExpanded ? 'justify-center px-3' : ''}`}
                                title={!isExpanded ? 'Admin Panel' : undefined}
                            >
                                <Shield size={20} className="flex-shrink-0" />
                                {isExpanded && <span className="whitespace-nowrap font-medium">Admin Panel</span>}

                                {location.pathname.startsWith('/admin') && isExpanded && (
                                    <div className="ml-auto w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                                )}
                            </Link>
                        </>
                    )}
                </nav>

                {/* Logout */}
                <div className={`border-t border-slate-800/50 ${isExpanded ? 'p-4' : 'p-2'}`}>
                    <button
                        onClick={() => setShowLogoutModal(true)}
                        className={`flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-500/20 ${!isExpanded ? 'justify-center px-3' : ''
                            }`}
                        title={!isExpanded ? 'Logout' : undefined}
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        {isExpanded && <span className="whitespace-nowrap font-medium">Logout</span>}
                    </button>
                </div>

                {/* Expand/Collapse Indicator */}
                <div className={`absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-300 ${isExpanded ? 'opacity-0 translate-x-2' : 'opacity-100'}`}>
                    <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-l-lg p-1.5 shadow-lg">
                        <ChevronRight size={14} className="text-slate-400" />
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
