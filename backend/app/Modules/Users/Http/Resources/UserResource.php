<?php

namespace App\Modules\Users\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Users\Models\User */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'is_active' => $this->is_active,
            'hourly_rate' => $this->hourly_rate !== null ? (float) $this->hourly_rate : null,
            'currency' => $this->currency ?? 'TND',
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->pluck('slug')),
            'member' => $this->whenLoaded('member'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
