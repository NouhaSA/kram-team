<?php

namespace App\Modules\GreenRewards\Models;

use App\Modules\Members\Models\Member;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EcoImpact extends Model
{
    protected $fillable = [
        'member_id', 'member_eco_action_id', 'co2_kg', 'water_liters',
        'waste_items', 'trees_planted',
    ];

    protected function casts(): array
    {
        return [
            'co2_kg' => 'decimal:2',
            'water_liters' => 'decimal:2',
            'waste_items' => 'integer',
            'trees_planted' => 'integer',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function action(): BelongsTo
    {
        return $this->belongsTo(MemberEcoAction::class, 'member_eco_action_id');
    }
}
