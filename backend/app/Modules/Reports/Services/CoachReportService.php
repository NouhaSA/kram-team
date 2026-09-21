<?php

namespace App\Modules\Reports\Services;

use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Core\Enums\UserRole;
use App\Modules\Schedule\Enums\SlotStatus;
use App\Modules\Schedule\Models\ScheduleSlot;
use App\Modules\Users\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class CoachReportService
{
    /**
     * @return array{from: Carbon, to: Carbon, period: string, label: string}
     */
    public function resolvePeriod(string $period, ?string $date = null): array
    {
        $anchor = $date ? Carbon::parse($date) : now();

        return match ($period) {
            'day' => [
                'period' => 'day',
                'label' => 'Journalier',
                'from' => $anchor->copy()->startOfDay(),
                'to' => $anchor->copy()->endOfDay(),
            ],
            'week' => [
                'period' => 'week',
                'label' => 'Hebdomadaire',
                'from' => $anchor->copy()->startOfWeek(),
                'to' => $anchor->copy()->endOfWeek(),
            ],
            default => [
                'period' => 'month',
                'label' => 'Mensuel',
                'from' => $anchor->copy()->startOfMonth(),
                'to' => $anchor->copy()->endOfMonth(),
            ],
        };
    }

    /**
     * @return array<string, mixed>
     */
    public function report(?int $coachId, string $period, ?string $date = null): array
    {
        $range = $this->resolvePeriod($period, $date);
        $coaches = $this->coaches($coachId);

        $reports = $coaches->map(fn (User $coach) => $this->buildCoachReport(
            $coach,
            $range['from'],
            $range['to'],
            $range['period']
        ))->values()->all();

        $totals = [
            'coaches' => count($reports),
            'sessions' => array_sum(array_column($reports, 'sessions')),
            'hours' => round(array_sum(array_column($reports, 'hours')), 2),
            'people_trained' => array_sum(array_column($reports, 'people_trained')),
            'bookings' => array_sum(array_column($reports, 'bookings')),
            'salary' => round(array_sum(array_column($reports, 'salary')), 3),
            'currency' => $reports[0]['currency'] ?? 'TND',
        ];

        return [
            'period' => $range['period'],
            'period_label' => $range['label'],
            'from' => $range['from']->toIso8601String(),
            'to' => $range['to']->toIso8601String(),
            'totals' => $totals,
            'coaches' => $reports,
        ];
    }

    /**
     * @return Collection<int, User>
     */
    private function coaches(?int $coachId): Collection
    {
        $query = User::query()
            ->where('is_active', true)
            ->where(function ($q) {
                $q->whereHas('roles', fn ($r) => $r->where('slug', UserRole::Coach->value))
                    ->orWhereIn('id', ScheduleSlot::query()->select('coach_id')->distinct());
            })
            ->orderBy('last_name')
            ->orderBy('first_name');

        if ($coachId) {
            $query->where('id', $coachId);
        }

        return $query->get();
    }

    /**
     * @return array<string, mixed>
     */
    private function buildCoachReport(User $coach, Carbon $from, Carbon $to, string $period): array
    {
        $slots = ScheduleSlot::query()
            ->with(['course', 'room'])
            ->where('coach_id', $coach->id)
            ->whereNot('status', SlotStatus::Cancelled)
            ->where('starts_at', '>=', $from)
            ->where('starts_at', '<=', $to)
            ->orderBy('starts_at')
            ->get();

        $slotIds = $slots->pluck('id');

        $hours = round($slots->sum(function (ScheduleSlot $slot) {
            return max(0, $slot->starts_at->diffInMinutes($slot->ends_at) / 60);
        }), 2);

        $bookingRows = $slotIds->isEmpty()
            ? collect()
            : DB::table('bookings')
                ->whereIn('schedule_slot_id', $slotIds)
                ->whereIn('status', [
                    BookingStatus::Confirmed->value,
                    BookingStatus::Attended->value,
                ])
                ->select('member_id', 'schedule_slot_id')
                ->get();

        $peopleTrained = $bookingRows->pluck('member_id')->unique()->count();
        $bookings = $bookingRows->count();

        $assignedMembers = DB::table('members')
            ->where('coach_id', $coach->id)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->count();

        $series = $this->series($slots, $bookingRows, $from, $to, $period);

        $hourlyRate = $coach->hourly_rate !== null ? (float) $coach->hourly_rate : 35.0;
        $currency = $coach->currency ?: 'TND';
        $salary = round($hours * $hourlyRate, 3);

        return [
            'coach' => [
                'id' => $coach->id,
                'full_name' => $coach->full_name,
                'email' => $coach->email,
            ],
            'sessions' => $slots->count(),
            'hours' => $hours,
            'hourly_rate' => $hourlyRate,
            'currency' => $currency,
            'salary' => $salary,
            'people_trained' => $peopleTrained,
            'bookings' => $bookings,
            'assigned_members' => $assignedMembers,
            'avg_people_per_session' => $slots->count() > 0
                ? round($bookings / $slots->count(), 1)
                : 0,
            'series' => $series,
            'slots' => $slots->map(fn (ScheduleSlot $slot) => [
                'id' => $slot->id,
                'course' => $slot->course?->name,
                'room' => $slot->room?->name,
                'starts_at' => $slot->starts_at->toIso8601String(),
                'ends_at' => $slot->ends_at->toIso8601String(),
                'hours' => round(max(0, $slot->starts_at->diffInMinutes($slot->ends_at) / 60), 2),
                'booked_count' => $slot->booked_count,
                'capacity' => $slot->capacity,
                'status' => $slot->status->value,
                'slot_pay' => round(
                    max(0, $slot->starts_at->diffInMinutes($slot->ends_at) / 60) * $hourlyRate,
                    3
                ),
            ])->values()->all(),
        ];
    }

    /**
     * @param  Collection<int, ScheduleSlot>  $slots
     * @param  Collection<int, object>  $bookingRows
     * @return list<array<string, mixed>>
     */
    private function series(Collection $slots, Collection $bookingRows, Carbon $from, Carbon $to, string $period): array
    {
        $bucketFormat = $period === 'day' ? 'H:00' : 'Y-m-d';
        $buckets = [];

        if ($period === 'day') {
            for ($h = 0; $h < 24; $h++) {
                $key = sprintf('%02d:00', $h);
                $buckets[$key] = ['label' => $key, 'sessions' => 0, 'hours' => 0.0, 'bookings' => 0];
            }
        } else {
            $cursor = $from->copy()->startOfDay();
            $end = $to->copy()->startOfDay();
            while ($cursor->lte($end)) {
                $key = $cursor->format('Y-m-d');
                $buckets[$key] = [
                    'label' => $cursor->toDateString(),
                    'sessions' => 0,
                    'hours' => 0.0,
                    'bookings' => 0,
                ];
                $cursor->addDay();
            }
        }

        $bookingsBySlot = $bookingRows->groupBy('schedule_slot_id');

        foreach ($slots as $slot) {
            $key = $slot->starts_at->format($bucketFormat);
            if (! isset($buckets[$key])) {
                $buckets[$key] = ['label' => $key, 'sessions' => 0, 'hours' => 0.0, 'bookings' => 0];
            }
            $hours = max(0, $slot->starts_at->diffInMinutes($slot->ends_at) / 60);
            $buckets[$key]['sessions']++;
            $buckets[$key]['hours'] = round($buckets[$key]['hours'] + $hours, 2);
            $buckets[$key]['bookings'] += $bookingsBySlot->get($slot->id)?->count() ?? 0;
        }

        return array_values($buckets);
    }
}
