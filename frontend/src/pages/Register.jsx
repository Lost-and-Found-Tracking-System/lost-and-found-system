import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, Sparkles, UserPlus } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        affiliation: '',
        institutionalId: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            await register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                phone: formData.phone || undefined,
                affiliation: formData.affiliation || undefined,
                institutionalId: formData.institutionalId || undefined,
            });

            // Registration successful - redirect to dashboard
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration failed:', err);
            setError(err.error || err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
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
                    <p className="text-slate-400 mt-2">Neural Recovery System</p>
                </div>

                {/* Register Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-800">
                    <div className="flex items-center gap-3 mb-6">
                        <UserPlus size={24} className="text-primary-500" />
                        <h2 className="text-2xl font-bold text-white">Create Account</h2>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
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

                        {/* Email */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Email *</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
                                placeholder="you@amrita.edu"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* Institutional ID */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Institutional ID (Optional)</label>
                            <input
                                type="text"
                                value={formData.institutionalId}
                                onChange={(e) => setFormData({ ...formData, institutionalId: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
                                placeholder="e.g., CB.EN.U4CSE22001"
                                disabled={loading}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Password *</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors pr-12"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <p className="text-slate-500 text-xs mt-1">Minimum 8 characters</p>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Confirm Password *</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors pr-12"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Phone (Optional)</label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
                                placeholder="+91 9876543210"
                                disabled={loading}
                            />
                        </div>

                        {/* Affiliation */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Affiliation (Optional)</label>
                            <input
                                type="text"
                                value={formData.affiliation}
                                onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors"
                                placeholder="e.g., CSE Department"
                                disabled={loading}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="mt-6 text-center space-y-2">
                        <Link to="/login" className="text-primary-400 hover:text-primary-300 text-sm block">
                            Already have an account? Sign In
                        </Link>
                        <Link to="/register-visitor" className="text-slate-500 hover:text-slate-400 text-sm block">
                            Visitor? Get temporary access
                        </Link>
                        <Link to="/" className="text-slate-500 hover:text-slate-400 text-sm block">
                            ← Back to Home
                        </Link>
                    </div>
                </div>

                {/* Info */}
                <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-xs text-center">
                        By registering, you'll be assigned a <span className="text-primary-400">Student</span> role by default.
                        Contact an administrator to upgrade your role if needed.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;