<?php

namespace App\Modules\Schedule\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Modules\Schedule\Models\Course */
class CourseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'activity_type' => $this->activity_type,
            'description' => $this->description,
            'level' => $this->level->value,
            'level_label' => $this->level->label(),
            'default_duration_minutes' => $this->default_duration_minutes,
            'default_capacity' => $this->default_capacity,
            'image_path' => $this->image_path,
            'requires_booking' => $this->requires_booking,
            'is_active' => $this->is_active,
        ];
    }
}
