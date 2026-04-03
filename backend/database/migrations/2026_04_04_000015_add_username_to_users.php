<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Add columns
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username')->nullable()->unique()->after('email');
            }
            if (!Schema::hasColumn('users', 'is_default_password')) {
                $table->boolean('is_default_password')->default(true)->after('password');
            }
        });

        // 2. Ensure default admin exists
        $admin = User::where('username', 'admin')->orWhere('role', 'admin')->first();
        if (!$admin) {
            User::create([
                'name' => 'Admin DualCode',
                'email' => 'admin@dualcode.id',
                'username' => 'admin',
                'password' => Hash::make('admin'),
                'role' => 'admin',
                'is_default_password' => true,
            ]);
        } else {
            // Update existing admin to have username 'admin' and set flag if they haven't changed password
            // (Assuming if they have role admin but no username, we set it)
            if (!$admin->username) {
                $admin->username = 'admin';
                $admin->save();
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'is_default_password']);
        });
    }
};
