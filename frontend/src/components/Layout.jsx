import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />
            <main className="transition-all duration-300">
                {children}
            </main>
        </div>
    );
};

export default Layout;
