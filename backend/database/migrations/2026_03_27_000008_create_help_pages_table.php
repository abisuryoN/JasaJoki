<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('help_pages', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('content');
            $table->enum('type', ['faq', 'tc', 'contact']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('help_pages');
    }
};
