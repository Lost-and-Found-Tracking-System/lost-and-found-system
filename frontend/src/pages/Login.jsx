import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, User, ShieldCheck, LifeBuoy } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login({ email, password, role });
            navigate('/dashboard');
        } catch (err) {
            alert('Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-xl shadow-2xl"
            >
                <div className="text-center">
                    <div className="inline-flex p-3 rounded-xl bg-primary-500/10 text-primary-400 mb-4">
                        <LogIn size={32} />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white">Campus Lost & Found</h2>
                    <p className="mt-2 text-slate-400">Institutional Access Management</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-3 gap-3 mb-6">
                        {[
                            { id: 'student', icon: User, label: 'Student' },
                            { id: 'admin', icon: ShieldCheck, label: 'Admin' },
                            { id: 'visitor', icon: LifeBuoy, label: 'Visitor' },
                        ].map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                onClick={() => setRole(r.id)}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${role === r.id
                                        ? 'border-primary-500 bg-primary-500/10 text-primary-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                                        : 'border-slate-800 bg-slate-800/50 text-slate-500 hover:border-slate-700'
                                    }`}
                            >
                                <r.icon size={20} className="mb-1" />
                                <span className="text-xs font-medium">{r.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Institutional Email</label>
                            <input
                                type="email"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                                placeholder="name@amrita.edu"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2 group"
                    >
                        Sign In
                        <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                            →
                        </motion.span>
                    </button>

                    <div className="flex items-center justify-between text-sm">
                        <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">Forgot password?</a>
                        {role === 'visitor' && (
                            <a href="/register-visitor" className="text-slate-400 hover:text-white transition-colors">Need visitor access?</a>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default Login;
