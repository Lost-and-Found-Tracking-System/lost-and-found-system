import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login({
                email: formData.email,
                password: formData.password,
            });

            // Redirect based on role (role comes from backend)
            if (user.role === 'admin' || user.role === 'delegated_admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError(err.error || err.message || 'Invalid email or password');
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

                {/* Login Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl p-8 border border-slate-800">
                    <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Email</label>
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

                        {/* Password */}
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-primary-500 transition-colors pr-12"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
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
                                    Authenticating...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Links */}
                    <div className="mt-6 text-center space-y-2">
                        <Link to="/register" className="text-primary-400 hover:text-primary-300 text-sm block">
                            Don't have an account? Register
                        </Link>
                        <Link to="/register-visitor" className="text-slate-500 hover:text-slate-400 text-sm block">
                            Visitor? Get temporary access
                        </Link>
                        <Link to="/" className="text-slate-500 hover:text-slate-400 text-sm block">
                            ← Back to Home
                        </Link>
                    </div>
                </div>

                {/* Test Credentials Info (remove in production) */}
                <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                    <p className="text-slate-400 text-xs text-center mb-2">Test Credentials (Development Only)</p>
                    <div className="text-slate-500 text-xs space-y-1">
                        <p><span className="text-slate-400">Student:</span> student@example.com / Student@123</p>
                        <p><span className="text-slate-400">Faculty:</span> faculty@example.com / Faculty@123</p>
                        <p><span className="text-slate-400">Admin:</span> admin@example.com / Admin@123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;