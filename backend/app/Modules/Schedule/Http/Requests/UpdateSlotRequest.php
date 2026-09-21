<?php

namespace App\Modules\Schedule\Http\Requests;

use App\Modules\Schedule\Enums\CourseLevel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_id' => ['sometimes', 'integer', 'exists:courses,id'],
            'coach_id' => ['sometimes', 'integer', 'exists:users,id'],
            'room_id' => ['nullable', 'integer', 'exists:rooms,id'],
            'starts_at' => ['sometimes', 'date'],
            'ends_at' => ['sometimes', 'date', 'after:starts_at'],
            'capacity' => ['sometimes', 'integer', 'min:1', 'max:200'],
            'level' => ['nullable', Rule::enum(CourseLevel::class)],
            'notes' => ['nullable', 'string'],
        ];
    }
}
