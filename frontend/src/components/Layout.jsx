import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingWhatsApp from './FloatingWhatsApp';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans">
            <Navbar />
            <main className="flex-grow relative">
                {children}
            </main>
            <Footer />
            <FloatingWhatsApp />
        </div>
    );
}
