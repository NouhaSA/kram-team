<?php

namespace App\Modules\Offers\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Offers\Models\OfferQuota */
class OfferQuotaResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'quota_type' => $this->quota_type->value,
            'total' => $this->total,
            'activity_type' => $this->activity_type,
            'sort_order' => $this->sort_order,
        ];
    }
}
