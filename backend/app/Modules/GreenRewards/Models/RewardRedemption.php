<?php

namespace App\Modules\GreenRewards\Models;

use App\Modules\Members\Models\Member;
use App\Modules\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RewardRedemption extends Model
{
    protected $fillable = [
        'member_id', 'eco_reward_id', 'points_spent', 'status',
        'redeemed_at', 'processed_by',
    ];

    protected function casts(): array
    {
        return [
            'points_spent' => 'integer',
            'redeemed_at' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(EcoReward::class, 'eco_reward_id');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
