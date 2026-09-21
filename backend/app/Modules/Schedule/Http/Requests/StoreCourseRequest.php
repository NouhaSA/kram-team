<?php

namespace App\Modules\Schedule\Http\Requests;

use App\Modules\Schedule\Enums\CourseLevel;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'slug' => ['nullable', 'string', 'max:150', 'unique:courses,slug'],
            'activity_type' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'level' => ['nullable', Rule::enum(CourseLevel::class)],
            'default_duration_minutes' => ['nullable', 'integer', 'min:15', 'max:480'],
            'default_capacity' => ['nullable', 'integer', 'min:1', 'max:200'],
            'image_path' => ['nullable', 'string', 'max:500'],
            'requires_booking' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }
}
