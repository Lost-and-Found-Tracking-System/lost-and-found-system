// User Roles
export const USER_ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  VISITOR: 'visitor',
  ADMIN: 'admin',
};

// Item Types
export const ITEM_TYPES = {
  LOST: 'lost',
  FOUND: 'found',
};

// Item Status
export const ITEM_STATUS = {
  PENDING: 'pending',
  MATCHED: 'matched',
  CLAIMED: 'claimed',
  RESOLVED: 'resolved',
  ARCHIVED: 'archived',
};

// Claim Status
export const CLAIM_STATUS = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PROOF_REQUIRED: 'proof_required',
};

// Item Categories
export const ITEM_CATEGORIES = [
  'Electronics',
  'Books & Stationery',
  'Clothing & Accessories',
  'Personal Items',
  'Sports Equipment',
  'Keys & Cards',
  'Bags & Luggage',
  'Jewelry',
  'Documents',
  'Other',
];

// Campus Locations
export const CAMPUS_LOCATIONS = [
  'Library',
  'Cafeteria',
  'Academic Block A',
  'Academic Block B',
  'Academic Block C',
  'Sports Complex',
  'Auditorium',
  'Parking Lot',
  'Hostel Area',
  'Administrative Building',
  'Other',
];

// Notification Types
export const NOTIFICATION_TYPES = {
  MATCH_FOUND: 'match_found',
  CLAIM_STATUS: 'claim_status',
  PROOF_REQUEST: 'proof_request',
  APPROVAL: 'approval',
  REJECTION: 'rejection',
  SYSTEM: 'system',
};

// Time Ranges for Search
export const TIME_RANGES = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  CUSTOM: 'custom',
};

// Sort Options
export const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'relevance', label: 'Most Relevant' },
];

// Pagination
export const ITEMS_PER_PAGE = 20;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];