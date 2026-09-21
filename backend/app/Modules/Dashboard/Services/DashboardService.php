<?php

namespace App\Modules\Dashboard\Services;

use App\Modules\Attendance\Enums\AttendanceStatus;
use App\Modules\Attendance\Models\Attendance;
use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Booking\Models\Booking;
use App\Modules\GreenRewards\Models\EcoImpact;
use App\Modules\Members\Models\Member;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Models\Payment;
use App\Modules\Quotas\Services\QuotaService;
use App\Modules\Schedule\Models\ScheduleSlot;
use App\Modules\Subscriptions\Enums\SubscriptionStatus;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Subscriptions\Services\SubscriptionService;
use App\Modules\Users\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function __construct(
        private readonly SubscriptionService $subscriptionService,
        private readonly QuotaService $quotaService,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function adminOverview(): array
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $last30 = $now->copy()->subDays(30);

        $activeMembers = Member::query()->where('is_active', true)->count();
        $activeSubscriptions = Subscription::query()
            ->where('status', SubscriptionStatus::Active)
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>', $now))
            ->count();

        $expiredSoon = Subscription::query()
            ->where('status', SubscriptionStatus::Active)
            ->whereBetween('ends_at', [$now, $now->copy()->addDays(7)])
            ->count();

        $revenueMonth = (float) Payment::query()
            ->where('status', PaymentStatus::Completed)
            ->where('paid_at', '>=', $startOfMonth)
            ->sum('amount');

        $revenueToday = (float) Payment::query()
            ->where('status', PaymentStatus::Completed)
            ->whereDate('paid_at', $now->toDateString())
            ->sum('amount');

        $attendancesToday = Attendance::query()
            ->where('status', AttendanceStatus::Success)
            ->whereDate('checked_in_at', $now->toDateString())
            ->count();

        $bookingsToday = Booking::query()
            ->where('status', BookingStatus::Confirmed)
            ->whereHas('scheduleSlot', fn ($q) => $q->whereDate('starts_at', $now->toDateString()))
            ->count();

        return [
            'kpis' => [
                'active_members' => $activeMembers,
                'active_subscriptions' => $activeSubscriptions,
                'subscriptions_expiring_7d' => $expiredSoon,
                'revenue_month' => $revenueMonth,
                'revenue_today' => $revenueToday,
                'attendances_today' => $attendancesToday,
                'bookings_today' => $bookingsToday,
                'currency' => 'TND',
            ],
            'charts' => [
                'revenue_last_30_days' => $this->revenueSeries($last30, $now),
                'attendance_last_30_days' => $this->attendanceSeries($last30, $now),
                'popular_courses' => $this->popularCourses($last30),
            ],
            'green' => [
                'total_eco_points' => (int) Member::query()->sum('eco_points'),
                'co2_kg' => (float) EcoImpact::query()->sum('co2_kg'),
                'trees_planted' => (int) EcoImpact::query()->sum('trees_planted'),
            ],
            'generated_at' => $now->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function coachOverview(User $coach): array
    {
        $now = now();

        $upcomingSlots = ScheduleSlot::query()
            ->with(['course', 'room'])
            ->where('coach_id', $coach->id)
            ->where('starts_at', '>=', $now)
            ->whereNot('status', 'cancelled')
            ->orderBy('starts_at')
            ->limit(10)
            ->get()
            ->map(fn (ScheduleSlot $slot) => [
                'id' => $slot->id,
                'course' => $slot->course?->name,
                'room' => $slot->room?->name,
                'starts_at' => $slot->starts_at->toIso8601String(),
                'ends_at' => $slot->ends_at->toIso8601String(),
                'capacity' => $slot->capacity,
                'booked_count' => $slot->booked_count,
                'remaining_seats' => $slot->remainingSeats(),
                'status' => $slot->status->value,
            ]);

        $todaySlots = ScheduleSlot::query()
            ->where('coach_id', $coach->id)
            ->whereDate('starts_at', $now->toDateString())
            ->whereNot('status', 'cancelled')
            ->count();

        $assignedMembers = Member::query()
            ->with('user')
            ->where('coach_id', $coach->id)
            ->where('is_active', true)
            ->limit(20)
            ->get()
            ->map(fn (Member $m) => [
                'id' => $m->id,
                'full_name' => $m->user->full_name,
                'eco_points' => $m->eco_points,
                'green_level' => $m->green_level,
            ]);

        $slotIds = ScheduleSlot::query()
            ->where('coach_id', $coach->id)
            ->where('starts_at', '>=', $now)
            ->pluck('id');

        $upcomingBookings = Booking::query()
            ->with(['member.user', 'scheduleSlot.course'])
            ->whereIn('schedule_slot_id', $slotIds)
            ->where('status', BookingStatus::Confirmed)
            ->orderBy('booked_at')
            ->limit(15)
            ->get()
            ->map(fn (Booking $b) => [
                'id' => $b->id,
                'member' => $b->member?->user?->full_name,
                'course' => $b->scheduleSlot?->course?->name,
                'starts_at' => $b->scheduleSlot?->starts_at?->toIso8601String(),
            ]);

        return [
            'coach' => [
                'id' => $coach->id,
                'full_name' => $coach->full_name,
            ],
            'kpis' => [
                'sessions_today' => $todaySlots,
                'upcoming_sessions' => $upcomingSlots->count(),
                'assigned_members' => Member::query()->where('coach_id', $coach->id)->where('is_active', true)->count(),
            ],
            'upcoming_slots' => $upcomingSlots,
            'assigned_members' => $assignedMembers,
            'upcoming_bookings' => $upcomingBookings,
            'generated_at' => $now->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function memberOverview(Member $member): array
    {
        $subscription = $this->subscriptionService->getActiveForMember($member);
        $quotas = $subscription
            ? $this->quotaService->getBalances($subscription)
            : collect();
        $alerts = $subscription
            ? $this->quotaService->getAlerts($subscription)
            : [];

        $nextBookings = Booking::query()
            ->with(['scheduleSlot.course', 'scheduleSlot.coach', 'scheduleSlot.room'])
            ->where('member_id', $member->id)
            ->whereIn('status', [BookingStatus::Confirmed, BookingStatus::Waitlist])
            ->whereHas('scheduleSlot', fn ($q) => $q->where('starts_at', '>=', now()))
            ->get()
            ->sortBy(fn (Booking $b) => $b->scheduleSlot?->starts_at)
            ->take(5)
            ->values()
            ->map(fn (Booking $b) => [
                'id' => $b->id,
                'status' => $b->status->value,
                'waitlist_position' => $b->waitlist_position,
                'qr_code' => $b->qr_code,
                'course' => $b->scheduleSlot?->course?->name,
                'starts_at' => $b->scheduleSlot?->starts_at?->toIso8601String(),
                'coach' => $b->scheduleSlot?->coach?->full_name,
                'room' => $b->scheduleSlot?->room?->name,
            ]);

        $recentAttendances = Attendance::query()
            ->where('member_id', $member->id)
            ->where('status', AttendanceStatus::Success)
            ->latest('checked_in_at')
            ->limit(5)
            ->get(['id', 'checked_in_at', 'checked_out_at', 'duration_minutes', 'activity_type']);

        $payments = Payment::query()
            ->where('member_id', $member->id)
            ->latest()
            ->limit(5)
            ->get(['id', 'reference', 'amount', 'status', 'method', 'paid_at', 'type']);

        $attendancesMonth = Attendance::query()
            ->where('member_id', $member->id)
            ->where('status', AttendanceStatus::Success)
            ->where('checked_in_at', '>=', now()->startOfMonth())
            ->count();

        $hoursMonth = (float) Attendance::query()
            ->where('member_id', $member->id)
            ->where('status', AttendanceStatus::Success)
            ->where('checked_in_at', '>=', now()->startOfMonth())
            ->sum('duration_minutes') / 60;

        $bookingsTotal = Booking::query()
            ->where('member_id', $member->id)
            ->whereIn('status', [BookingStatus::Confirmed, BookingStatus::Attended])
            ->count();

        $bookingsUpcoming = Booking::query()
            ->where('member_id', $member->id)
            ->whereIn('status', [BookingStatus::Confirmed, BookingStatus::Waitlist])
            ->whereHas('scheduleSlot', fn ($q) => $q->where('starts_at', '>=', now()))
            ->count();

        $spentTotal = (float) Payment::query()
            ->where('member_id', $member->id)
            ->where('status', PaymentStatus::Completed)
            ->sum('amount');

        $spentMonth = (float) Payment::query()
            ->where('member_id', $member->id)
            ->where('status', PaymentStatus::Completed)
            ->where('paid_at', '>=', now()->startOfMonth())
            ->sum('amount');

        $attendanceSeries = Attendance::query()
            ->select(DB::raw('DATE(checked_in_at) as day'), DB::raw('COUNT(*) as total'))
            ->where('member_id', $member->id)
            ->where('status', AttendanceStatus::Success)
            ->where('checked_in_at', '>=', now()->subDays(30))
            ->groupBy('day')
            ->orderBy('day')
            ->get()
            ->map(fn ($row) => [
                'date' => $row->day,
                'total' => (int) $row->total,
            ])
            ->all();

        $healthProfile = \App\Modules\HealthTracking\Models\MemberHealthProfile::query()
            ->where('member_id', $member->id)
            ->first();
        $latestHealth = \App\Modules\HealthTracking\Models\MemberHealthEntry::query()
            ->where('member_id', $member->id)
            ->latest('recorded_at')
            ->first();

        return [
            'member' => [
                'id' => $member->id,
                'full_name' => $member->user->full_name,
                'email' => $member->user->email,
                'phone' => $member->user->phone,
                'qr_uuid' => $member->qr_uuid,
                'avatar' => $member->user->avatar,
                'city' => $member->city,
                'goals' => $member->goals,
                'is_active' => $member->is_active,
                'coach' => $member->coach?->full_name,
                'coach_id' => $member->coach_id,
            ],
            'stats' => [
                'attendances_month' => $attendancesMonth,
                'hours_month' => round($hoursMonth, 1),
                'attendances_total' => Attendance::query()
                    ->where('member_id', $member->id)
                    ->where('status', AttendanceStatus::Success)
                    ->count(),
                'bookings_total' => $bookingsTotal,
                'bookings_upcoming' => $bookingsUpcoming,
                'spent_total' => $spentTotal,
                'spent_month' => $spentMonth,
                'currency' => 'TND',
            ],
            'charts' => [
                'attendance_last_30_days' => $attendanceSeries,
            ],
            'subscription' => $subscription ? [
                'id' => $subscription->id,
                'offer' => $subscription->offer?->name,
                'status' => $subscription->status->value,
                'starts_at' => $subscription->starts_at?->toIso8601String(),
                'ends_at' => $subscription->ends_at?->toIso8601String(),
            ] : null,
            'quotas' => $quotas,
            'quota_alerts' => $alerts,
            'next_bookings' => $nextBookings,
            'recent_attendances' => $recentAttendances->map(fn (Attendance $a) => [
                'id' => $a->id,
                'checked_in_at' => $a->checked_in_at?->toIso8601String(),
                'checked_out_at' => $a->checked_out_at?->toIso8601String(),
                'duration_minutes' => $a->duration_minutes,
                'activity_type' => $a->activity_type,
            ])->all(),
            'recent_payments' => $payments->map(fn (Payment $p) => [
                'id' => $p->id,
                'reference' => $p->reference,
                'amount' => (float) $p->amount,
                'status' => $p->status->value,
                'method' => $p->method?->value,
                'type' => $p->type?->value,
                'paid_at' => $p->paid_at?->toIso8601String(),
            ])->all(),
            'health' => [
                'height_cm' => $healthProfile?->height_cm,
                'goal' => $healthProfile?->goal?->value,
                'goal_label' => $healthProfile?->goal?->label(),
                'target_weight_kg' => $healthProfile?->target_weight_kg,
                'current_weight_kg' => $latestHealth?->weight_kg,
                'last_recorded_at' => $latestHealth?->recorded_at?->toIso8601String(),
            ],
            'green' => [
                'eco_points' => $member->eco_points,
                'green_score' => $member->green_score,
                'green_level' => $member->green_level,
            ],
            'generated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function receptionOverview(): array
    {
        $now = now();

        return [
            'kpis' => [
                'checkins_today' => Attendance::query()
                    ->where('status', AttendanceStatus::Success)
                    ->whereDate('checked_in_at', $now->toDateString())
                    ->count(),
                'open_sessions' => Attendance::query()
                    ->where('status', AttendanceStatus::Success)
                    ->whereNotNull('checked_in_at')
                    ->whereNull('checked_out_at')
                    ->count(),
                'denied_today' => Attendance::query()
                    ->where('status', AttendanceStatus::Denied)
                    ->whereDate('created_at', $now->toDateString())
                    ->count(),
                'bookings_today' => Booking::query()
                    ->where('status', BookingStatus::Confirmed)
                    ->whereHas('scheduleSlot', fn ($q) => $q->whereDate('starts_at', $now->toDateString()))
                    ->count(),
            ],
            'open_sessions' => Attendance::query()
                ->with(['member.user'])
                ->where('status', AttendanceStatus::Success)
                ->whereNotNull('checked_in_at')
                ->whereNull('checked_out_at')
                ->latest('checked_in_at')
                ->limit(20)
                ->get()
                ->map(fn (Attendance $a) => [
                    'id' => $a->id,
                    'member' => $a->member?->user?->full_name,
                    'checked_in_at' => $a->checked_in_at?->toIso8601String(),
                    'activity_type' => $a->activity_type,
                ]),
            'upcoming_slots' => ScheduleSlot::query()
                ->with(['course', 'room', 'coach'])
                ->whereBetween('starts_at', [$now, $now->copy()->addHours(6)])
                ->whereNot('status', 'cancelled')
                ->orderBy('starts_at')
                ->limit(10)
                ->get()
                ->map(fn (ScheduleSlot $s) => [
                    'id' => $s->id,
                    'course' => $s->course?->name,
                    'starts_at' => $s->starts_at->toIso8601String(),
                    'capacity' => $s->capacity,
                    'booked_count' => $s->booked_count,
                    'remaining_seats' => $s->remainingSeats(),
                    'coach' => $s->coach?->full_name,
                    'room' => $s->room?->name,
                ]),
            'generated_at' => $now->toIso8601String(),
        ];
    }

    /**
     * @return list<array{date: string, total: float}>
     */
    private function revenueSeries(Carbon $from, Carbon $to): array
    {
        $rows = Payment::query()
            ->selectRaw('DATE(paid_at) as day, SUM(amount) as total')
            ->where('status', PaymentStatus::Completed)
            ->whereBetween('paid_at', [$from, $to])
            ->groupBy('day')
            ->orderBy('day')
            ->pluck('total', 'day');

        return $this->fillDailySeries($from, $to, $rows, true);
    }

    /**
     * @return list<array{date: string, total: float|int}>
     */
    private function attendanceSeries(Carbon $from, Carbon $to): array
    {
        $rows = Attendance::query()
            ->selectRaw('DATE(checked_in_at) as day, COUNT(*) as total')
            ->where('status', AttendanceStatus::Success)
            ->whereBetween('checked_in_at', [$from, $to])
            ->groupBy('day')
            ->orderBy('day')
            ->pluck('total', 'day');

        return $this->fillDailySeries($from, $to, $rows, false);
    }

    /**
     * @param  \Illuminate\Support\Collection<string, mixed>  $rows
     * @return list<array{date: string, total: float|int}>
     */
    private function fillDailySeries(Carbon $from, Carbon $to, $rows, bool $asFloat): array
    {
        $series = [];
        $cursor = $from->copy()->startOfDay();

        while ($cursor->lte($to)) {
            $key = $cursor->toDateString();
            $value = $rows[$key] ?? 0;
            $series[] = [
                'date' => $key,
                'total' => $asFloat ? (float) $value : (int) $value,
            ];
            $cursor->addDay();
        }

        return $series;
    }

    /**
     * @return list<array{course: string, bookings: int}>
     */
    private function popularCourses(Carbon $from): array
    {
        return Booking::query()
            ->select('courses.name as course', DB::raw('COUNT(bookings.id) as bookings'))
            ->join('schedule_slots', 'schedule_slots.id', '=', 'bookings.schedule_slot_id')
            ->join('courses', 'courses.id', '=', 'schedule_slots.course_id')
            ->where('bookings.status', BookingStatus::Confirmed)
            ->where('bookings.booked_at', '>=', $from)
            ->groupBy('courses.name')
            ->orderByDesc('bookings')
            ->limit(5)
            ->get()
            ->map(fn ($row) => [
                'course' => $row->course,
                'bookings' => (int) $row->bookings,
            ])
            ->all();
    }
}
