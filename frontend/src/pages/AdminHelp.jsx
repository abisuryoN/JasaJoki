import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaQuestionCircle } from 'react-icons/fa';
import { useNotification } from '../NotificationContext';

export default function AdminHelp() {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingPage, setEditingPage] = useState(null);
    const [formData, setFormData] = useState({ title: '', slug: '', content: '', type: 'faq' });
    const { showToast } = useNotification();

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            const res = await api.get('/help-pages');
            setPages(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingPage) {
                await api.put(`/help-pages/${editingPage.id}`, formData);
                showToast('Halaman diperbarui', 'success');
            } else {
                await api.post('/help-pages', formData);
                showToast('Halaman baru ditambahkan', 'success');
            }
            setEditingPage(null);
            setFormData({ title: '', slug: '', content: '', type: 'faq' });
            fetchPages();
        } catch (err) {
            showToast('Gagal menyimpan halaman', 'error');
        }
    };

    const deletePage = async (id) => {
        if (!window.confirm('Hapus halaman ini?')) return;
        try {
            await api.delete(`/help-pages/${id}`);
            showToast('Halaman dihapus', 'success');
            fetchPages();
        } catch (err) {
            showToast('Gagal menghapus', 'error');
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500">Memuat halaman bantuan...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white flex items-center gap-3">
                    Manajemen Bantuan <FaQuestionCircle className="text-blue-500" />
                </h1>
                <button 
                    onClick={() => { setEditingPage(null); setFormData({ title: '', slug: '', content: '', type: 'faq' }); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold transition shadow-lg shadow-blue-500/20"
                >
                    <FaPlus /> Tambah Baru
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* List */}
                <div className="space-y-4">
                    {pages.map(page => (
                        <div key={page.id} className="glass p-4 rounded-2xl border-white/5 flex items-center justify-between group">
                            <div>
                                <h3 className="font-bold text-white">{page.title}</h3>
                                <p className="text-[10px] text-slate-500 uppercase font-black">{page.type} • /{page.slug}</p>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button onClick={() => { setEditingPage(page); setFormData(page); }} className="p-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20"><FaEdit /></button>
                                <button onClick={() => deletePage(page.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"><FaTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Form */}
                <div className="glass p-8 rounded-[32px] border-white/10 sticky top-24">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        {editingPage ? <FaEdit className="text-blue-400" /> : <FaPlus className="text-emerald-400" />}
                        {editingPage ? 'Edit Halaman' : 'Halaman Baru'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Judul</label>
                            <input 
                                type="text"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-') })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Slug (URL)</label>
                            <input 
                                type="text"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.slug}
                                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Tipe</label>
                            <select 
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="faq">FAQ</option>
                                <option value="tc">Syarat & Ketentuan</option>
                                <option value="contact">Kontak</option>
                                <option value="other">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Konten (Markdown/HTML Support)</label>
                            <textarea 
                                rows="8"
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                value={formData.content}
                                onChange={e => setFormData({ ...formData, content: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition">
                                <FaSave /> Simpan Halaman
                            </button>
                            {editingPage && (
                                <button type="button" onClick={() => setEditingPage(null)} className="px-6 py-4 bg-slate-800 text-slate-400 rounded-xl font-bold hover:bg-slate-700 transition">
                                    Batal
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
