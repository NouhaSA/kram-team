<?php

namespace App\Modules\Subscriptions\Http\Resources;

use App\Modules\Quotas\Services\QuotaService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Subscriptions\Models\Subscription */
class SubscriptionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $quotaService = app(QuotaService::class);

        return [
            'id' => $this->id,
            'member_id' => $this->member_id,
            'offer_id' => $this->offer_id,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'price_paid' => $this->price_paid,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'notes' => $this->notes,
            'is_active' => $this->isActive(),
            'member' => $this->whenLoaded('member'),
            'offer' => $this->whenLoaded('offer'),
            'quotas' => $this->whenLoaded('quotas', fn () => $quotaService->getBalances($this->resource)),
            'alerts' => $this->whenLoaded('quotas', fn () => $quotaService->getAlerts($this->resource)),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
