<?php

namespace App\Modules\Attendance\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Attendance\Models\Attendance */
class AttendanceResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->member_id,
            'subscription_id' => $this->subscription_id,
            'type' => $this->type->value,
            'type_label' => $this->type->label(),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'qr_uuid' => $this->qr_uuid,
            'checked_in_at' => $this->checked_in_at?->toIso8601String(),
            'checked_out_at' => $this->checked_out_at?->toIso8601String(),
            'duration_minutes' => $this->duration_minutes,
            'activity_type' => $this->activity_type,
            'denial_reason' => $this->denial_reason,
            'is_open' => $this->isOpen(),
            'member' => $this->whenLoaded('member'),
            'subscription' => $this->whenLoaded('subscription'),
            'scanned_by' => $this->whenLoaded('scannedBy'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
