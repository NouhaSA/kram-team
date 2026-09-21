<?php

namespace App\Modules\GreenRewards\Models;

use App\Modules\GreenRewards\Enums\EcoCategory;
use App\Modules\GreenRewards\Enums\ValidationType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EcoRule extends Model
{
    protected $fillable = [
        'code', 'name', 'category', 'points', 'validation_type',
        'daily_limit', 'monthly_limit', 'co2_kg', 'water_liters', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'category' => EcoCategory::class,
            'validation_type' => ValidationType::class,
            'points' => 'integer',
            'daily_limit' => 'integer',
            'monthly_limit' => 'integer',
            'co2_kg' => 'decimal:2',
            'water_liters' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function actions(): HasMany
    {
        return $this->hasMany(MemberEcoAction::class);
    }
}
