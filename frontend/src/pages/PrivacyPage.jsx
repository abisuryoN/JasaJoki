import React from 'react';
import SEO from '../components/SEO';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-4">
            <SEO
                title="Kebijakan Privasi DualCode"
                description="Kebijakan privasi DualCode mengenai pengumpulan, penggunaan, dan perlindungan data pengguna layanan jasa IT kami."
                keywords="kebijakan privasi, privacy policy, data pengguna dualcode"
                canonicalUrl="/privacy"
            />
            <div className="max-w-4xl mx-auto glass-morphism p-8 md:p-12 rounded-[40px] border border-white/5">
                <h1 className="text-4xl font-black text-white mb-8 heading-gradient">Kebijakan Privasi</h1>
                <div className="space-y-8 text-slate-400 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 tracking-tight">1. Data yang Kami Kumpulkan</h2>
                        <p>Kami mengumpulkan data minimal seperti nama, email, dan detail project demi kelancaran konsultasi dan pengerjaan.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 tracking-tight">2. Penggunaan Data</h2>
                        <p>Data Anda hanya digunakan untuk kepentingan project dan komunikasi internal DualCode. Kami tidak menjual data Anda kepada pihak ketiga.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 tracking-tight">3. Keamanan File</h2>
                        <p>Semua file project yang Anda berikan kepada kami akan dijaga kerahasiaannya dan dihapus dari server kami dalam jangka waktu tertentu setelah project selesai.</p>
                    </section>
                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 tracking-tight">4. Hak Pengguna</h2>
                        <p>Anda berhak meminta penghapusan data akun atau detail project Anda kapan saja dengan menghubungi tim support kami.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}