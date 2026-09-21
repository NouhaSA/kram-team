<?php

namespace App\Modules\Schedule\Models;

use App\Modules\Schedule\Enums\CourseLevel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Course extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'slug',
        'activity_type',
        'description',
        'level',
        'default_duration_minutes',
        'default_capacity',
        'image_path',
        'requires_booking',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'level' => CourseLevel::class,
            'default_duration_minutes' => 'integer',
            'default_capacity' => 'integer',
            'requires_booking' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function slots(): HasMany
    {
        return $this->hasMany(ScheduleSlot::class);
    }
}
