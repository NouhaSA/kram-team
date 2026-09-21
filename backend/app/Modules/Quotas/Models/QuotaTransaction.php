<?php

namespace App\Modules\Quotas\Models;

use App\Modules\Quotas\Enums\QuotaTransactionType;
use App\Modules\Subscriptions\Models\SubscriptionQuota;
use App\Modules\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class QuotaTransaction extends Model
{
    protected $fillable = [
        'subscription_quota_id',
        'amount',
        'balance_after',
        'type',
        'reference_type',
        'reference_id',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'balance_after' => 'integer',
            'type' => QuotaTransactionType::class,
        ];
    }

    public function subscriptionQuota(): BelongsTo
    {
        return $this->belongsTo(SubscriptionQuota::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
