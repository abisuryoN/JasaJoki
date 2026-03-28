import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function FloatingWhatsApp() {
    return (
        <a 
            href="https://wa.me/6281234567890?text=Halo%20JasaJoki,%20saya%20ingin%20konsultasi" 
            target="_blank" 
            rel="noreferrer"
            className="fixed bottom-6 right-6 z-[100] flex items-center justify-center group outline-none"
            aria-label="Chat via WhatsApp"
        >
            <motion.div 
                className="absolute inset-0 bg-emerald-500 rounded-full"
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            />
            
            <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 text-white p-4 rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.5)] group-hover:scale-110 group-hover:shadow-[0_4px_25px_rgba(16,185,129,0.7)] transition-all duration-300 flex items-center justify-center cursor-pointer">
                <FaWhatsapp size={32} />
            </div>

            <span className="absolute right-full mr-4 bg-slate-800 text-slate-100 text-sm font-medium whitespace-nowrap px-4 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-slate-700 shadow-xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Konsultasi via WA
            </span>
        </a>
    );
}
