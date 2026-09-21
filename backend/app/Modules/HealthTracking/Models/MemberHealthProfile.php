<?php

namespace App\Modules\HealthTracking\Models;

use App\Modules\HealthTracking\Enums\HealthGoal;
use App\Modules\Members\Models\Member;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MemberHealthProfile extends Model
{
    protected $fillable = [
        'member_id',
        'height_cm',
        'goal',
        'start_weight_kg',
        'target_weight_kg',
        'target_date',
        'activity_level',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'height_cm' => 'float',
            'goal' => HealthGoal::class,
            'start_weight_kg' => 'float',
            'target_weight_kg' => 'float',
            'target_date' => 'date',
            'activity_level' => 'integer',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function entries(): HasMany
    {
        return $this->hasMany(MemberHealthEntry::class, 'member_id', 'member_id');
    }
}
