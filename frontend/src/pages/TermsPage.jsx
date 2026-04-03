import React from 'react';
import { motion } from 'framer-motion';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-[#020617] pt-32 pb-20 px-4">
            <div className="max-w-4xl mx-auto glass-morphism p-8 md:p-12 rounded-[40px] border border-white/5">
                <h1 className="text-4xl font-black text-white mb-8 heading-gradient">Syarat & Ketentuan</h1>
                
                <div className="space-y-8 text-slate-400 leading-relaxed">
                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 tracking-tight">1. Penerimaan Layanan</h2>
                        <p>Dengan menggunakan layanan DualCode, Anda setuju untuk terikat oleh syarat dan ketentuan ini. Kami berhak melakukan perubahan sewaktu-waktu.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 tracking-tight">2. Scope Pengerjaan</h2>
                        <p>Pengerjaan dilakukan berdasarkan kesepakatan awal saat konsultasi. Penambahan fitur atau perubahan besar di tengah jalan mungkin akan dikenakan biaya tambahan.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 tracking-tight">3. Pembayaran</h2>
                        <p>Pembayaran dilakukan sesuai kesepakatan (DP atau full payment). Pekerjaan akan dimulai setelah konfirmasi pembayaran diterima.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 tracking-tight">4. Kebijakan Revisi</h2>
                        <p>Revisi tersedia selama masih dalam scope awal yang disepakati. Batas waktu klaim revisi adalah 7 hari setelah penyerahan hasil akhir.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-200 mb-4 tracking-tight">5. Tanggung Jawab</h2>
                        <p>JasaJoki tidak bertanggung jawab atas penyalahgunaan hasil pekerjaan oleh client. Hasil pekerjaan bersifat edukasi dan referensi.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
