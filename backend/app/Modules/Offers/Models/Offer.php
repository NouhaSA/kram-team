<?php

namespace App\Modules\Offers\Models;

use App\Modules\Offers\Enums\OfferType;
use App\Modules\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Offer extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'type',
        'price',
        'duration_days',
        'requires_booking',
        'promotion_percent',
        'promotion_starts_at',
        'promotion_ends_at',
        'image_path',
        'services_included',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'type' => OfferType::class,
            'price' => 'decimal:2',
            'duration_days' => 'integer',
            'requires_booking' => 'boolean',
            'promotion_percent' => 'decimal:2',
            'promotion_starts_at' => 'datetime',
            'promotion_ends_at' => 'datetime',
            'services_included' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function quotas(): HasMany
    {
        return $this->hasMany(OfferQuota::class)->orderBy('sort_order');
    }

    public function coaches(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'offer_coach');
    }

    public function effectivePrice(): float
    {
        if (
            $this->promotion_percent
            && $this->promotion_starts_at?->isPast()
            && ($this->promotion_ends_at === null || $this->promotion_ends_at->isFuture())
        ) {
            return round((float) $this->price * (1 - $this->promotion_percent / 100), 2);
        }

        return (float) $this->price;
    }
}
