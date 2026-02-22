// Test credentials and data
export const TEST_USERS = {
    student: {
        email: 'student@example.com',
        password: 'Student@123',
        role: 'student',
        fullName: 'Test Student',
    },
    faculty: {
        email: 'faculty@example.com',
        password: 'Faculty@123',
        role: 'faculty',
        fullName: 'Test Faculty',
    },
    admin: {
        email: 'admin@example.com',
        password: 'Admin@123',
        role: 'admin',
        fullName: 'Test Admin',
    },
};

export const TEST_ITEM = {
    category: 'Electronics',
    description: 'Black laptop charger with Lenovo branding, 65W power adapter found near the library entrance',
    color: 'Black',
    material: 'Plastic',
    size: 'Medium',
};

export const TEST_CLAIM = {
    ownershipProof: 'This is my charger. I bought it from Amazon on January 15th. The serial number ends with ABC123.',
};

export const ROUTES = {
    home: '/',
    login: '/login',
    register: '/register',
    registerVisitor: '/register-visitor',
    dashboard: '/dashboard',
    report: '/report',
    inventory: '/inventory',
    myClaims: '/my-claims',
    notifications: '/notifications',
    profile: '/profile',
    admin: '/admin',
    adminClaims: '/admin/claims',
    adminRoles: '/admin/roles',
    adminZones: '/admin/zones',
    adminAIConfig: '/admin/ai-config',
};

export const API_BASE = 'http://localhost:3000/api';

export const API_ROUTES = {
    register: `${API_BASE}/v1/auth/register`,
    login: `${API_BASE}/v1/auth/login`,
    logout: `${API_BASE}/v1/auth/logout`,
    refresh: `${API_BASE}/v1/auth/refresh`,
    profile: `${API_BASE}/v1/users/profile`,
    items: `${API_BASE}/v1/items`,
    itemsByType: (type: string) => `${API_BASE}/v1/items/type/${type}`,
    claims: `${API_BASE}/v1/claims`,
    myClaims: `${API_BASE}/v1/claims/user/my-claims`,
    notifications: `${API_BASE}/v1/notifications`,
    dashboardStats: `${API_BASE}/v1/dashboard/stats`,
    zones: `${API_BASE}/v1/zones`,
    adminStats: `${API_BASE}/v1/admin/stats`,
    adminActivity: `${API_BASE}/v1/admin/activity`,
    adminUsers: `${API_BASE}/v1/admin/users`,
    adminClaims: `${API_BASE}/v1/admin/claims`,
    adminItems: `${API_BASE}/v1/admin/items`,
    adminAIConfig: `${API_BASE}/v1/admin/ai-config`,
    adminAuditLogs: `${API_BASE}/v1/admin/audit-logs`,
    adminAnnouncements: `${API_BASE}/v1/admin/announcements`,
};
