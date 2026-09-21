<?php

namespace App\Modules\GreenRewards\Models;

use App\Modules\Members\Models\Member;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class EcoChallenge extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'image_path', 'starts_at', 'ends_at',
        'target_count', 'target_rule_code', 'reward_points', 'eco_badge_id', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'target_count' => 'integer',
            'reward_points' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function badge(): BelongsTo
    {
        return $this->belongsTo(EcoBadge::class, 'eco_badge_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'member_challenges')
            ->withPivot(['progress', 'completed', 'joined_at', 'completed_at'])
            ->withTimestamps();
    }
}
