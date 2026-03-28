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
            if (!Schema::hasColumn('orders', 'technology')) {
                $table->string('technology')->nullable()->after('description');
            }
            if (!Schema::hasColumn('orders', 'budget')) {
                $table->decimal('budget', 15, 2)->nullable()->after('technology');
            }
        });

        Schema::table('revisions', function (Blueprint $table) {
            if (!Schema::hasColumn('revisions', 'user_id')) {
                $table->foreignId('user_id')->nullable()->after('order_id')->constrained()->onDelete('cascade');
            }
            if (!Schema::hasColumn('revisions', 'message')) {
                $table->text('message')->nullable()->after('user_id');
            }
            if (!Schema::hasColumn('revisions', 'deadline')) {
                $table->dateTime('deadline')->nullable()->after('message');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['technology', 'budget']);
        });

        Schema::table('revisions', function (Blueprint $table) {
            $table->dropColumn(['user_id', 'message', 'deadline']);
        });
    }
};
