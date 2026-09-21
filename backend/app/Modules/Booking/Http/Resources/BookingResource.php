<?php

namespace App\Modules\Booking\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Booking\Models\Booking */
class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'schedule_slot_id' => $this->schedule_slot_id,
            'member_id' => $this->member_id,
            'subscription_id' => $this->subscription_id,
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'waitlist_position' => $this->waitlist_position,
            'qr_code' => $this->qr_code,
            'booked_at' => $this->booked_at?->toIso8601String(),
            'cancelled_at' => $this->cancelled_at?->toIso8601String(),
            'cancellation_reason' => $this->cancellation_reason,
            'notes' => $this->notes,
            'member' => $this->whenLoaded('member'),
            'subscription' => $this->whenLoaded('subscription'),
            'schedule_slot' => $this->whenLoaded('scheduleSlot'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
