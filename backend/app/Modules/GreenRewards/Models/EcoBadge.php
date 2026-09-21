<?php

namespace App\Modules\GreenRewards\Models;

use App\Modules\Members\Models\Member;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class EcoBadge extends Model
{
    protected $fillable = [
        'name', 'slug', 'icon', 'description',
        'required_points', 'required_rule_code', 'required_rule_count',
    ];

    protected function casts(): array
    {
        return [
            'required_points' => 'integer',
            'required_rule_count' => 'integer',
        ];
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'member_badges')
            ->withPivot('earned_at')
            ->withTimestamps();
    }
}
