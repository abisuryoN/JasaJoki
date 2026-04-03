import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaStar, FaSave, FaTimes } from 'react-icons/fa';
import api from '../api';

export default function AdminPackages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPackage, setCurrentPackage] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        price: '',
        features: '',
        is_popular: false,
        sort_order: 0
    });
    
    useEffect(() => {
        fetchPackages();
    }, []);

    const fetchPackages = async () => {
        try {
            const res = await api.get('/packages');
            if (res.data?.success) {
                setPackages(res.data.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (pkg) => {
        setCurrentPackage(pkg);
        setFormData({
            title: pkg.title,
            subtitle: pkg.subtitle || '',
            price: pkg.price,
            features: pkg.features.join('\n'), // join features array into newline-separated string
            is_popular: pkg.is_popular,
            sort_order: pkg.sort_order
        });
        setIsEditing(true);
    };

    const handleCreateNew = () => {
        setCurrentPackage(null);
        setFormData({
            title: '',
            subtitle: '',
            price: '',
            features: '',
            is_popular: false,
            sort_order: 0
        });
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Yakin ingin menghapus paket ini?')) return;
        try {
            await api.delete(`/admin/packages/${id}`);
            fetchPackages();
        } catch (err) {
            alert('Gagal menghapus paket');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const featuresArray = formData.features.split('\n').filter(f => f.trim() !== '');
            const payload = {
                ...formData,
                features: featuresArray
            };

            if (currentPackage) {
                await api.put(`/admin/packages/${currentPackage.id}`, payload);
            } else {
                await api.post('/admin/packages', payload);
            }
            setIsEditing(false);
            fetchPackages();
        } catch (err) {
            alert('Gagal menyimpan paket');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black text-white">Kelola Paket Layanan</h1>
                {!isEditing && (
                    <button 
                        onClick={handleCreateNew}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-lg shadow-blue-500/20"
                    >
                        <FaPlus /> Tambah Paket
                    </button>
                )}
            </div>

            {isEditing ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-morphism p-8 rounded-3xl border border-white/10"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">{currentPackage ? 'Edit Paket' : 'Tambah Paket Baru'}</h2>
                        <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-white transition">
                            <FaTimes size={24} />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Judul Paket</label>
                                <input 
                                    type="text" required
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 text-white focus:border-blue-500 outline-none"
                                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Harga (Text)</label>
                                <input 
                                    type="text" required
                                    placeholder="ex: 200k / Custom Plan"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 text-white focus:border-blue-500 outline-none"
                                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Subtitle</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 text-white focus:border-blue-500 outline-none"
                                    value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-400 mb-2">Urutan Tampil</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 text-white focus:border-blue-500 outline-none"
                                    value={formData.sort_order} onChange={e => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Fitur (1 fitur per baris)</label>
                            <textarea 
                                rows="5" required
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3 text-white focus:border-blue-500 outline-none"
                                value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})}
                                placeholder="Revisi sampai puas&#10;Full Source Code&#10;Priority Support"
                            ></textarea>
                        </div>

                        <div className="flex items-center gap-3">
                            <input 
                                type="checkbox" id="is_popular"
                                className="w-5 h-5 rounded border-slate-700 bg-slate-900 accent-blue-500"
                                checked={formData.is_popular}
                                onChange={e => setFormData({...formData, is_popular: e.target.checked})}
                            />
                            <label htmlFor="is_popular" className="text-white font-bold flex items-center gap-2">
                                <FaStar className="text-yellow-500" /> Tandai sebagai Paket Populer (Recommended)
                            </label>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-white/10">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 text-slate-400 font-bold hover:text-white transition mr-4">Batal</button>
                            <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold transition">
                                <FaSave /> Simpan Paket
                            </button>
                        </div>
                    </form>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {loading ? (
                        [1,2,3].map(i => <div key={i} className="h-64 bg-slate-800 animate-pulse rounded-3xl" />)
                    ) : (
                        packages.map(pkg => (
                            <div key={pkg.id} className={`glass-morphism p-6 rounded-3xl border relative ${pkg.is_popular ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10'}`}>
                                {pkg.is_popular && <div className="absolute top-0 right-0 bg-blue-500 text-xs font-bold px-3 py-1 rounded-bl-xl text-white">POPULER</div>}
                                <h3 className="text-xl font-bold text-white mb-1">{pkg.title}</h3>
                                <p className="text-sm text-slate-400 mb-4">{pkg.price}</p>
                                <div className="space-y-2 mb-6">
                                    {(pkg.features || []).slice(0,3).map((f, i) => (
                                        <div key={i} className="text-xs text-slate-300 flex items-start gap-2">
                                            <span className="text-emerald-500 shrink-0">✓</span> {f}
                                        </div>
                                    ))}
                                    {(pkg.features && pkg.features.length > 3) && (
                                        <div className="text-xs text-slate-500 italic">+{pkg.features.length - 3} fitur lainnya</div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(pkg)} className="flex-1 py-2 bg-slate-800 text-white rounded-lg font-bold text-sm hover:bg-slate-700 transition flex justify-center items-center gap-2">
                                        <FaEdit /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(pkg.id)} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
