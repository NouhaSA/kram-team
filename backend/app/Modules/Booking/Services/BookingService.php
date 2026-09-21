<?php

namespace App\Modules\Booking\Services;

use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Booking\Models\Booking;
use App\Modules\Members\Models\Member;
use App\Modules\Notifications\Events\BookingCreated;
use App\Modules\Schedule\Enums\SlotStatus;
use App\Modules\Schedule\Models\ScheduleSlot;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Subscriptions\Services\SubscriptionService;
use App\Modules\Users\Models\User;
use App\Modules\Users\Services\ActivityLogger;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class BookingService
{
    public function __construct(
        private readonly SubscriptionService $subscriptionService,
        private readonly ActivityLogger $activity
    ) {}

    public function paginate(?int $memberId = null, ?int $slotId = null, int $perPage = 20): LengthAwarePaginator
    {
        return Booking::query()
            ->with(['member.user', 'scheduleSlot.course', 'scheduleSlot.coach', 'scheduleSlot.room', 'subscription.offer'])
            ->when($memberId, fn ($q) => $q->where('member_id', $memberId))
            ->when($slotId, fn ($q) => $q->where('schedule_slot_id', $slotId))
            ->latest('booked_at')
            ->paginate($perPage);
    }

    public function find(int $id): Booking
    {
        return Booking::query()
            ->with(['member.user', 'scheduleSlot.course', 'scheduleSlot.coach', 'scheduleSlot.room', 'subscription.offer'])
            ->findOrFail($id);
    }

    public function book(
        ScheduleSlot $slot,
        Member $member,
        Subscription $subscription,
        ?User $createdBy = null,
        ?string $notes = null,
        bool $requiresApproval = false
    ): Booking {
        $booking = DB::transaction(function () use ($slot, $member, $subscription, $createdBy, $notes, $requiresApproval) {
            $slot = ScheduleSlot::query()->lockForUpdate()->findOrFail($slot->id);

            if (! $slot->isBookable() && $slot->status !== SlotStatus::Full) {
                throw ValidationException::withMessages([
                    'schedule_slot_id' => ['Ce créneau n\'est pas réservable.'],
                ]);
            }

            if ($slot->starts_at->isPast()) {
                throw ValidationException::withMessages([
                    'schedule_slot_id' => ['Impossible de réserver un créneau passé.'],
                ]);
            }

            $existing = Booking::query()
                ->where('schedule_slot_id', $slot->id)
                ->where('member_id', $member->id)
                ->whereIn('status', [
                    BookingStatus::Pending->value,
                    BookingStatus::Confirmed->value,
                    BookingStatus::Waitlist->value,
                ])
                ->first();

            if ($existing) {
                throw ValidationException::withMessages([
                    'member_id' => ['Cet adhérent a déjà une réservation sur ce créneau.'],
                ]);
            }

            if (! $member->is_active) {
                throw ValidationException::withMessages([
                    'member_id' => ['Adhérent inactif.'],
                ]);
            }

            $subscription = $this->subscriptionService->findActiveForMember($member, $subscription->id);

            if (! $subscription) {
                throw ValidationException::withMessages([
                    'subscription_id' => ['Abonnement invalide ou inactif pour cet adhérent.'],
                ]);
            }

            $subscription->loadMissing('offer');

            if ($subscription->offer && $subscription->offer->requires_booking === false) {
                throw ValidationException::withMessages([
                    'subscription_id' => ['Cette offre ne permet pas de réservation.'],
                ]);
            }

            $relations = ['member.user', 'scheduleSlot.course', 'scheduleSlot.room', 'subscription.offer'];

            // Member self-booking: wait for admin/gestionnaire approval
            if ($requiresApproval) {
                return Booking::query()->create([
                    'schedule_slot_id' => $slot->id,
                    'member_id' => $member->id,
                    'subscription_id' => $subscription->id,
                    'status' => BookingStatus::Pending,
                    'created_by' => $createdBy?->id,
                    'notes' => $notes,
                ])->load($relations);
            }

            if ($slot->isFull()) {
                $position = $slot->waitlist_count + 1;

                $booking = Booking::query()->create([
                    'schedule_slot_id' => $slot->id,
                    'member_id' => $member->id,
                    'subscription_id' => $subscription->id,
                    'status' => BookingStatus::Waitlist,
                    'waitlist_position' => $position,
                    'created_by' => $createdBy?->id,
                    'notes' => $notes,
                ]);

                $slot->increment('waitlist_count');

                return $booking->load($relations);
            }

            $booking = Booking::query()->create([
                'schedule_slot_id' => $slot->id,
                'member_id' => $member->id,
                'subscription_id' => $subscription->id,
                'status' => BookingStatus::Confirmed,
                'created_by' => $createdBy?->id,
                'notes' => $notes,
            ]);

            $slot->increment('booked_count');
            $slot->refresh();
            $slot->refreshAvailabilityStatus();

            return $booking->load($relations);
        });

        BookingCreated::dispatch($booking);

        $this->activity->log(
            'booking.'.$booking->status->value,
            'Réservation #'.$booking->id.' — '.$booking->status->label(),
            $booking,
            [
                'member_id' => $booking->member_id,
                'schedule_slot_id' => $booking->schedule_slot_id,
                'status' => $booking->status->value,
            ],
            $createdBy
        );

        return $booking;
    }

    public function accept(Booking $booking): Booking
    {
        $accepted = DB::transaction(function () use ($booking) {
            $booking = Booking::query()->lockForUpdate()->findOrFail($booking->id);
            $slot = ScheduleSlot::query()->lockForUpdate()->findOrFail($booking->schedule_slot_id);

            if ($booking->status !== BookingStatus::Pending) {
                throw ValidationException::withMessages([
                    'booking' => ['Seules les réservations en attente peuvent être acceptées.'],
                ]);
            }

            if ($slot->starts_at->isPast() || $slot->status === SlotStatus::Cancelled) {
                throw ValidationException::withMessages([
                    'booking' => ['Ce créneau n\'est plus disponible.'],
                ]);
            }

            if ($slot->isFull()) {
                $position = $slot->waitlist_count + 1;
                $booking->update([
                    'status' => BookingStatus::Waitlist,
                    'waitlist_position' => $position,
                ]);
                $slot->increment('waitlist_count');
            } else {
                $booking->update([
                    'status' => BookingStatus::Confirmed,
                    'waitlist_position' => null,
                ]);
                $slot->increment('booked_count');
                $slot->refresh();
                $slot->refreshAvailabilityStatus();
            }

            return $booking->fresh([
                'member.user',
                'scheduleSlot.course',
                'scheduleSlot.room',
                'subscription.offer',
            ]);
        });

        BookingCreated::dispatch($accepted);

        $this->activity->log(
            'booking.accept',
            'Réservation #'.$accepted->id.' acceptée → '.$accepted->status->label(),
            $accepted,
            ['status' => $accepted->status->value]
        );

        return $accepted;
    }

    public function cancel(Booking $booking, ?string $reason = null): Booking
    {
        return DB::transaction(function () use ($booking, $reason) {
            $booking = Booking::query()->lockForUpdate()->findOrFail($booking->id);
            $slot = ScheduleSlot::query()->lockForUpdate()->findOrFail($booking->schedule_slot_id);

            if (! $booking->isActive()) {
                throw ValidationException::withMessages([
                    'booking' => ['Cette réservation ne peut plus être annulée.'],
                ]);
            }

            $wasConfirmed = $booking->status === BookingStatus::Confirmed;
            $wasWaitlist = $booking->status === BookingStatus::Waitlist;

            $booking->update([
                'status' => BookingStatus::Cancelled,
                'cancelled_at' => now(),
                'cancellation_reason' => $reason,
                'waitlist_position' => null,
            ]);

            if ($wasConfirmed) {
                $slot->decrement('booked_count');
                $slot->refresh();
                $this->promoteFromWaitlist($slot);
            } elseif ($wasWaitlist) {
                $slot->decrement('waitlist_count');
                $this->reindexWaitlist($slot);
            }

            $slot->refresh();
            $slot->refreshAvailabilityStatus();

            $fresh = $booking->fresh(['member.user', 'scheduleSlot.course', 'subscription.offer']);

            $this->activity->log(
                'booking.cancel',
                'Réservation #'.$fresh->id.' annulée',
                $fresh,
                ['reason' => $reason, 'previous' => $wasConfirmed ? 'confirmed' : ($wasWaitlist ? 'waitlist' : 'pending')]
            );

            return $fresh;
        });
    }

    private function promoteFromWaitlist(ScheduleSlot $slot): void
    {
        if ($slot->status === SlotStatus::Cancelled || $slot->starts_at->isPast()) {
            return;
        }

        $next = Booking::query()
            ->where('schedule_slot_id', $slot->id)
            ->where('status', BookingStatus::Waitlist)
            ->orderBy('waitlist_position')
            ->orderBy('booked_at')
            ->lockForUpdate()
            ->first();

        if (! $next) {
            return;
        }

        $next->update([
            'status' => BookingStatus::Confirmed,
            'waitlist_position' => null,
        ]);

        $slot->increment('booked_count');
        $slot->decrement('waitlist_count');
        $this->reindexWaitlist($slot);
    }

    private function reindexWaitlist(ScheduleSlot $slot): void
    {
        $waitlisted = Booking::query()
            ->where('schedule_slot_id', $slot->id)
            ->where('status', BookingStatus::Waitlist)
            ->orderBy('waitlist_position')
            ->orderBy('booked_at')
            ->get();

        foreach ($waitlisted as $index => $booking) {
            $booking->update(['waitlist_position' => $index + 1]);
        }

        $slot->update(['waitlist_count' => $waitlisted->count()]);
    }
}
