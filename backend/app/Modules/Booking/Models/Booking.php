<?php

namespace App\Modules\Booking\Models;

use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Members\Models\Member;
use App\Modules\Schedule\Models\ScheduleSlot;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Booking extends Model
{
    protected $fillable = [
        'schedule_slot_id',
        'member_id',
        'subscription_id',
        'status',
        'waitlist_position',
        'qr_code',
        'booked_at',
        'cancelled_at',
        'cancellation_reason',
        'created_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'status' => BookingStatus::class,
            'waitlist_position' => 'integer',
            'booked_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Booking $booking) {
            if (empty($booking->qr_code)) {
                $booking->qr_code = (string) Str::uuid();
            }

            if (empty($booking->booked_at)) {
                $booking->booked_at = now();
            }
        });
    }

    public function scheduleSlot(): BelongsTo
    {
        return $this->belongsTo(ScheduleSlot::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isActive(): bool
    {
        return in_array($this->status, [
            BookingStatus::Pending,
            BookingStatus::Confirmed,
            BookingStatus::Waitlist,
        ], true);
    }
}
