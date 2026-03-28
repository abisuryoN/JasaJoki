import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import {
    FaEdit, FaUpload, FaCheck, FaTimes, FaExternalLinkAlt,
    FaEye, FaFileInvoiceDollar, FaExclamationTriangle, FaCheckCircle,
    FaSyncAlt, FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import OrderDetail from '../components/OrderDetail';
import FilePreviewModal from '../components/FilePreviewModal';
import { getEcho } from '../utils/echo';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        per_page: 10
    });
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ status: '' });
    const [fileInput, setFileInput] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState({ url: '', name: '' });

    useEffect(() => {
        fetchOrders();

        const echo = getEcho();
        if (!echo) return;

        echo.channel('admin-orders')
            .listen('OrderStatusUpdated', () => {
                fetchOrders(pagination.current_page);
            });

        return () => echo.leave('admin-orders');
    }, [pagination.current_page]);

    const fetchOrders = async (page = 1, perPage = pagination.per_page) => {
        setLoading(true);
        try {
            const res = await api.get(`/orders?page=${page}&per_page=${perPage}`);
            setOrders(res.data.data || []);
            setPagination({
                current_page: res.data.current_page,
                last_page: res.data.last_page,
                total: res.data.total,
                per_page: res.data.per_page
            });
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (order) => {
        setEditingId(order.id);
        setEditForm({ status: order.status });
    };

    const handleSaveEdit = async (id) => {
        try {
            await api.put(`/orders/${id}`, editForm);
            setEditingId(null);
            fetchOrders();
        } catch (error) {
            console.error('Failed to update order', error);
            alert('Gagal mengupdate order.');
        }
    };

    const handleFileUpload = async (e, id) => {
        e.preventDefault();
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingId(id);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await api.post(`/orders/${id}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchOrders();
            alert('File hasil berhasil diupload!');
        } catch (error) {
            console.error('Upload failed', error);
            alert('Gagal mengupload file hasil.');
        } finally {
            setUploadingId(null);
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'process': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'revision': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'done': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    if (loading && orders.length === 0) return <div className="p-8 text-slate-400 flex items-center gap-2"><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /> Loading orders...</div>;

    return (
        <div className="pb-10 space-y-8">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <h1 className="text-4xl font-black text-white tracking-tight">Manajemen Order</h1>
                    <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-3">Show</span>
                        <select
                            value={pagination.per_page}
                            onChange={(e) => fetchOrders(1, e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-3 py-1.5 outline-none focus:border-blue-500 transition-all"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
                <button onClick={() => fetchOrders(pagination.current_page)} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all active:rotate-180 duration-500">
                    <FaSyncAlt />
                </button>
            </div>

            <div className="glass rounded-[32px] border-slate-700/50 overflow-hidden bg-slate-900/40">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-max">
                        <thead>
                            <tr className="border-b border-slate-800/50 bg-slate-950/30">
                                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Info Order</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Klien & Pembayaran</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">Update Hasil</th>
                                <th className="py-5 px-6 text-[11px] font-black text-slate-500 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                            {orders.map(order => (
                                <tr key={order.id} className="hover:bg-blue-500/[0.02] transition-colors group">
                                    <td className="py-6 px-6">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-bold text-slate-600 block">ID #{order.id}</span>
                                            <div className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{order.title}</div>
                                            {order.status === 'revision' && (
                                                <div className="mt-2 p-3 bg-purple-500/5 border border-purple-500/10 rounded-lg max-w-[200px]">
                                                    <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest block mb-1">Permintaan Revisi:</span>
                                                    <p className="text-[11px] text-slate-400 leading-relaxed italic line-clamp-2">"{order.revision_reason || 'Tidak ada detail'}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-6 px-6">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm font-bold text-slate-300">{order.user?.name || order.guest_name || 'Guest'}</div>
                                                <div className="text-[10px] text-slate-500">{order.user?.email || 'No Email'}</div>
                                            </div>
                                            {order.payment_proof ? (
                                                <button
                                                    onClick={() => {
                                                        setPreviewFile({
                                                            url: `/orders/${order.id}/payment-proof`,
                                                            name: `Bukti Bayar Order #${order.id}`
                                                        });
                                                        setIsPreviewOpen(true);
                                                    }}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold transition-all"
                                                >
                                                    <FaFileInvoiceDollar /> Lihat Bukti Bayar
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 text-orange-500/50 text-[10px] font-bold px-3 py-1.5 border border-orange-500/10 rounded-lg w-fit">
                                                    <FaExclamationTriangle size={10} /> Menunggu Pembayaran
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-6 px-6">
                                        <div className="flex flex-col items-center gap-2">
                                            {editingId === order.id ? (
                                                <select
                                                    value={editForm.status}
                                                    onChange={(e) => setEditForm({ status: e.target.value })}
                                                    className="bg-slate-950 border border-slate-700 text-slate-200 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    <option value="pending">PENDING</option>
                                                    <option value="process">PROCESS</option>
                                                    <option value="revision">REVISION</option>
                                                    <option value="done">DONE</option>
                                                </select>
                                            ) : (
                                                <span className={`px-4 py-2 rounded-xl text-[10px] font-black border tracking-widest transition-all ${getStatusStyle(order.status)}`}>
                                                    {order.status.toUpperCase()}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-6 px-6">
                                        <div className="space-y-2">
                                            <div className="relative group/upload">
                                                <input
                                                    type="file"
                                                    onChange={(e) => handleFileUpload(e, order.id)}
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                />
                                                <div className={`p-3 border-2 border-dashed rounded-2xl flex items-center justify-center gap-2 transition-all ${order.result_path ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-900/50 border-slate-800 group-hover/upload:border-blue-500/50 group-hover/upload:bg-blue-500/5'}`}>
                                                    {uploadingId === order.id ? (
                                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <FaUpload className={order.result_path ? 'text-emerald-500' : 'text-slate-600'} />
                                                            <span className="text-[10px] font-bold text-slate-500">{order.result_path ? 'GANTI HASIL' : 'UPLOAD HASIL'}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            {order.result_path && (
                                                <div className="flex items-center gap-1.5 text-emerald-500 text-[10px] font-black justify-center">
                                                    <FaCheckCircle /> READY TO DOWNLOAD
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-6 px-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {editingId === order.id ? (
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleSaveEdit(order.id)} className="w-10 h-10 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 rounded-xl flex items-center justify-center transition-all"><FaCheck /></button>
                                                    <button onClick={() => setEditingId(null)} className="w-10 h-10 bg-slate-800 text-slate-400 hover:bg-slate-700 rounded-xl flex items-center justify-center transition-all"><FaTimes /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => setViewingOrder(order)}
                                                        className="w-10 h-10 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl flex items-center justify-center transition-all shadow-sm"
                                                        title="View Details"
                                                    >
                                                        <FaEye size={14} />
                                                    </button>
                                                    <button onClick={() => handleEditClick(order)} className="px-5 py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shadow-sm">
                                                        <FaEdit size={12} /> Manage
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {pagination.last_page > 1 && (
                <div className="flex items-center justify-between px-8 py-6 glass rounded-[32px] border-white/5">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                        Showing <span className="text-white">{(pagination.current_page - 1) * pagination.per_page + 1}</span> – <span className="text-white">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> of <span className="text-white">{pagination.total}</span> orders
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={pagination.current_page === 1 || loading}
                            onClick={() => fetchOrders(pagination.current_page - 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-white disabled:opacity-30 hover:bg-slate-700 transition active:scale-95 border border-slate-700"
                        >
                            <FaChevronLeft size={10} />
                        </button>
                        <div className="flex items-center gap-1 mx-2">
                            {[...Array(pagination.last_page)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => fetchOrders(i + 1)}
                                    className={`w-10 h-10 rounded-xl text-xs font-black transition ${pagination.current_page === i + 1
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                            : 'bg-slate-800 text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            disabled={pagination.current_page === pagination.last_page || loading}
                            onClick={() => fetchOrders(pagination.current_page + 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-800 text-white disabled:opacity-30 hover:bg-slate-700 transition active:scale-95 border border-slate-700"
                        >
                            <FaChevronRight size={10} />
                        </button>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {viewingOrder && (
                    <OrderDetail
                        order={viewingOrder}
                        onClose={() => setViewingOrder(null)}
                    />
                )}
            </AnimatePresence>

            <FilePreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                fileUrl={previewFile.url}
                fileName={previewFile.name}
            />
        </div>
    );
}