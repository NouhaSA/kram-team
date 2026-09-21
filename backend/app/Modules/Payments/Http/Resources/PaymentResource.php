<?php

namespace App\Modules\Payments\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Payments\Models\Payment */
class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'member_id' => $this->member_id,
            'subscription_id' => $this->subscription_id,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'method' => $this->method->value,
            'method_label' => $this->method->label(),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'amount' => $this->amount,
            'refunded_amount' => $this->refunded_amount,
            'refundable_amount' => $this->refundableAmount(),
            'currency' => $this->currency,
            'external_reference' => $this->external_reference,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'notes' => $this->notes,
            'member' => $this->whenLoaded('member'),
            'subscription' => $this->whenLoaded('subscription'),
            'recorded_by' => $this->whenLoaded('recordedBy', fn () => $this->recordedBy ? [
                'id' => $this->recordedBy->id,
                'full_name' => $this->recordedBy->full_name,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
