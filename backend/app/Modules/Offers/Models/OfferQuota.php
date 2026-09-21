<?php

namespace App\Modules\Offers\Models;

use App\Modules\Quotas\Enums\QuotaType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfferQuota extends Model
{
    protected $fillable = [
        'offer_id',
        'label',
        'quota_type',
        'total',
        'activity_type',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'quota_type' => QuotaType::class,
            'total' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function offer(): BelongsTo
    {
        return $this->belongsTo(Offer::class);
    }
}
