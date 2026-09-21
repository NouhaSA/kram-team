<?php

namespace App\Modules\Subscriptions\Models;

use App\Modules\Offers\Models\OfferQuota;
use App\Modules\Quotas\Enums\QuotaType;
use App\Modules\Quotas\Models\QuotaTransaction;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionQuota extends Model
{
    protected $fillable = [
        'subscription_id',
        'offer_quota_id',
        'label',
        'quota_type',
        'total',
        'consumed',
        'activity_type',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'quota_type' => QuotaType::class,
            'total' => 'integer',
            'consumed' => 'integer',
            'expires_at' => 'datetime',
        ];
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function offerQuota(): BelongsTo
    {
        return $this->belongsTo(OfferQuota::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(QuotaTransaction::class)->latest();
    }

    public function isUnlimited(): bool
    {
        return $this->quota_type === QuotaType::Unlimited;
    }

    public function remaining(): ?int
    {
        if ($this->isUnlimited()) {
            return null;
        }

        return max(0, ($this->total ?? 0) - $this->consumed);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }
}
