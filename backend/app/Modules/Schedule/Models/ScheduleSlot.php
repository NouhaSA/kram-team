<?php

namespace App\Modules\Schedule\Models;

use App\Modules\Booking\Models\Booking;
use App\Modules\Schedule\Enums\CourseLevel;
use App\Modules\Schedule\Enums\SlotStatus;
use App\Modules\Users\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ScheduleSlot extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'course_id',
        'coach_id',
        'room_id',
        'starts_at',
        'ends_at',
        'capacity',
        'booked_count',
        'waitlist_count',
        'level',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'capacity' => 'integer',
            'booked_count' => 'integer',
            'waitlist_count' => 'integer',
            'level' => CourseLevel::class,
            'status' => SlotStatus::class,
        ];
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    public function coach(): BelongsTo
    {
        return $this->belongsTo(User::class, 'coach_id');
    }

    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function remainingSeats(): int
    {
        return max(0, $this->capacity - $this->booked_count);
    }

    public function isFull(): bool
    {
        return $this->remainingSeats() <= 0;
    }

    public function isBookable(): bool
    {
        return $this->status === SlotStatus::Open
            && $this->starts_at->isFuture();
    }

    public function refreshAvailabilityStatus(): void
    {
        if ($this->status === SlotStatus::Cancelled || $this->status === SlotStatus::Completed) {
            return;
        }

        $this->update([
            'status' => $this->isFull() ? SlotStatus::Full : SlotStatus::Open,
        ]);
    }
}
