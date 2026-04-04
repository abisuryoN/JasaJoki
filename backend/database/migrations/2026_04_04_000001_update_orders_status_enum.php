<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('draft','pending','contacted','deal','progress','waiting_payment','revision','done') DEFAULT 'draft'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending','process','revision','done') DEFAULT 'pending'");
    }
};