import React, { useState, useEffect } from 'react';
import api from '../api';
import { FaUsers, FaClipboardList, FaComments, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ orders: 0, pending: 0, chats: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ordersRes, chatsRes] = await Promise.all([
                api.get('/orders'),
                api.get('/chat/rooms')
            ]);
            
            // Laravel pagination returns data in .data.data
            const allOrders = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data.data || []);
            const allChats = Array.isArray(chatsRes.data) ? chatsRes.data : [];

            setStats({
                orders: allOrders.length,
                pending: allOrders.filter(o => o.status === 'pending').length,
                chats: allChats.length
            });
            
            setRecentOrders(allOrders.slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
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
        <div className="pb-10">
            <h1 className="text-3xl font-bold text-white mb-8">Ikhtisar Panel Admin</h1>
            
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
                    <h2 className="text-xl font-bold text-white">Order Terbaru</h2>
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
                        <tbody>
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-8 text-center text-slate-500">Belum ada order mamsuk</td>
                                </tr>
                            ) : recentOrders.map(o => (
                                <tr key={o.id} className="border-b border-slate-800/50 hover:bg-slate-800/80 transition-colors">
                                    <td className="py-4 px-4 text-slate-300 max-w-xs truncate">{o.title}</td>
                                    <td className="py-4 px-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${
                                            o.status === 'pending' ? 'bg-slate-800 text-slate-300 border-slate-600' : 
                                            o.status === 'process' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                            o.status === 'done' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                                            'bg-orange-500/20 text-orange-400 border-orange-500/30'
                                        }`}>
                                            {o.status.toUpperCase()}
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
            </div>
        </div>
    );
}
