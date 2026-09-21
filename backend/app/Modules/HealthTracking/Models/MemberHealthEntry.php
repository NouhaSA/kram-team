<?php

namespace App\Modules\HealthTracking\Models;

use App\Modules\Members\Models\Member;
use App\Modules\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberHealthEntry extends Model
{
    protected $fillable = [
        'member_id',
        'recorded_at',
        'weight_kg',
        'height_cm',
        'body_fat_percent',
        'muscle_mass_kg',
        'waist_cm',
        'resting_hr',
        'notes',
        'recorded_by',
    ];

    protected function casts(): array
    {
        return [
            'recorded_at' => 'datetime',
            'weight_kg' => 'float',
            'height_cm' => 'float',
            'body_fat_percent' => 'float',
            'muscle_mass_kg' => 'float',
            'waist_cm' => 'float',
            'resting_hr' => 'integer',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
