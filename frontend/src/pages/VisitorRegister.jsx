import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, User, Mail, Loader2, Sparkles, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const VisitorRegister = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // Get login function from AuthContext
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const [formData, setFormData] = useState({
        phone: '',
        fullName: '',
        email: '',
        otp: '',
    });

    const [registrationResult, setRegistrationResult] = useState(null);

    // Step 1: Request OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // Basic phone validation
        let phone = formData.phone.trim();
        
        // Add +91 if not present (assuming Indian numbers)
        if (!phone.startsWith('+')) {
            if (phone.length === 10) {
                phone = '+91' + phone;
            } else {
                phone = '+' + phone;
            }
        }

        try {
            const response = await api.post('/v1/auth/visitor/request-otp', { phone });
            
            setFormData({ ...formData, phone });
            setSuccess(`OTP sent to ${phone}. Valid for ${response.data.expiresIn / 60} minutes.`);
            setStep(2);
        } catch (err) {
            console.error('OTP request failed:', err);
            setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and complete registration
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await api.post('/v1/auth/visitor/verify', {
                phone: formData.phone,
                fullName: formData.fullName,
                email: formData.email || undefined,
                otp: formData.otp,
            });

            const { accessToken, refreshToken, userId, expiresAt } = response.data;

            // Save tokens to localStorage
            if (accessToken) {
                localStorage.setItem('token', accessToken);
                
                // Create user object for localStorage
                const userData = {
                    id: userId,
                    fullName: formData.fullName,
                    email: formData.email || '',
                    phone: formData.phone,
                    role: 'visitor',
                    visitorExpiresAt: expiresAt,
                };
                localStorage.setItem('user', JSON.stringify(userData));
            }

            setRegistrationResult(response.data);
            setSuccess('Registration successful! Redirecting to dashboard...');
            setStep(3);

            // Auto-redirect to dashboard after 2 seconds
            setTimeout(() => {
                // Force page reload to update AuthContext
                window.location.href = '/dashboard';
            }, 2000);

        } catch (err) {
            console.error('Verification failed:', err);
            setError(err.response?.data?.error || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.post('/v1/auth/visitor/request-otp', { phone: formData.phone });
            setSuccess('OTP resent successfully!');
        } catch (err) {
            console.error('Resend OTP failed:', err);
            setError(err.response?.data?.error || 'Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    };

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-2.5 bg-gradient-to-tr from-primary-600 to-indigo-600 rounded-xl shadow-lg shadow-primary-500/20">
                            <Sparkles size={24} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight">
                        LOST<span className="text-primary-500">&</span>FOUND
                    </h1>
                    <p className="text-slate-400 mt-2">Visitor Registration</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                s === step
                                    ? 'w-8 bg-primary-500'
                                    : s < step
                                    ? 'w-8 bg-green-500'
                                    : 'w-8 bg-slate-700'
                            }`}
                        />
                    ))}
                </div>

                {/* Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-800 overflow-hidden">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm flex items-center gap-2">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {success && step !== 3 && (
                        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 text-sm flex items-center gap-2">
                            <CheckCircle size={18} />
                            {success}
                        </div>
                    )}

                    <AnimatePresence mode="wait" custom={step}>
                        {/* Step 1: Phone Number */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                custom={1}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <Phone size={24} className="text-primary-500" />
                                    <h2 className="text-2xl font-bold text-white">Enter Phone Number</h2>
                                </div>

                                <form onSubmit={handleRequestOtp} className="space-y-4">
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
                                            placeholder="+91 9876543210"
                                            required
                                            disabled={loading}
                                        />
                                        <p className="text-slate-500 text-xs mt-1">Enter your phone number with country code</p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 size={20} className="animate-spin" />
                                                Sending OTP...
                                            </>
                                        ) : (
                                            <>
                                                Send OTP
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 2: OTP & Details */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                custom={1}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <User size={24} className="text-primary-500" />
                                    <h2 className="text-2xl font-bold text-white">Verify & Complete</h2>
                                </div>

                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    {/* OTP */}
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">OTP Code</label>
                                        <input
                                            type="text"
                                            value={formData.otp}
                                            onChange={(e) => setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-2xl tracking-widest focus:outline-none focus:border-primary-500 transition-colors"
                                            placeholder="000000"
                                            maxLength={6}
                                            required
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={loading}
                                            className="text-primary-400 hover:text-primary-300 text-sm mt-2"
                                        >
                                            Didn't receive? Resend OTP
                                        </button>
                                    </div>

                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">Full Name *</label>
                                        <input
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
                                            placeholder="John Doe"
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    {/* Email (Optional) */}
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">Email (Optional)</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
                                            placeholder="you@example.com"
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            disabled={loading}
                                            className="flex-1 py-4 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-700/50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ArrowLeft size={20} />
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || formData.otp.length !== 6}
                                            className="flex-1 py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    Verifying...
                                                </>
                                            ) : (
                                                <>
                                                    Verify
                                                    <ArrowRight size={20} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}

                        {/* Step 3: Success - Auto redirecting */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                custom={1}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="text-center"
                            >
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle size={40} className="text-green-500" />
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-2">Registration Complete!</h2>
                                <p className="text-slate-400 mb-6">
                                    Your temporary visitor account has been created.
                                </p>

                                {registrationResult && (
                                    <div className="bg-slate-800/50 rounded-xl p-4 mb-6 text-left">
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">User ID:</span>
                                                <span className="text-white font-mono">{registrationResult.userId?.slice(-8) || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400">Access Expires:</span>
                                                <span className="text-yellow-400">
                                                    {registrationResult.expiresAt 
                                                        ? new Date(registrationResult.expiresAt).toLocaleString() 
                                                        : '24 hours'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 mb-6">
                                    <p className="text-yellow-400 text-sm">
                                        ⚠️ Your temporary account will expire in 24 hours. You can report lost items during this period.
                                    </p>
                                </div>

                                {/* Auto-redirect message */}
                                <div className="flex items-center justify-center gap-2 text-primary-400">
                                    <Loader2 size={20} className="animate-spin" />
                                    <span>Redirecting to dashboard...</span>
                                </div>

                                {/* Manual button as fallback */}
                                <button
                                    onClick={() => window.location.href = '/dashboard'}
                                    className="w-full mt-4 py-4 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors"
                                >
                                    Go to Dashboard
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Links */}
                    {step !== 3 && (
                        <div className="mt-6 text-center space-y-2">
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 text-sm block">
                                Already have an account? Sign In
                            </Link>
                            <Link to="/register" className="text-slate-500 hover:text-slate-400 text-sm block">
                                Student/Faculty? Register here
                            </Link>
                            <Link to="/" className="text-slate-500 hover:text-slate-400 text-sm block">
                                ← Back to Home
                            </Link>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-xs text-center">
                        Visitor accounts are temporary and expire after 24 hours.
                        For permanent access, please register as a student or faculty member.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VisitorRegister;