/**
 * @module components/Layout
 * @description Shared page layout wrapper — renders the Sidebar alongside page content.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Page content
 */

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
