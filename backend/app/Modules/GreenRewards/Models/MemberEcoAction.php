<?php

namespace App\Modules\GreenRewards\Models;

use App\Modules\GreenRewards\Enums\EcoActionStatus;
use App\Modules\Members\Models\Member;
use App\Modules\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberEcoAction extends Model
{
    protected $fillable = [
        'member_id', 'eco_rule_id', 'status', 'points', 'proof_path',
        'notes', 'rejection_reason', 'validated_by', 'validated_at', 'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => EcoActionStatus::class,
            'points' => 'integer',
            'validated_at' => 'datetime',
            'submitted_at' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function rule(): BelongsTo
    {
        return $this->belongsTo(EcoRule::class, 'eco_rule_id');
    }

    public function validatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }
}
