import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaUsers, FaClipboardList, FaComments, FaCheckCircle, FaChevronLeft, FaChevronRight, FaExclamationTriangle, FaLock, FaKey } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({ orders: 0, pending: 0, chats: 0 });
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
    });

    useEffect(() => {
        fetchData();
    }, [pagination.current_page, pagination.per_page]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/admin/dashboard-stats?page=${pagination.current_page}&per_page=${pagination.per_page}`);
            const data = res.data;

            setStats({
                orders: data.stats.total_orders,
                pending: data.stats.pending_orders,
                chats: data.stats.active_chats
            });
            
            setRecentOrders(data.orders.data || []);
            setPagination({
                current_page: data.orders.current_page,
                last_page: data.orders.last_page,
                per_page: data.orders.per_page,
                total: data.orders.total
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');
        setPasswordLoading(true);

        try {
            const res = await api.post('/auth/change-password', passwordData);
            setPasswordSuccess(res.data.message);
            setIsChangingPassword(false);
            setPasswordData({ current_password: '', new_password: '', new_password_confirmation: '' });
            setTimeout(() => window.location.reload(), 2000);
        } catch (err) {
            setPasswordError(err.response?.data?.error || 'Gagal memperbarui password.');
        } finally {
            setPasswordLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-slate-800 text-slate-300 border-slate-600';
            case 'process': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'done': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'waiting_payment': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
            case 'revision': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
            case 'draft': return 'bg-slate-700/50 text-slate-400 border-slate-600';
            default: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        }
    };

    if (loading && recentOrders.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen text-white bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const statCards = [
        { title: 'Total Order', value: stats.orders, icon: <FaClipboardList size={24} className="text-blue-400" /> },
        { title: 'Order Menunggu', value: stats.pending, icon: <FaCheckCircle size={24} className="text-orange-400" /> },
        { title: 'Total Chat Aktif', value: stats.chats, icon: <FaComments size={24} className="text-emerald-400" /> },
    ];

    return (
        <div className="pb-10 relative">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Ikhtisar Panel Admin</h1>
                <button 
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
                >
                    <FaKey size={14} /> Ganti Password
                </button>
            </div>

            {user?.is_default_password && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl flex items-center gap-4 text-red-400"
                >
                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                        <FaExclamationTriangle size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg">Keamanan Kritis: Akun Default Terdeteksi!</h4>
                        <p className="text-sm opacity-90">Ini akun default segera ganti pw nya demi keamanan sistem.</p>
                    </div>
                </motion.div>
            )}

            {isChangingPassword && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass max-w-md w-full p-8 rounded-[32px] border border-slate-700 shadow-2xl relative"
                    >
                        <button onClick={() => setIsChangingPassword(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition">✕</button>
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <FaLock className="text-blue-500" /> Perbarui Password
                        </h3>

                        {passwordError && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl">{passwordError}</div>}
                        {passwordSuccess && <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm rounded-xl">{passwordSuccess}</div>}

                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Password Saat Ini</label>
                                <input 
                                    type="password" 
                                    required 
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition" 
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Password Baru</label>
                                <input 
                                    type="password" 
                                    required 
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition" 
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Konfirmasi Password Baru</label>
                                <input 
                                    type="password" 
                                    required 
                                    value={passwordData.new_password_confirmation}
                                    onChange={(e) => setPasswordData({...passwordData, new_password_confirmation: e.target.value})}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition" 
                                    placeholder="••••••••"
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={passwordLoading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                            >
                                {passwordLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {statCards.map((stat, i) => (
                    <div key={i} className="glass p-6 rounded-2xl flex items-center justify-between border border-slate-700 hover:border-blue-500/50 transition-colors">
                        <div>
                            <p className="text-slate-400 text-sm mb-1">{stat.title}</p>
                            <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                        </div>
                        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center shadow-inner">
                            {stat.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass rounded-2xl p-6 border border-slate-700">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-white">Order Terbaru</h2>
                        <select 
                            value={pagination.per_page}
                            onChange={(e) => setPagination({...pagination, per_page: parseInt(e.target.value), current_page: 1})}
                            className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg px-2 py-1 outline-none focus:border-blue-500"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                    <Link to="/admin/orders" className="text-sm px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-blue-400 hover:text-blue-300 transition">Lihat Manajemen Order</Link>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="pb-3 px-4 text-slate-400 font-medium pt-2">Judul</th>
                                <th className="pb-3 px-4 text-slate-400 font-medium pt-2">Status</th>
                                <th className="pb-3 px-4 text-slate-400 font-medium pt-2">Klien</th>
                                <th className="pb-3 px-4 text-slate-400 font-medium pt-2 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className={loading ? 'opacity-50 transition-opacity' : 'transition-opacity'}>
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-slate-500">Belum ada order mamsuk</td>
                                </tr>
                            ) : recentOrders.map(o => (
                                <tr key={o.id} className="border-b border-slate-800/50 hover:bg-slate-800/80 transition-colors">
                                    <td className="py-4 px-4 text-slate-300 max-w-xs truncate">{o.title}</td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border uppercase ${getStatusStyle(o.status)}`}>
                                            {o.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                                                {(o.user?.name || o.guest_name || 'G')[0]}
                                            </div>
                                            <span className="truncate">{o.user?.name || o.guest_name || 'Guest'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <Link to="/admin/orders" className="text-blue-400 hover:underline text-sm font-medium">Kelola</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {pagination.last_page > 1 && (
                    <div className="mt-6 flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-medium tracking-wide">
                            SHOWING <span className="text-white">{(pagination.current_page - 1) * pagination.per_page + 1}</span> - <span className="text-white">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> OF <span className="text-white">{pagination.total}</span> ORDERS
                        </p>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setPagination({...pagination, current_page: pagination.current_page - 1})}
                                disabled={pagination.current_page === 1}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                            >
                                <FaChevronLeft size={10} />
                            </button>
                            <div className="flex gap-1">
                                {[...Array(pagination.last_page)].map((_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setPagination({...pagination, current_page: i + 1})}
                                        className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors ${pagination.current_page === i + 1 ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setPagination({...pagination, current_page: pagination.current_page + 1})}
                                disabled={pagination.current_page === pagination.last_page}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
                            >
                                <FaChevronRight size={10} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
