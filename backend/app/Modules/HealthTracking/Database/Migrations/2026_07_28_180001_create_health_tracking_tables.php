<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_health_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->unique()->constrained('members')->cascadeOnDelete();
            $table->decimal('height_cm', 5, 1);
            $table->string('goal', 30)->default('maintain');
            $table->decimal('start_weight_kg', 5, 1)->nullable();
            $table->decimal('target_weight_kg', 5, 1)->nullable();
            $table->date('target_date')->nullable();
            $table->unsignedTinyInteger('activity_level')->default(3)->comment('1 sedentary … 5 very active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('member_health_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->timestamp('recorded_at');
            $table->decimal('weight_kg', 5, 1);
            $table->decimal('height_cm', 5, 1)->nullable();
            $table->decimal('body_fat_percent', 4, 1)->nullable();
            $table->decimal('muscle_mass_kg', 5, 1)->nullable();
            $table->decimal('waist_cm', 5, 1)->nullable();
            $table->unsignedSmallInteger('resting_hr')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['member_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_health_entries');
        Schema::dropIfExists('member_health_profiles');
    }
};
