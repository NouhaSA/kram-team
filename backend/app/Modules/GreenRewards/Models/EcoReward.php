<?php

namespace App\Modules\GreenRewards\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EcoReward extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'cost_points', 'stock', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'cost_points' => 'integer',
            'stock' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(RewardRedemption::class);
    }
}
