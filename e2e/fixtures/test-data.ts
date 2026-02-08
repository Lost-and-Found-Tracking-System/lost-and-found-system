// Test credentials and data
export const TEST_USERS = {
    student: {
        email: 'student@example.com',
        password: 'Student@123',
        role: 'student',
    },
    faculty: {
        email: 'faculty@example.com',
        password: 'Faculty@123',
        role: 'faculty',
    },
    admin: {
        email: 'admin@example.com',
        password: 'Admin@123',
        role: 'admin',
    },
};

export const TEST_ITEM = {
    category: 'Electronics',
    description: 'Black laptop charger with Lenovo branding, 65W power adapter',
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
