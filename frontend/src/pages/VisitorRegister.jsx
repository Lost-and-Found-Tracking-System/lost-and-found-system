import React, { useState } from 'react';
import { Smartphone, CheckCircle, ArrowRight, Shield, BellRing } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const VisitorRegister = () => {
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState(['', '', '', '']);
    const [showOtp, setShowOtp] = useState(false);
    const navigate = useNavigate();

    const handleRequestOtp = (e) => {
        e.preventDefault();
        setStep(2);
        setShowOtp(true);
        // Hide the mock notification after 10 seconds
        setTimeout(() => setShowOtp(false), 10000);
    };

    const handleVerify = (e) => {
        e.preventDefault();
        setStep(3);
        setShowOtp(false);
        setTimeout(() => navigate('/dashboard'), 2000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
            <motion.div
                layout
                className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-10 overflow-hidden relative shadow-2xl"
            >
                <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Shield size={120} />
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <h2 className="text-3xl font-extrabold text-white">Visitor Access</h2>
                                <p className="text-slate-400 text-sm">Valid for 24 hours. Enter your mobile number to receive an OTP.</p>
                            </div>

                            <form onSubmit={handleRequestOtp} className="space-y-4">
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">+91</div>
                                    <input
                                        type="tel"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-16 pr-4 py-4 text-xl text-white font-mono focus:ring-2 focus:ring-primary-500/50 outline-none"
                                        placeholder="99999 99999"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                </div>
                                <button className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group">
                                    Send OTP <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2 text-center">
                                <h2 className="text-2xl font-bold text-white">Verify OTP</h2>
                                <p className="text-slate-400 text-sm">We've sent a 4-digit code to {phone}</p>
                            </div>

                            <form onSubmit={handleVerify} className="space-y-8">
                                <div className="flex justify-between gap-4">
                                    {otp.map((val, i) => (
                                        <input
                                            key={i}
                                            type="text"
                                            maxLength="1"
                                            className="w-16 h-16 bg-slate-950 border border-slate-800 rounded-xl text-center text-3xl font-bold text-primary-400 focus:ring-2 focus:ring-primary-500/50 outline-none"
                                            value={val}
                                            onChange={(e) => {
                                                const newOtp = [...otp];
                                                newOtp[i] = e.target.value;
                                                setOtp(newOtp);
                                                if (e.target.value && e.target.nextSibling) e.target.nextSibling.focus();
                                            }}
                                        />
                                    ))}
                                </div>
                                <button className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl transition-all">
                                    Verify & Continue
                                </button>
                                <p className="text-center text-xs text-slate-500">
                                    Didn't receive it? <button type="button" className="text-primary-500">Resend Code</button>
                                </p>
                            </form>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12 text-center space-y-4"
                        >
                            <div className="inline-flex p-4 bg-green-500/10 text-green-500 rounded-full mb-4">
                                <CheckCircle size={64} />
                            </div>
                            <h2 className="text-2xl font-extrabold text-white">Access Granted!</h2>
                            <p className="text-slate-400">Welcome to Amrita Campus Lost & Found. Redirecting...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Mock OTP Notification Toast */}
            <AnimatePresence>
                {showOtp && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm"
                    >
                        <div className="mx-4 bg-primary-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-primary-400">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <BellRing size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest opacity-80">Mock SMS Received</p>
                                    <p className="font-bold text-lg">Your OTP is: <span className="bg-white text-primary-600 px-2 rounded ml-1">1234</span></p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowOtp(false)}
                                className="text-white/50 hover:text-white transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VisitorRegister;
