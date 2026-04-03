import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaTimes, FaSearchPlus, FaSearchMinus, 
    FaSync, FaDownload, FaFilePdf, FaImage 
} from 'react-icons/fa';
import api from '../api';

export default function FilePreviewModal({ isOpen, onClose, fileUrl, fileName }) {
    const [zoom, setZoom] = useState(1);
    const [blobUrl, setBlobUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    const isPdf = fileUrl?.toLowerCase().endsWith('.pdf') || fileUrl?.includes('pdf');

    useEffect(() => {
        let currentUrl = null;

        const fetchFile = async () => {
            if (!isOpen || !fileUrl) return;

            setLoading(true);
            setError(false);

            try {
                // Fetch file as blob with auth headers from api instance
                const response = await api.get(fileUrl, { responseType: 'blob' });
                const blob = response.data;
                currentUrl = URL.createObjectURL(blob);
                setBlobUrl(currentUrl);
            } catch (err) {
                console.error('Failed to preview file:', err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchFile();

        return () => {
            if (currentUrl) URL.revokeObjectURL(currentUrl);
        };
    }, [isOpen, fileUrl]);

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
    const handleReset = () => {
        setZoom(1);
        setError(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }} 
                    onClick={onClose} 
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" 
                />
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                    animate={{ opacity: 1, scale: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.9, y: 20 }} 
                    className="glass w-full max-w-6xl h-full max-h-[90vh] rounded-[40px] relative z-20 border-white/10 shadow-2xl overflow-hidden flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 md:px-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400">
                                {isPdf ? <FaFilePdf size={20} /> : <FaImage size={20} />}
                            </div>
                            <div>
                                <h3 className="font-black text-white text-lg tracking-tight leading-none mb-1.5 uppercase leading-tight">
                                    Preview Bukti Bayar
                                </h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{fileName || 'Document'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {!isPdf && !error && (
                                <div className="hidden md:flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 mr-4 font-black">
                                    <button onClick={handleZoomOut} className="p-2.5 hover:bg-white/5 text-slate-400 rounded-xl transition" title="Zoom Out"><FaSearchMinus size={14} /></button>
                                    <span className="text-[11px] font-black text-white w-12 text-center uppercase tracking-tighter">{Math.round(zoom * 100)}%</span>
                                    <button onClick={handleZoomIn} className="p-2.5 hover:bg-white/5 text-slate-400 rounded-xl transition" title="Zoom In"><FaSearchPlus size={14} /></button>
                                    <div className="w-px h-4 bg-white/10 mx-1" />
                                    <button onClick={handleReset} className="p-2.5 hover:bg-white/5 text-slate-400 rounded-xl transition" title="Reset"><FaSync size={14} /></button>
                                </div>
                            )}
                            {blobUrl && (
                                <a href={blobUrl} download={fileName || 'file'} className="p-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl transition shadow-lg shadow-emerald-500/20 active:scale-95">
                                    <FaDownload size={16} />
                                </a>
                            )}
                            <button onClick={onClose} className="p-4 bg-slate-800 text-slate-400 rounded-2xl hover:text-white transition-colors">
                                <FaTimes size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-slate-950/50 overflow-auto flex items-center justify-center p-8 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Memuat Preview...</span>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center gap-6 text-center max-w-sm">
                                <img src="/images/placeholder.svg" alt="Error" className="w-32 opacity-50" />
                                <div className="space-y-2">
                                    <p className="text-white font-black uppercase text-sm">Gagal Memuat Preview</p>
                                    <p className="text-xs text-slate-500">File mungkin hilang di server atau sesi login Anda berakhir.</p>
                                </div>
                                <button onClick={handleReset} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition">Coba Lagi</button>
                            </div>
                        ) : blobUrl && (
                            isPdf ? (
                                <iframe 
                                    src={blobUrl} 
                                    className="w-full h-full rounded-2xl border border-white/5 shadow-2xl"
                                    title="PDF Preview"
                                />
                            ) : (
                                <motion.div 
                                    animate={{ scale: zoom }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    className="relative cursor-grab active:cursor-grabbing"
                                >
                                    <img 
                                        src={blobUrl} 
                                        alt="Preview" 
                                        className="max-h-[70vh] w-auto rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5"
                                    />
                                </motion.div>
                            )
                        )}
                    </div>

                    {/* Footer / Info */}
                    <div className="p-4 text-center bg-black/20">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] font-black">DualCode Secure Document Viewer</p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

