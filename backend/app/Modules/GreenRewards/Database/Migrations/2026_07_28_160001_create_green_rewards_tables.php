<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('eco_levels', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedInteger('min_points');
            $table->unsignedTinyInteger('rank')->default(0);
            $table->string('badge_icon')->nullable();
            $table->timestamps();
        });

        Schema::create('eco_rules', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('category');
            $table->unsignedInteger('points');
            $table->string('validation_type');
            $table->unsignedInteger('daily_limit')->nullable();
            $table->unsignedInteger('monthly_limit')->nullable();
            $table->decimal('co2_kg', 8, 2)->default(0);
            $table->decimal('water_liters', 8, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('eco_badges', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('required_points')->nullable();
            $table->string('required_rule_code')->nullable();
            $table->unsignedInteger('required_rule_count')->nullable();
            $table->timestamps();
        });

        Schema::create('member_badges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('eco_badge_id')->constrained()->cascadeOnDelete();
            $table->timestamp('earned_at');
            $table->timestamps();

            $table->unique(['member_id', 'eco_badge_id']);
        });

        Schema::create('member_eco_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('eco_rule_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->unsignedInteger('points')->default(0);
            $table->string('proof_path')->nullable();
            $table->text('notes')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('validated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('validated_at')->nullable();
            $table->timestamp('submitted_at');
            $table->timestamps();

            $table->index(['member_id', 'status']);
            $table->index(['eco_rule_id', 'submitted_at']);
        });

        Schema::create('eco_points_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->integer('points');
            $table->unsignedInteger('balance_after');
            $table->string('reason');
            $table->nullableMorphs('reference');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('eco_challenges', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('image_path')->nullable();
            $table->timestamp('starts_at');
            $table->timestamp('ends_at');
            $table->unsignedInteger('target_count')->default(1);
            $table->string('target_rule_code')->nullable();
            $table->unsignedInteger('reward_points')->default(0);
            $table->foreignId('eco_badge_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('member_challenges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('eco_challenge_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('progress')->default(0);
            $table->boolean('completed')->default(false);
            $table->timestamp('joined_at');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['member_id', 'eco_challenge_id']);
        });

        Schema::create('eco_rewards', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('cost_points');
            $table->unsignedInteger('stock')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('reward_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('eco_reward_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('points_spent');
            $table->string('status')->default('pending');
            $table->timestamp('redeemed_at');
            $table->foreignId('processed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('eco_impacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('member_eco_action_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('co2_kg', 8, 2)->default(0);
            $table->decimal('water_liters', 8, 2)->default(0);
            $table->unsignedInteger('waste_items')->default(0);
            $table->unsignedInteger('trees_planted')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('eco_impacts');
        Schema::dropIfExists('reward_redemptions');
        Schema::dropIfExists('eco_rewards');
        Schema::dropIfExists('member_challenges');
        Schema::dropIfExists('eco_challenges');
        Schema::dropIfExists('eco_points_transactions');
        Schema::dropIfExists('member_eco_actions');
        Schema::dropIfExists('member_badges');
        Schema::dropIfExists('eco_badges');
        Schema::dropIfExists('eco_rules');
        Schema::dropIfExists('eco_levels');
    }
};
