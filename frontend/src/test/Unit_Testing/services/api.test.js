import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
// api import removed - using dynamic import in beforeEach
import axios from 'axios';

// Mock axios and environment
vi.mock('axios', () => {
    const mockRequestUse = vi.fn();
    const mockResponseUse = vi.fn();

    const mockAxios = {
        create: vi.fn(() => ({
            interceptors: {
                request: { use: mockRequestUse },
                response: { use: mockResponseUse }
            },
            get: vi.fn(),
            post: vi.fn(),
            put: vi.fn(),
            delete: vi.fn()
        })),
        isAxiosError: vi.fn((payload) => !!payload.isAxiosError),
        // Expose mocks for testing access
        _mockRequestUse: mockRequestUse,
        _mockResponseUse: mockResponseUse
    };
    return {
        default: mockAxios
    };
});

describe('API Service', () => {
    let requestInterceptor;
    let responseInterceptorSuccess;
    let responseInterceptorError;
    let api; // Will hold the dynamically imported module

    beforeEach(async () => {
        vi.resetModules(); // CLEAR MODULE CACHE
        vi.clearAllMocks();
        localStorage.clear();

        // Import api AFTER resetting modules and setting up mocks
        // This ensures api.js runs and registers interceptors against our FRESH mocks
        api = (await import('../../../services/api')).default;

        // Access shared mocks exposed in manual mock
        const mockRequestUse = axios._mockRequestUse;
        const mockResponseUse = axios._mockResponseUse;

        // Now capture the incerceptors
        if (mockRequestUse.mock.calls.length > 0) {
            requestInterceptor = mockRequestUse.mock.calls[0][0];
        }

        if (mockResponseUse.mock.calls.length > 0) {
            responseInterceptorSuccess = mockResponseUse.mock.calls[0][0];
            responseInterceptorError = mockResponseUse.mock.calls[0][1];
        }
    });

    describe('Instance Creation', () => {
        it('creates axios instance with correct config', () => {
            // This checks strictly the first call, which happened at import
            expect(axios.create).toHaveBeenCalledWith(expect.objectContaining({
                baseURL: expect.stringContaining('api'),
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
                timeout: 15000
            }));
        });
    });

    describe('Request Interceptor', () => {
        it('adds Authorization header if token exists', () => {
            localStorage.setItem('token', 'test-token');
            const config = { headers: {} };

            // Invoke the captured interceptor
            const result = requestInterceptor(config);

            expect(result.headers.Authorization).toBe('Bearer test-token');
        });

        it('does not add Authorization header if no token', () => {
            const config = { headers: {} };
            const result = requestInterceptor(config);
            expect(result.headers.Authorization).toBeUndefined();
        });

        it('rejects on request error', async () => {
            const mockRequestUse = axios._mockRequestUse; // Access exposed mock
            const errorInterceptor = mockRequestUse.mock.calls[0][1];
            const error = new Error('Request fail');
            await expect(errorInterceptor(error)).rejects.toThrow('Request fail');
        });
    });

    describe('Response Interceptor', () => {
        it('returns response data on success', () => {
            const response = { data: 'test data' };
            const result = responseInterceptorSuccess(response);
            expect(result).toBe(response);
        });

        it('handles 401 error by clearing storage and redirecting', async () => {
            // Mock window.location
            const originalLocation = window.location;
            delete window.location;
            window.location = { pathname: '/dashboard', href: '' };

            localStorage.setItem('token', 'old-token');

            const error = {
                response: { status: 401 },
                config: { _retry: false }
            };

            try {
                await responseInterceptorError(error);
            } catch (e) {
                // Expected to reject
            }

            expect(localStorage.getItem('token')).toBeNull();
            expect(window.location.href).toBe('/login');

            // Restore location
            window.location = originalLocation;
        });

        it('does NOT redirect on 401 if already on auth page', async () => {
            const originalLocation = window.location;
            delete window.location;
            window.location = { pathname: '/login', href: '' };
            localStorage.setItem('token', 'old-token');

            const error = {
                response: { status: 401 },
                config: { _retry: false }
            };

            try {
                await responseInterceptorError(error);
            } catch (e) {
                // Expected to reject
            }

            expect(localStorage.getItem('token')).toBe('old-token');
            expect(window.location.href).toBe('');

            window.location = originalLocation;
        });

        it('handles network errors', async () => {
            const error = {
                message: 'Network Error',
                response: undefined,
                config: {}
            };

            try {
                await responseInterceptorError(error);
            } catch (e) {
                expect(e.message).toContain('Network error');
            }
        });
    });
});
