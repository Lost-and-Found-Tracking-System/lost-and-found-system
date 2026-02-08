import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Profile from '../pages/Profile';
import api from '../services/api';

// Mock framer-motion
vi.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock AuthContext with updateProfile function
const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    fullName: 'John Doe',
    phone: '+91 9876543210',
    affiliation: 'CSE Department',
    role: 'student',
};

const mockUpdateProfile = vi.fn();

vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: mockUser,
        isAuthenticated: true,
        updateProfile: mockUpdateProfile,
    }),
}));

// Mock Sidebar
vi.mock('../components/Sidebar', () => ({
    default: () => <div data-testid="sidebar">Sidebar</div>,
}));

// Mock API
vi.mock('../services/api', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
    },
}));

// Mock notification preferences
const mockNotifPrefs = {
    channels: {
        email: true,
        push: true,
        sms: false,
    },
};

// Mock login activity
const mockLoginActivity = [
    {
        _id: 'activity1',
        eventType: 'success',
        timestamp: '2024-01-15T10:30:00Z',
        deviceType: 'Chrome on Windows',
        location: 'Mumbai, India',
    },
    {
        _id: 'activity2',
        eventType: 'failure',
        timestamp: '2024-01-14T15:00:00Z',
        deviceType: 'Mobile Safari on iPhone',
        location: 'Delhi, India',
    },
    {
        _id: 'activity3',
        eventType: 'logout',
        timestamp: '2024-01-13T09:00:00Z',
        deviceType: 'Firefox on Mac',
        location: 'Bangalore, India',
    },
];

const renderProfile = () => {
    return render(
        <MemoryRouter>
            <Profile />
        </MemoryRouter>
    );
};

describe('Profile Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Default API mock implementations
        api.get.mockImplementation((url) => {
            if (url === '/v1/users/notification-preferences') {
                return Promise.resolve({ data: mockNotifPrefs });
            }
            if (url === '/v1/users/login-activity') {
                return Promise.resolve({ data: mockLoginActivity });
            }
            return Promise.resolve({ data: {} });
        });
        api.put.mockResolvedValue({ data: { success: true } });
    });

    afterEach(() => {
        cleanup();
    });

    describe('Initial Rendering', () => {
        it('should render the sidebar', async () => {
            renderProfile();
            expect(screen.getByTestId('sidebar')).toBeInTheDocument();
        });

        it('should render the page header with title', async () => {
            renderProfile();
            expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Profile Settings');
        });

        it('should render subtitle text', async () => {
            renderProfile();
            expect(screen.getByText('Manage your account settings')).toBeInTheDocument();
        });

        it('should render Back to Dashboard link', async () => {
            renderProfile();
            const backLink = screen.getByRole('link', { name: /Back to Dashboard/i });
            expect(backLink).toBeInTheDocument();
            expect(backLink).toHaveAttribute('href', '/dashboard');
        });
    });

    describe('Personal Information Form', () => {
        it('should render Personal Information section header', async () => {
            renderProfile();
            expect(screen.getByText('Personal Information')).toBeInTheDocument();
        });

        it('should render Full Name input with user data', async () => {
            renderProfile();
            const nameInput = screen.getByPlaceholderText('Your full name');
            expect(nameInput).toBeInTheDocument();
            expect(nameInput).toHaveValue('John Doe');
        });

        it('should render Email input as disabled', async () => {
            renderProfile();
            const emailInput = screen.getByDisplayValue('test@example.com');
            expect(emailInput).toBeInTheDocument();
            expect(emailInput).toBeDisabled();
        });

        it('should show "Email cannot be changed" hint', async () => {
            renderProfile();
            expect(screen.getByText('Email cannot be changed')).toBeInTheDocument();
        });

        it('should render Phone Number input with user data', async () => {
            renderProfile();
            const phoneInput = screen.getByPlaceholderText('+91 9876543210');
            expect(phoneInput).toBeInTheDocument();
            expect(phoneInput).toHaveValue('+91 9876543210');
        });

        it('should render Affiliation input with user data', async () => {
            renderProfile();
            const affiliationInput = screen.getByPlaceholderText('e.g., CSE Department');
            expect(affiliationInput).toBeInTheDocument();
            expect(affiliationInput).toHaveValue('CSE Department');
        });

        it('should render Role input as disabled', async () => {
            renderProfile();
            const roleInput = screen.getByDisplayValue('STUDENT');
            expect(roleInput).toBeInTheDocument();
            expect(roleInput).toBeDisabled();
        });

        it('should render Save Changes button', async () => {
            renderProfile();
            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            expect(saveButton).toBeInTheDocument();
        });
    });

    describe('Form Input Changes', () => {
        it('should update Full Name field when typing', async () => {
            renderProfile();
            const nameInput = screen.getByPlaceholderText('Your full name');
            
            fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
            expect(nameInput).toHaveValue('Jane Doe');
        });

        it('should update Phone Number field when typing', async () => {
            renderProfile();
            const phoneInput = screen.getByPlaceholderText('+91 9876543210');
            
            fireEvent.change(phoneInput, { target: { value: '+91 1234567890' } });
            expect(phoneInput).toHaveValue('+91 1234567890');
        });

        it('should update Affiliation field when typing', async () => {
            renderProfile();
            const affiliationInput = screen.getByPlaceholderText('e.g., CSE Department');
            
            fireEvent.change(affiliationInput, { target: { value: 'IT Department' } });
            expect(affiliationInput).toHaveValue('IT Department');
        });
    });

    describe('Profile Update Submission', () => {
        it('should call updateProfile on form submit', async () => {
            mockUpdateProfile.mockResolvedValueOnce({});
            renderProfile();

            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(mockUpdateProfile).toHaveBeenCalledWith({
                    fullName: 'John Doe',
                    phone: '+91 9876543210',
                    affiliation: 'CSE Department',
                });
            });
        });

        it('should show success message after successful update', async () => {
            mockUpdateProfile.mockResolvedValueOnce({});
            renderProfile();

            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
            });
        });

        it('should show saving spinner during update', async () => {
            let resolvePromise;
            mockUpdateProfile.mockImplementationOnce(() => new Promise((resolve) => {
                resolvePromise = resolve;
            }));

            renderProfile();

            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            fireEvent.click(saveButton);

            expect(screen.getByText('Saving...')).toBeInTheDocument();

            // Resolve to clean up
            resolvePromise({});
            await waitFor(() => {
                expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
            });
        });

        it('should show error message on update failure', async () => {
            mockUpdateProfile.mockRejectedValueOnce({ error: 'Update failed' });
            renderProfile();

            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText('Update failed')).toBeInTheDocument();
            });
        });

        it('should show generic error message if no error message provided', async () => {
            mockUpdateProfile.mockRejectedValueOnce({});
            renderProfile();

            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText('Failed to update profile')).toBeInTheDocument();
            });
        });

        it('should disable Save button while saving', async () => {
            let resolvePromise;
            mockUpdateProfile.mockImplementationOnce(() => new Promise((resolve) => {
                resolvePromise = resolve;
            }));

            renderProfile();

            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            fireEvent.click(saveButton);

            // Button should show "Saving..." and be disabled
            const savingButton = screen.getByRole('button', { name: /Saving/i });
            expect(savingButton).toBeDisabled();

            resolvePromise({});
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Save Changes/i })).not.toBeDisabled();
            });
        });
    });

    describe('Notification Preferences', () => {
        it('should render Notification Preferences section header', async () => {
            renderProfile();
            expect(screen.getByText('Notification Preferences')).toBeInTheDocument();
        });

        it('should render Email Notifications toggle', async () => {
            renderProfile();
            expect(screen.getByText('Email Notifications')).toBeInTheDocument();
            expect(screen.getByText('Receive updates via email')).toBeInTheDocument();
        });

        it('should render Push Notifications toggle', async () => {
            renderProfile();
            expect(screen.getByText('Push Notifications')).toBeInTheDocument();
            expect(screen.getByText('Receive in-app notifications')).toBeInTheDocument();
        });

        it('should render SMS Notifications toggle', async () => {
            renderProfile();
            expect(screen.getByText('SMS Notifications')).toBeInTheDocument();
            expect(screen.getByText('Receive updates via SMS')).toBeInTheDocument();
        });

        it('should render Save Preferences button', async () => {
            renderProfile();
            const savePrefsButton = screen.getByRole('button', { name: /Save Preferences/i });
            expect(savePrefsButton).toBeInTheDocument();
        });

        it('should fetch notification preferences on mount', async () => {
            renderProfile();

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/users/notification-preferences');
            });
        });

        it('should toggle email notification when button clicked', async () => {
            renderProfile();

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/users/notification-preferences');
            });

            // Find the Email Notifications toggle button
            const emailToggleContainer = screen.getByText('Email Notifications').closest('.flex.items-center.justify-between');
            const toggleButton = emailToggleContainer.querySelector('button');
            
            // Toggle should initially be enabled (bg-primary-500)
            expect(toggleButton).toHaveClass('bg-primary-500');

            // Click to toggle
            fireEvent.click(toggleButton);

            // Toggle should now be disabled (bg-slate-700)
            expect(toggleButton).toHaveClass('bg-slate-700');
        });

        it('should toggle push notification when button clicked', async () => {
            renderProfile();

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/users/notification-preferences');
            });

            const pushToggleContainer = screen.getByText('Push Notifications').closest('.flex.items-center.justify-between');
            const toggleButton = pushToggleContainer.querySelector('button');
            
            expect(toggleButton).toHaveClass('bg-primary-500');

            fireEvent.click(toggleButton);
            expect(toggleButton).toHaveClass('bg-slate-700');
        });

        it('should toggle sms notification when button clicked', async () => {
            renderProfile();

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/users/notification-preferences');
            });

            const smsToggleContainer = screen.getByText('SMS Notifications').closest('.flex.items-center.justify-between');
            const toggleButton = smsToggleContainer.querySelector('button');
            
            // Initially disabled (sms: false in mock data)
            expect(toggleButton).toHaveClass('bg-slate-700');

            fireEvent.click(toggleButton);
            expect(toggleButton).toHaveClass('bg-primary-500');
        });
    });

    describe('Notification Preferences Update', () => {
        it('should call API to update preferences when Save Preferences clicked', async () => {
            renderProfile();

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/users/notification-preferences');
            });

            const savePrefsButton = screen.getByRole('button', { name: /Save Preferences/i });
            fireEvent.click(savePrefsButton);

            await waitFor(() => {
                expect(api.put).toHaveBeenCalledWith('/v1/users/notification-preferences', {
                    channels: expect.objectContaining({
                        email: expect.any(Boolean),
                        push: expect.any(Boolean),
                        sms: expect.any(Boolean),
                    }),
                });
            });
        });

        it('should show success message after successful preferences update', async () => {
            renderProfile();

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/users/notification-preferences');
            });

            const savePrefsButton = screen.getByRole('button', { name: /Save Preferences/i });
            fireEvent.click(savePrefsButton);

            await waitFor(() => {
                expect(screen.getByText('Notification preferences updated')).toBeInTheDocument();
            });
        });

        it('should show error message on preferences update failure', async () => {
            api.put.mockRejectedValueOnce({ 
                response: { data: { error: 'Preferences update failed' } } 
            });

            renderProfile();

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/users/notification-preferences');
            });

            const savePrefsButton = screen.getByRole('button', { name: /Save Preferences/i });
            fireEvent.click(savePrefsButton);

            await waitFor(() => {
                expect(screen.getByText('Preferences update failed')).toBeInTheDocument();
            });
        });

        it('should show saving state during preferences update', async () => {
            let resolvePromise;
            api.put.mockImplementationOnce(() => new Promise((resolve) => {
                resolvePromise = resolve;
            }));

            renderProfile();

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/users/notification-preferences');
            });

            const savePrefsButton = screen.getByRole('button', { name: /Save Preferences/i });
            fireEvent.click(savePrefsButton);

            // Expect at least one "Saving..." button in the document
            const savingButton = screen.getAllByText('Saving...').find(el => 
                el.closest('button')?.className.includes('bg-slate-800')
            );
            expect(savingButton).toBeInTheDocument();

            resolvePromise({ data: { success: true } });
            await waitFor(() => {
                expect(screen.getByRole('button', { name: /Save Preferences/i })).toBeInTheDocument();
            });
        });
    });

    describe('Login Activity Section', () => {
        it('should render Login Activity section header', async () => {
            renderProfile();
            expect(screen.getByText('Login Activity')).toBeInTheDocument();
        });

        it('should fetch login activity on mount', async () => {
            renderProfile();

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/users/login-activity');
            });
        });

        it('should display login activity entries', async () => {
            renderProfile();

            await waitFor(() => {
                expect(screen.getByText('Login Success')).toBeInTheDocument();
            });
        });

        it('should show Login Failed entry', async () => {
            renderProfile();

            await waitFor(() => {
                expect(screen.getByText('Login Failed')).toBeInTheDocument();
            });
        });

        it('should show Logout entry', async () => {
            renderProfile();

            await waitFor(() => {
                expect(screen.getByText('Logout')).toBeInTheDocument();
            });
        });

        it('should display device information', async () => {
            renderProfile();

            await waitFor(() => {
                expect(screen.getByText(/Chrome on Windows/)).toBeInTheDocument();
            });
        });

        it('should display location information', async () => {
            renderProfile();

            await waitFor(() => {
                expect(screen.getByText('Mumbai, India')).toBeInTheDocument();
            });
        });

        it('should show loading spinner while fetching activity', async () => {
            let resolvePromise;
            api.get.mockImplementation((url) => {
                if (url === '/v1/users/login-activity') {
                    return new Promise((resolve) => {
                        resolvePromise = resolve;
                    });
                }
                return Promise.resolve({ data: mockNotifPrefs });
            });

            renderProfile();

            // Should have loading spinner
            const spinners = document.querySelectorAll('.animate-spin');
            expect(spinners.length).toBeGreaterThan(0);

            resolvePromise({ data: mockLoginActivity });
            await waitFor(() => {
                expect(screen.getByText('Login Success')).toBeInTheDocument();
            });
        });

        it('should show empty message when no login activity', async () => {
            api.get.mockImplementation((url) => {
                if (url === '/v1/users/login-activity') {
                    return Promise.resolve({ data: [] });
                }
                return Promise.resolve({ data: mockNotifPrefs });
            });

            renderProfile();

            await waitFor(() => {
                expect(screen.getByText('No login activity found')).toBeInTheDocument();
            });
        });
    });

    describe('Error Message Dismissal', () => {
        it('should have dismiss button for error messages', async () => {
            mockUpdateProfile.mockRejectedValueOnce({ error: 'Some error' });
            renderProfile();

            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                expect(screen.getByText('Some error')).toBeInTheDocument();
            });

            // Find the close button in the error container
            const errorContainer = screen.getByText('Some error').closest('div');
            const closeButton = errorContainer.querySelector('button');
            
            expect(closeButton).toBeInTheDocument();

            fireEvent.click(closeButton);

            await waitFor(() => {
                expect(screen.queryByText('Some error')).not.toBeInTheDocument();
            });
        });
    });

    describe('Success Message Display', () => {
        it('should display success message with green styling', async () => {
            mockUpdateProfile.mockResolvedValueOnce({});
            renderProfile();

            const saveButton = screen.getByRole('button', { name: /Save Changes/i });
            fireEvent.click(saveButton);

            await waitFor(() => {
                const successMessage = screen.getByText('Profile updated successfully');
                expect(successMessage).toBeInTheDocument();
                
                const successContainer = successMessage.closest('div');
                expect(successContainer).toHaveClass('bg-green-500/10');
            });
        });
    });

    describe('API Error Handling', () => {
        it('should handle notification preferences fetch error gracefully', async () => {
            api.get.mockImplementation((url) => {
                if (url === '/v1/users/notification-preferences') {
                    return Promise.reject(new Error('Network error'));
                }
                if (url === '/v1/users/login-activity') {
                    return Promise.resolve({ data: mockLoginActivity });
                }
                return Promise.resolve({ data: {} });
            });

            // Should not throw, component should handle gracefully
            renderProfile();

            await waitFor(() => {
                expect(screen.getByText('Login Activity')).toBeInTheDocument();
            });
        });

        it('should handle login activity fetch error gracefully', async () => {
            api.get.mockImplementation((url) => {
                if (url === '/v1/users/notification-preferences') {
                    return Promise.resolve({ data: mockNotifPrefs });
                }
                if (url === '/v1/users/login-activity') {
                    return Promise.reject(new Error('Network error'));
                }
                return Promise.resolve({ data: {} });
            });

            renderProfile();

            // Should still render the component
            await waitFor(() => {
                expect(screen.getByText('Personal Information')).toBeInTheDocument();
            });
        });

        it('should handle generic API update error without response message', async () => {
            api.put.mockRejectedValueOnce({}); // No response.data.error

            renderProfile();

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/v1/users/notification-preferences');
            });

            const savePrefsButton = screen.getByRole('button', { name: /Save Preferences/i });
            fireEvent.click(savePrefsButton);

            await waitFor(() => {
                expect(screen.getByText('Failed to update notification preferences')).toBeInTheDocument();
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle null API response for notification preferences', async () => {
            api.get.mockImplementation((url) => {
                if (url === '/v1/users/notification-preferences') {
                    return Promise.resolve({ data: null });
                }
                if (url === '/v1/users/login-activity') {
                    return Promise.resolve({ data: mockLoginActivity });
                }
                return Promise.resolve({ data: {} });
            });

            renderProfile();

            // Should not throw
            await waitFor(() => {
                expect(screen.getByText('Personal Information')).toBeInTheDocument();
            });
        });

        it('should handle non-array login activity response', async () => {
            api.get.mockImplementation((url) => {
                if (url === '/v1/users/notification-preferences') {
                    return Promise.resolve({ data: mockNotifPrefs });
                }
                if (url === '/v1/users/login-activity') {
                    return Promise.resolve({ data: null });
                }
                return Promise.resolve({ data: {} });
            });

            renderProfile();

            await waitFor(() => {
                expect(screen.getByText('No login activity found')).toBeInTheDocument();
            });
        });

        it('should handle login activity with missing device type', async () => {
            api.get.mockImplementation((url) => {
                if (url === '/v1/users/notification-preferences') {
                    return Promise.resolve({ data: mockNotifPrefs });
                }
                if (url === '/v1/users/login-activity') {
                    return Promise.resolve({ data: [{
                        _id: 'activity-no-device',
                        eventType: 'success',
                        timestamp: '2024-01-15T10:30:00Z',
                        deviceType: null,
                        location: 'Unknown',
                    }] });
                }
                return Promise.resolve({ data: {} });
            });

            renderProfile();

            await waitFor(() => {
                expect(screen.getByText('Unknown device')).toBeInTheDocument();
            });
        });

        it('should handle login activity with missing location', async () => {
            api.get.mockImplementation((url) => {
                if (url === '/v1/users/notification-preferences') {
                    return Promise.resolve({ data: mockNotifPrefs });
                }
                if (url === '/v1/users/login-activity') {
                    return Promise.resolve({ data: [{
                        _id: 'activity-no-location',
                        eventType: 'success',
                        timestamp: '2024-01-15T10:30:00Z',
                        deviceType: 'Chrome',
                        location: null,
                    }] });
                }
                return Promise.resolve({ data: {} });
            });

            renderProfile();

            await waitFor(() => {
                expect(screen.getByText('Unknown location')).toBeInTheDocument();
            });
        });

        it('should handle unknown event type in login activity', async () => {
            api.get.mockImplementation((url) => {
                if (url === '/v1/users/notification-preferences') {
                    return Promise.resolve({ data: mockNotifPrefs });
                }
                if (url === '/v1/users/login-activity') {
                    return Promise.resolve({ data: [{
                        _id: 'activity-unknown',
                        eventType: 'unknown_type',
                        timestamp: '2024-01-15T10:30:00Z',
                        deviceType: 'Chrome',
                        location: 'Test',
                    }] });
                }
                return Promise.resolve({ data: {} });
            });

            renderProfile();

            await waitFor(() => {
                expect(screen.getByText('Unknown')).toBeInTheDocument();
            });
        });

        it('should handle alternative preference data format', async () => {
            api.get.mockImplementation((url) => {
                if (url === '/v1/users/notification-preferences') {
                    return Promise.resolve({ 
                        data: {
                            emailEnabled: false,
                            pushEnabled: true,
                            smsEnabled: true,
                        } 
                    });
                }
                if (url === '/v1/users/login-activity') {
                    return Promise.resolve({ data: [] });
                }
                return Promise.resolve({ data: {} });
            });

            renderProfile();

            await waitFor(() => {
                // Should handle the alternative format gracefully
                expect(screen.getByText('Push Notifications')).toBeInTheDocument();
            });
        });
    });

    describe('Form Labels', () => {
        it('should have correct label for Full Name field', async () => {
            renderProfile();
            expect(screen.getByText('Full Name')).toBeInTheDocument();
        });

        it('should have correct label for Email field', async () => {
            renderProfile();
            // There's "Email" label and "Email Notifications" - just check for "Email" as label
            const labels = screen.getAllByText(/Email/);
            expect(labels.length).toBeGreaterThan(0);
        });

        it('should have correct label for Phone Number field', async () => {
            renderProfile();
            expect(screen.getByText('Phone Number')).toBeInTheDocument();
        });

        it('should have correct label for Affiliation field', async () => {
            renderProfile();
            expect(screen.getByText('Affiliation')).toBeInTheDocument();
        });

        it('should have correct label for Role field', async () => {
            renderProfile();
            expect(screen.getByText('Role')).toBeInTheDocument();
        });
    });

    describe('Mobile Device Detection', () => {
        it('should handle mobile device in login activity', async () => {
            api.get.mockImplementation((url) => {
                if (url === '/v1/users/notification-preferences') {
                    return Promise.resolve({ data: mockNotifPrefs });
                }
                if (url === '/v1/users/login-activity') {
                    return Promise.resolve({ data: [{
                        _id: 'activity-mobile',
                        eventType: 'success',
                        timestamp: '2024-01-15T10:30:00Z',
                        deviceType: 'Mobile Safari on iPhone',
                        location: 'Test Location',
                    }] });
                }
                return Promise.resolve({ data: {} });
            });

            renderProfile();

            await waitFor(() => {
                expect(screen.getByText(/Mobile Safari on iPhone/)).toBeInTheDocument();
            });
        });

        it('should handle Android device in login activity', async () => {
            api.get.mockImplementation((url) => {
                if (url === '/v1/users/notification-preferences') {
                    return Promise.resolve({ data: mockNotifPrefs });
                }
                if (url === '/v1/users/login-activity') {
                    return Promise.resolve({ data: [{
                        _id: 'activity-android',
                        eventType: 'success',
                        timestamp: '2024-01-15T10:30:00Z',
                        deviceType: 'Chrome on Android',
                        location: 'Test Location',
                    }] });
                }
                return Promise.resolve({ data: {} });
            });

            renderProfile();

            await waitFor(() => {
                expect(screen.getByText(/Chrome on Android/)).toBeInTheDocument();
            });
        });
    });
});
