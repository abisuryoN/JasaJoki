<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dateTime('deadline')->nullable()->after('description');
            $table->integer('extra_revisions')->default(0)->after('status');
            $table->integer('revisions_left')->default(2)->after('extra_revisions');
            $table->string('payment_proof')->nullable()->after('result_path');
            $table->string('payment_method')->nullable()->after('payment_proof');
            $table->integer('rating')->nullable()->after('payment_method');
            $table->text('comment')->nullable()->after('rating');
            
            // Update status enum if needed, or just keep as is and handle in code
            // Laravel 11+ supports changing columns easily, but we'll stick to new fields
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'deadline',
                'extra_revisions',
                'revisions_left',
                'payment_proof',
                'payment_method',
                'rating',
                'comment'
            ]);
        });
    }
};
