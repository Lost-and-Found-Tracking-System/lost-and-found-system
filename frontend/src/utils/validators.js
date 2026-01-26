import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES } from './constants';

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Phone validation (Indian format)
export const validatePhone = (phone) => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// Password validation
export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

// File validation
export const validateImage = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Invalid file type. Only JPEG and PNG images are allowed' 
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` 
    };
  }
  
  return { isValid: true };
};

// Document validation
export const validateDocument = (file) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  if (!ALLOWED_DOCUMENT_TYPES.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Invalid file type. Only PDF, JPEG, and PNG files are allowed' 
    };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { 
      isValid: false, 
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` 
    };
  }
  
  return { isValid: true };
};

// Required field validation
export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

// Form validation
export const validateForm = (formData, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = formData[field];
    
    if (rule.required) {
      const result = validateRequired(value, rule.label || field);
      if (!result.isValid) {
        errors[field] = result.error;
      }
    }
    
    if (rule.type === 'email' && value) {
      if (!validateEmail(value)) {
        errors[field] = 'Invalid email address';
      }
    }
    
    if (rule.type === 'phone' && value) {
      if (!validatePhone(value)) {
        errors[field] = 'Invalid phone number';
      }
    }
    
    if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `Must be at least ${rule.minLength} characters`;
    }
    
    if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `Must not exceed ${rule.maxLength} characters`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};