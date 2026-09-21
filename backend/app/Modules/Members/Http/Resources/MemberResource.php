<?php

namespace App\Modules\Members\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Members\Models\Member */
class MemberResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'qr_uuid' => $this->qr_uuid,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'gender' => $this->gender?->value,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'goals' => $this->goals,
            'coach_id' => $this->coach_id,
            'green_score' => $this->green_score,
            'eco_points' => $this->eco_points,
            'green_level' => $this->green_level,
            'medical_certificate_expires_at' => $this->medical_certificate_expires_at?->toDateString(),
            'is_active' => $this->is_active,
            'user' => $this->whenLoaded('user'),
            'coach' => $this->whenLoaded('coach'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
