<?php

namespace App\Modules\Attendance\Models;

use App\Modules\Attendance\Enums\AttendanceStatus;
use App\Modules\Attendance\Enums\AttendanceType;
use App\Modules\Members\Models\Member;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Subscriptions\Models\SubscriptionQuota;
use App\Modules\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $fillable = [
        'member_id',
        'subscription_id',
        'subscription_quota_id',
        'type',
        'status',
        'qr_uuid',
        'checked_in_at',
        'checked_out_at',
        'duration_minutes',
        'activity_type',
        'denial_reason',
        'scanned_by',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'type' => AttendanceType::class,
            'status' => AttendanceStatus::class,
            'checked_in_at' => 'datetime',
            'checked_out_at' => 'datetime',
            'duration_minutes' => 'integer',
            'metadata' => 'array',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function subscriptionQuota(): BelongsTo
    {
        return $this->belongsTo(SubscriptionQuota::class);
    }

    public function scannedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scanned_by');
    }

    public function isOpen(): bool
    {
        return $this->checked_in_at !== null
            && $this->checked_out_at === null
            && $this->status === AttendanceStatus::Success;
    }
}
