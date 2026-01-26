import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { LayoutDashboard, Settings, Users, FileText } from 'lucide-react';

// Import admin components when created
// import Dashboard from '../components/admin/Dashboard';
// import AIConfig from '../components/admin/AIConfig';
// import UserManagement from '../components/admin/UserManagement';
// import AuditLogs from '../components/admin/AuditLogs';

const AdminPanel = () => {
  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/ai-config', icon: Settings, label: 'AI Configuration' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/logs', icon: FileText, label: 'Audit Logs' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
          <nav className="space-y-2">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50 p-8">
        <Routes>
          <Route path="/" element={<div>Dashboard Component</div>} />
          <Route path="/ai-config" element={<div>AI Config Component</div>} />
          <Route path="/users" element={<div>User Management Component</div>} />
          <Route path="/logs" element={<div>Audit Logs Component</div>} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;