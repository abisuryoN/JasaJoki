<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Reviews: add moderation status + display name (safe / idempotent) ──
        Schema::table('reviews', function (Blueprint $table) {
            if (!Schema::hasColumn('reviews', 'status')) {
                $table->string('status')->default('pending')->after('comment');
            }
            if (!Schema::hasColumn('reviews', 'name')) {
                $table->string('name')->nullable()->after('user_id');
            }
        });

        // Set existing reviews as approved so they aren't hidden
        \DB::table('reviews')->whereNull('status')->orWhere('status', '')->update(['status' => 'approved']);

        // ── Packages ──
        if (!Schema::hasTable('packages')) {
            Schema::create('packages', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('subtitle')->nullable();
                $table->string('price');
                $table->json('features')->nullable();
                $table->boolean('is_popular')->default(false);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // ── Portfolios ──
        if (!Schema::hasTable('portfolios')) {
            Schema::create('portfolios', function (Blueprint $table) {
                $table->id();
                $table->string('title');
                $table->string('category');
                $table->text('description')->nullable();
                $table->json('tech_stack')->nullable();
                $table->string('icon')->nullable();
                $table->boolean('is_published')->default(true);
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // ── Footer Links ──
        if (!Schema::hasTable('footer_links')) {
            Schema::create('footer_links', function (Blueprint $table) {
                $table->id();
                $table->string('category');
                $table->string('title');
                $table->string('url');
                $table->integer('sort_order')->default(0);
                $table->timestamps();
            });
        }

        // ── Orders: add package_id reference ──
        if (!Schema::hasColumn('orders', 'package_id')) {
            Schema::table('orders', function (Blueprint $table) {
                $table->unsignedBigInteger('package_id')->nullable()->after('id');
                $table->foreign('package_id')->references('id')->on('packages')->nullOnDelete();
            });
        }
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['package_id']);
            $table->dropColumn('package_id');
        });

        Schema::dropIfExists('footer_links');
        Schema::dropIfExists('portfolios');
        Schema::dropIfExists('packages');

        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn(['status', 'name']);
        });
    }
};
