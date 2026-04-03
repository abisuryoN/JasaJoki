import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import { FaGoogle, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loginInput, setLoginInput] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/auth/login', { login: loginInput, password });
            login(res.data.access_token, res.data.user);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/dashboard');
        } catch (err) {
            setError('Login gagal. Periksa kembali email/username dan password.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8000/api/auth/google';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
            {/* Animated Background Gradients */}
            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px]" 
            />
            <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/20 rounded-full blur-[120px]" 
            />

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="glass max-w-md w-full p-10 rounded-3xl relative z-10 border border-slate-700/50 shadow-2xl"
            >
                <div className="text-center mb-10">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
                        className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-emerald-400 rounded-2xl mx-auto mb-6 shadow-lg shadow-blue-500/30 flex items-center justify-center transform -rotate-6"
                    >
                        <span className="text-white font-bold text-2xl tracking-tighter">JJ</span>
                    </motion.div>
                    <h2 className="text-3xl font-bold text-white mb-2">Selamat Datang</h2>
                    <p className="text-slate-400 text-sm">Masuk ke akun DualCode Anda</p>
                </div>
                
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm text-center mb-6"
                    >
                        {error}
                    </motion.div>
                )}

                <form className="space-y-5" onSubmit={handleEmailLogin}>
                    <div className="space-y-4">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                <FaEnvelope />
                            </div>
                            <input
                                id="login"
                                type="text"
                                required
                                className="block w-full pl-11 pr-4 py-3.5 border border-slate-700/50 rounded-xl bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium text-sm"
                                placeholder="Alamat Email / Username"
                                value={loginInput}
                                onChange={(e) => setLoginInput(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                                <FaLock />
                            </div>
                            <input
                                id="password"
                                type="password"
                                required
                                className="block w-full pl-11 pr-4 py-3.5 border border-slate-700/50 rounded-xl bg-slate-900/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-medium text-sm"
                                placeholder="Kata Sandi"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-500 transition-all disabled:opacity-70 overflow-hidden"
                    >
                        <span className="relative z-10">{loading ? 'Memproses...' : 'Masuk Sekarang'}</span>
                        {!loading && <FaArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                        <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 transform origin-left transition-transform duration-300 ease-out" />
                    </button>
                </form>

                <div className="mt-8 relative flex items-center justify-center">
                    <div className="absolute w-full border-t border-slate-700/50"></div>
                    <span className="relative px-4 text-xs font-medium text-slate-500 bg-slate-800/20 backdrop-blur-sm rounded-full">
                        Atau Lanjutkan Dengan
                    </span>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-slate-700/50 rounded-xl bg-slate-800/40 text-sm font-bold text-slate-200 hover:bg-slate-700 hover:border-slate-600 transition-all shadow-sm"
                    >
                        <FaGoogle className="text-red-400 text-lg" />
                        Google Account
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
