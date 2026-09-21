<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained()->cascadeOnDelete();
            $table->foreignId('offer_id')->constrained()->restrictOnDelete();
            $table->foreignId('renewed_from_id')->nullable()->constrained('subscriptions')->nullOnDelete();
            $table->string('status');
            $table->decimal('price_paid', 10, 2);
            $table->timestamp('starts_at');
            $table->timestamp('ends_at')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['member_id', 'status']);
        });

        Schema::create('subscription_quotas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subscription_id')->constrained()->cascadeOnDelete();
            $table->foreignId('offer_quota_id')->nullable()->constrained()->nullOnDelete();
            $table->string('label');
            $table->string('quota_type');
            $table->unsignedInteger('total')->nullable();
            $table->unsignedInteger('consumed')->default(0);
            $table->string('activity_type')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_quotas');
        Schema::dropIfExists('subscriptions');
    }
};
