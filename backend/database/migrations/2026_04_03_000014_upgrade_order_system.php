<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // ── 1. Update orders table: add price, price_note, payment_status ──
        Schema::table('orders', function (Blueprint $table) {
            if (!Schema::hasColumn('orders', 'price')) {
                $table->decimal('price', 15, 2)->nullable()->after('budget');
            }
            if (!Schema::hasColumn('orders', 'price_note')) {
                $table->text('price_note')->nullable()->after('price');
            }
            if (!Schema::hasColumn('orders', 'payment_status')) {
                $table->string('payment_status')->default('unpaid')->after('price_note');
            }
        });

        // ── 2. Migrate status enum: replace 'process' with 'progress' ──
        // Update existing records that use 'process' to 'progress'
        DB::table('orders')->where('status', 'process')->update(['status' => 'progress']);

        // ── 3. Create payments table ──
        if (!Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained()->onDelete('cascade');
                $table->decimal('amount', 15, 2);
                $table->string('type'); // dp, cicilan, pelunasan
                $table->string('status')->default('pending'); // pending, approved, rejected
                $table->string('proof_image')->nullable();
                $table->text('admin_note')->nullable();
                $table->timestamps();
            });
        }

        // ── 4. Create order_progress table ──
        if (!Schema::hasTable('order_progress')) {
            Schema::create('order_progress', function (Blueprint $table) {
                $table->id();
                $table->foreignId('order_id')->constrained()->onDelete('cascade');
                $table->string('image_url');
                $table->text('description')->nullable();
                $table->timestamps();
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('order_progress');
        Schema::dropIfExists('payments');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['price', 'price_note', 'payment_status']);
        });

        // Revert status back
        DB::table('orders')->where('status', 'progress')->update(['status' => 'process']);
    }
};
