<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->uuid('qr_uuid')->unique();
            $table->date('date_of_birth')->nullable();
            $table->string('gender', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('city')->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->text('goals')->nullable();
            $table->foreignId('coach_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('green_score')->default(0);
            $table->unsignedInteger('eco_points')->default(0);
            $table->unsignedTinyInteger('green_level')->default(0);
            $table->string('medical_certificate_path')->nullable();
            $table->date('medical_certificate_expires_at')->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['is_active', 'coach_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
