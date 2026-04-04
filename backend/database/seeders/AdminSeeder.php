<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Cek apakah admin sudah ada
        if (!User::where('email', 'admin@dualcode.id')->exists()) {

            User::create([
                'name' => 'Admin DualCode',
                'email' => 'admin@dualcode.id',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'email_verified_at' => now(),
                'is_default_password' => 1,
            ]);

        }
    }
}