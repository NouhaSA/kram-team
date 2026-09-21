<?php

namespace App\Modules\Members\Models;

use App\Modules\Core\Enums\Gender;
use App\Modules\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Member extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'qr_uuid',
        'date_of_birth',
        'gender',
        'address',
        'city',
        'postal_code',
        'goals',
        'coach_id',
        'green_score',
        'eco_points',
        'green_level',
        'medical_certificate_path',
        'medical_certificate_expires_at',
        'notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'gender' => Gender::class,
            'green_score' => 'integer',
            'eco_points' => 'integer',
            'green_level' => 'integer',
            'medical_certificate_expires_at' => 'date',
            'is_active' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Member $member) {
            if (empty($member->qr_uuid)) {
                $member->qr_uuid = (string) Str::uuid();
            }
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function coach(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(\App\Modules\Subscriptions\Models\Subscription::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(\App\Modules\Attendance\Models\Attendance::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(\App\Modules\Payments\Models\Payment::class);
    }

    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(
            \App\Modules\GreenRewards\Models\EcoBadge::class,
            'member_badges'
        )->withPivot('earned_at')->withTimestamps();
    }

    public function challenges(): BelongsToMany
    {
        return $this->belongsToMany(
            \App\Modules\GreenRewards\Models\EcoChallenge::class,
            'member_challenges'
        )->withPivot(['progress', 'completed', 'joined_at', 'completed_at'])->withTimestamps();
    }

    public function ecoActions(): HasMany
    {
        return $this->hasMany(\App\Modules\GreenRewards\Models\MemberEcoAction::class);
    }

    public function healthProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(\App\Modules\HealthTracking\Models\MemberHealthProfile::class);
    }

    public function healthEntries(): HasMany
    {
        return $this->hasMany(\App\Modules\HealthTracking\Models\MemberHealthEntry::class);
    }
}
