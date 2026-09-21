<?php

namespace App\Modules\Schedule\Services;

use App\Modules\Notifications\Events\ScheduleSlotCancelled;
use App\Modules\Notifications\Events\ScheduleSlotCreated;
use App\Modules\Notifications\Events\ScheduleSlotUpdated;
use App\Modules\Schedule\Enums\SlotStatus;
use App\Modules\Schedule\Models\Course;
use App\Modules\Schedule\Models\Room;
use App\Modules\Schedule\Models\ScheduleSlot;
use App\Modules\Users\Services\ActivityLogger;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ScheduleService
{
    public function __construct(
        private readonly ActivityLogger $activity
    ) {}
    public function paginateCourses(bool $activeOnly = true, int $perPage = 20): LengthAwarePaginator
    {
        return Course::query()
            ->when($activeOnly, fn ($q) => $q->where('is_active', true))
            ->orderBy('name')
            ->paginate($perPage);
    }

    public function createCourse(array $data): Course
    {
        return Course::query()->create([
            ...$data,
            'slug' => $data['slug'] ?? Str::slug($data['name']),
        ]);
    }

    public function updateCourse(Course $course, array $data): Course
    {
        $course->update($data);

        return $course->fresh();
    }

    public function paginateRooms(bool $activeOnly = true): LengthAwarePaginator
    {
        return Room::query()
            ->when($activeOnly, fn ($q) => $q->where('is_active', true))
            ->orderBy('name')
            ->paginate(50);
    }

    public function createRoom(array $data): Room
    {
        return Room::query()->create([
            ...$data,
            'slug' => $data['slug'] ?? Str::slug($data['name']),
        ]);
    }

    public function paginateSlots(
        ?Carbon $from = null,
        ?Carbon $to = null,
        ?int $courseId = null,
        ?int $coachId = null,
        int $perPage = 20
    ): LengthAwarePaginator {
        return ScheduleSlot::query()
            ->with(['course', 'coach', 'room'])
            ->when($from, fn ($q) => $q->where('starts_at', '>=', $from))
            ->when($to, fn ($q) => $q->where('starts_at', '<=', $to))
            ->when($courseId, fn ($q) => $q->where('course_id', $courseId))
            ->when($coachId, fn ($q) => $q->where('coach_id', $coachId))
            ->whereNot('status', SlotStatus::Cancelled)
            ->orderBy('starts_at')
            ->paginate($perPage);
    }

    public function findSlot(int $id): ScheduleSlot
    {
        return ScheduleSlot::query()
            ->with(['course', 'coach', 'room', 'bookings.member.user'])
            ->findOrFail($id);
    }

    public function createSlot(array $data): ScheduleSlot
    {
        return DB::transaction(function () use ($data) {
            $course = Course::query()->findOrFail($data['course_id']);
            $startsAt = Carbon::parse($data['starts_at']);
            $endsAt = isset($data['ends_at'])
                ? Carbon::parse($data['ends_at'])
                : $startsAt->copy()->addMinutes($course->default_duration_minutes);

            if ($endsAt->lte($startsAt)) {
                throw ValidationException::withMessages([
                    'ends_at' => ['La fin du créneau doit être après le début.'],
                ]);
            }

            $capacity = $data['capacity'] ?? $course->default_capacity;

            if (isset($data['room_id'])) {
                $room = Room::query()->findOrFail($data['room_id']);
                $capacity = min($capacity, $room->capacity);
            }

            $this->assertNoCoachConflict((int) $data['coach_id'], $startsAt, $endsAt);
            $this->assertNoRoomConflict($data['room_id'] ?? null, $startsAt, $endsAt);

            $slot = ScheduleSlot::query()->create([
                'course_id' => $course->id,
                'coach_id' => $data['coach_id'],
                'room_id' => $data['room_id'] ?? null,
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'capacity' => $capacity,
                'level' => $data['level'] ?? $course->level,
                'status' => SlotStatus::Open,
                'notes' => $data['notes'] ?? null,
            ])->load(['course', 'coach', 'room']);

            ScheduleSlotCreated::dispatch($slot);

            $this->activity->log(
                'slot.create',
                'Créneau #'.$slot->id.' créé'.($slot->course ? ' — '.$slot->course->name : ''),
                $slot,
                ['coach_id' => $slot->coach_id, 'starts_at' => $slot->starts_at?->toIso8601String()]
            );

            return $slot;
        });
    }

    public function updateSlot(ScheduleSlot $slot, array $data): ScheduleSlot
    {
        return DB::transaction(function () use ($slot, $data) {
            $startsAt = isset($data['starts_at']) ? Carbon::parse($data['starts_at']) : $slot->starts_at;
            $endsAt = isset($data['ends_at']) ? Carbon::parse($data['ends_at']) : $slot->ends_at;
            $coachId = $data['coach_id'] ?? $slot->coach_id;
            $roomId = array_key_exists('room_id', $data) ? $data['room_id'] : $slot->room_id;

            if ($endsAt->lte($startsAt)) {
                throw ValidationException::withMessages([
                    'ends_at' => ['La fin du créneau doit être après le début.'],
                ]);
            }

            if (isset($data['capacity']) && $data['capacity'] < $slot->booked_count) {
                throw ValidationException::withMessages([
                    'capacity' => ["La capacité ne peut pas être inférieure aux {$slot->booked_count} places déjà réservées."],
                ]);
            }

            $this->assertNoCoachConflict((int) $coachId, $startsAt, $endsAt, $slot->id);
            $this->assertNoRoomConflict($roomId, $startsAt, $endsAt, $slot->id);

            $slot->update([
                ...collect($data)->except(['starts_at', 'ends_at'])->all(),
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
            ]);

            $slot->refreshAvailabilityStatus();

            $fresh = $slot->fresh(['course', 'coach', 'room']);
            ScheduleSlotUpdated::dispatch($fresh);

            $this->activity->log(
                'slot.update',
                'Créneau #'.$fresh->id.' modifié',
                $fresh,
                ['coach_id' => $fresh->coach_id]
            );

            return $fresh;
        });
    }

    public function cancelSlot(ScheduleSlot $slot, ?string $notes = null): ScheduleSlot
    {
        $slot->update([
            'status' => SlotStatus::Cancelled,
            'notes' => $notes ?? $slot->notes,
        ]);

        $fresh = $slot->fresh(['course', 'coach', 'room', 'bookings.member.user']);
        ScheduleSlotCancelled::dispatch($fresh);

        $this->activity->log(
            'slot.cancel',
            'Créneau #'.$fresh->id.' annulé',
            $fresh
        );

        return $fresh;
    }

    private function assertNoCoachConflict(int $coachId, Carbon $startsAt, Carbon $endsAt, ?int $ignoreSlotId = null): void
    {
        $conflict = ScheduleSlot::query()
            ->where('coach_id', $coachId)
            ->whereNot('status', SlotStatus::Cancelled)
            ->when($ignoreSlotId, fn ($q) => $q->where('id', '!=', $ignoreSlotId))
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->exists();

        if ($conflict) {
            throw ValidationException::withMessages([
                'coach_id' => ['Le coach a déjà un créneau sur ce créneau horaire.'],
            ]);
        }
    }

    private function assertNoRoomConflict(?int $roomId, Carbon $startsAt, Carbon $endsAt, ?int $ignoreSlotId = null): void
    {
        if (! $roomId) {
            return;
        }

        $conflict = ScheduleSlot::query()
            ->where('room_id', $roomId)
            ->whereNot('status', SlotStatus::Cancelled)
            ->when($ignoreSlotId, fn ($q) => $q->where('id', '!=', $ignoreSlotId))
            ->where('starts_at', '<', $endsAt)
            ->where('ends_at', '>', $startsAt)
            ->exists();

        if ($conflict) {
            throw ValidationException::withMessages([
                'room_id' => ['La salle est déjà réservée sur ce créneau.'],
            ]);
        }
    }
}
