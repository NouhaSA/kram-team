<?php

namespace App\Modules\Offers\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Offers\Models\Offer */
class OfferResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'price' => $this->price,
            'effective_price' => $this->effectivePrice(),
            'duration_days' => $this->duration_days,
            'requires_booking' => $this->requires_booking,
            'promotion_percent' => $this->promotion_percent,
            'promotion_starts_at' => $this->promotion_starts_at?->toIso8601String(),
            'promotion_ends_at' => $this->promotion_ends_at?->toIso8601String(),
            'image_path' => $this->image_path,
            'services_included' => $this->services_included,
            'is_active' => $this->is_active,
            'quotas' => OfferQuotaResource::collection($this->whenLoaded('quotas')),
            'coach_ids' => $this->whenLoaded('coaches', fn () => $this->coaches->pluck('id')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
