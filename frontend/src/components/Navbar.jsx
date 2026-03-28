import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useNotification } from '../NotificationContext';
import { FaBars, FaTimes, FaBell, FaQuestionCircle } from 'react-icons/fa';
import api from '../api';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { showToast } = useNotification();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [showNotifs, setShowNotifs] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Optional: poll every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.filter(n => !n.read_at));
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/read`);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch (err) {
            console.error("Failed to mark read", err);
        }
    };

    return (
        <nav className="glass sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link to="/" className="text-2xl font-bold heading-gradient">JasaJoki</Link>

                    <div className="hidden md:flex items-center space-x-6">
                        <Link to="/" className="text-slate-300 hover:text-white transition">Beranda</Link>

                        {user ? (
                            <>
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-slate-300 hover:text-white transition">Dashboard</Link>
                                {user.role !== 'admin' && <Link to="/revisions" className="text-slate-300 hover:text-white transition">Revisi</Link>}
                                
                                {/* Notification Bell */}
                                <div className="relative">
                                    <button 
                                        onClick={() => setShowNotifs(!showNotifs)}
                                        className="p-2 rounded-full hover:bg-white/10 text-slate-300 transition relative"
                                    >
                                        <FaBell size={20} />
                                        {notifications.length > 0 && (
                                            <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-bounce">
                                                {notifications.length}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifs && (
                                        <div className="absolute right-0 mt-2 w-72 glass border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2 z-[100]">
                                            <div className="px-4 py-2 border-b border-white/5 flex justify-between items-center">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Notifikasi</span>
                                                {notifications.length > 0 && <button className="text-[10px] text-blue-400 hover:underline">Baca Semua</button>}
                                            </div>
                                            <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                                {notifications.length === 0 ? (
                                                    <div className="px-4 py-8 text-center text-xs text-slate-500">Tidak ada notifikasi baru</div>
                                                ) : (
                                                    notifications.map(n => (
                                                        <div key={n.id} className="px-4 py-3 hover:bg-white/5 transition flex flex-col gap-1 border-b border-white/5 last:border-0 group cursor-pointer" onClick={() => markAsRead(n.id)}>
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-xs font-bold text-white leading-tight">{n.data.title}</p>
                                                                <span className="text-[8px] text-slate-500">{new Date(n.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 line-clamp-2">{n.data.message}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button onClick={logout} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition">Logout</button>
                            </>
                        ) : (
                            <Link to="/login" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-500/30">Login</Link>
                        )}
                    </div>

                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-300 hover:text-white focus:outline-none">
                            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-slate-800 border-t border-slate-700">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md">Beranda</Link>
                        {user ? (
                            <>
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="block px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md">Dashboard</Link>
                                <button onClick={logout} className="w-full text-left block px-3 py-2 text-red-400 hover:bg-slate-700 rounded-md">Logout</button>
                            </>
                        ) : (
                            <Link to="/login" className="block px-3 py-2 text-blue-400 hover:bg-slate-700 rounded-md">Login</Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
