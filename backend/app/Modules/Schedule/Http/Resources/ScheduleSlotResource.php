<?php

namespace App\Modules\Schedule\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Schedule\Models\ScheduleSlot */
class ScheduleSlotResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'course_id' => $this->course_id,
            'coach_id' => $this->coach_id,
            'room_id' => $this->room_id,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'capacity' => $this->capacity,
            'booked_count' => $this->booked_count,
            'waitlist_count' => $this->waitlist_count,
            'remaining_seats' => $this->remainingSeats(),
            'is_full' => $this->isFull(),
            'is_bookable' => $this->isBookable(),
            'level' => $this->level?->value,
            'level_label' => $this->level?->label(),
            'status' => $this->status->value,
            'status_label' => $this->status->label(),
            'notes' => $this->notes,
            'course' => $this->whenLoaded('course'),
            'coach' => $this->whenLoaded('coach', fn () => [
                'id' => $this->coach->id,
                'full_name' => $this->coach->full_name,
            ]),
            'room' => $this->whenLoaded('room'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
