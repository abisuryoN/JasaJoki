<?php

namespace Database\Seeders;

use App\Models\Package;
use Illuminate\Database\Seeder;

class PackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'title' => 'Mahasiswa',
                'subtitle' => 'Tugas coding, desain, atau skripsi IT.',
                'price' => '200k',
                'features' => [
                    'Revisi Sampai Approve',
                    'Penjelasan Laporan / Dokumentasi',
                    'Full Source Code & Database',
                ],
                'is_popular' => false,
                'sort_order' => 1,
            ],
            [
                'title' => 'Bisnis / UMKM',
                'subtitle' => 'Sistem kustom, Web App, dan SaaS solution.',
                'price' => 'Custom Plan',
                'features' => [
                    'Architecture Design & Scalability',
                    'UI/UX Modern & Responsive',
                    'Deployment & Cloud Setup',
                    'Priority Support 24/7',
                ],
                'is_popular' => true,
                'sort_order' => 2,
            ],
            [
                'title' => 'Free Chat',
                'subtitle' => 'Belum punya konsep yang matang?',
                'price' => 'Rp 0',
                'features' => [
                    'Konsultasi Alur Program',
                    'Estimasi Durasi & Budget',
                    'Rekomendasi Fitur',
                ],
                'is_popular' => false,
                'sort_order' => 3,
            ],
        ];

        foreach ($packages as $pkg) {
            Package::updateOrCreate(
                ['title' => $pkg['title']],
                $pkg
            );
        }
    }
}
