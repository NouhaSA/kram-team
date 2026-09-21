<?php

namespace App\Modules\Notifications\Listeners;

use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Booking\Models\Booking;
use App\Modules\Notifications\Enums\NotificationCategory;
use App\Modules\Notifications\Events\BookingCreated;
use App\Modules\Notifications\Events\EcoActionApproved;
use App\Modules\Notifications\Events\EcoActionSubmitted;
use App\Modules\Notifications\Events\PaymentRecorded;
use App\Modules\Notifications\Events\RewardRedemptionProcessed;
use App\Modules\Notifications\Events\RewardRedemptionRequested;
use App\Modules\Notifications\Events\ScheduleSlotCancelled;
use App\Modules\Notifications\Events\ScheduleSlotCreated;
use App\Modules\Notifications\Events\ScheduleSlotUpdated;
use App\Modules\Notifications\Events\SubscriptionCreated;
use App\Modules\Notifications\Services\NotificationService;
use App\Modules\Users\Models\Role;
use App\Modules\Users\Models\User;

class SendDomainNotifications
{
    public function __construct(
        private readonly NotificationService $notifications
    ) {}

    public function handleBookingCreated(BookingCreated $event): void
    {
        $booking = $event->booking->loadMissing(['member.user', 'scheduleSlot.course']);
        $user = $booking->member?->user;
        $course = $booking->scheduleSlot?->course?->name ?? 'cours';
        $startsAt = $booking->scheduleSlot?->starts_at?->format('d/m/Y H:i') ?? '';
        $status = $booking->status->label();
        $memberName = trim(($user?->first_name ?? '').' '.($user?->last_name ?? '')) ?: 'Adhérent';

        if ($booking->status === BookingStatus::Pending) {
            $this->notifications->sendMany(
                $this->staffUsers(),
                'Réservation à valider',
                "{$memberName} demande « {$course} » ({$startsAt}). Accepte ou annule dans Réservations.",
                NotificationCategory::Booking,
                ['type' => 'booking_pending', 'booking_id' => $booking->id],
                false
            );
        }

        if (! $user) {
            return;
        }

        $this->notifications->send(
            $user,
            'Réservation '.$status,
            "Votre réservation pour « {$course} » ({$startsAt}) est {$status}.",
            NotificationCategory::Booking,
            [
                'booking_id' => $booking->id,
                'qr_code' => $booking->qr_code,
                'type' => 'booking_'.$booking->status->value,
            ]
        );
    }

    public function handleSubscriptionCreated(SubscriptionCreated $event): void
    {
        $subscription = $event->subscription->loadMissing(['member.user', 'offer']);
        $user = $subscription->member?->user;

        if (! $user) {
            return;
        }

        $offer = $subscription->offer?->name ?? 'offre';

        $this->notifications->send(
            $user,
            'Abonnement activé',
            "Votre abonnement « {$offer} » est actif jusqu'au ".($subscription->ends_at?->format('d/m/Y') ?? 'illimité').'.',
            NotificationCategory::Subscription,
            ['subscription_id' => $subscription->id]
        );
    }

    public function handlePaymentRecorded(PaymentRecorded $event): void
    {
        $payment = $event->payment->loadMissing(['member.user']);
        $user = $payment->member?->user;

        if (! $user) {
            return;
        }

        $this->notifications->send(
            $user,
            'Paiement enregistré',
            "Paiement {$payment->reference} de {$payment->amount} {$payment->currency} — {$payment->status->label()}.",
            NotificationCategory::Payment,
            ['payment_id' => $payment->id, 'reference' => $payment->reference]
        );
    }

    public function handleEcoActionSubmitted(EcoActionSubmitted $event): void
    {
        $action = $event->action->loadMissing(['member.user', 'rule']);
        $memberName = trim(($action->member?->user?->first_name ?? '').' '.($action->member?->user?->last_name ?? '')) ?: 'Adhérent';
        $rule = $action->rule?->name ?? 'action éco';

        $this->notifications->sendMany(
            $this->staffUsers(),
            'Action Green à valider',
            "{$memberName} a soumis « {$rule} » (+{$action->points} pts). Valide dans Green Rewards.",
            NotificationCategory::Green,
            ['type' => 'eco_action_pending', 'action_id' => $action->id],
            false
        );
    }

    public function handleEcoActionApproved(EcoActionApproved $event): void
    {
        $action = $event->action->loadMissing(['member.user', 'rule']);
        $user = $action->member?->user;

        if (! $user) {
            return;
        }

        $rule = $action->rule?->name ?? 'action éco';

        $this->notifications->send(
            $user,
            'Points Green crédités',
            "Action « {$rule} » validée : +{$action->points} eco points.",
            NotificationCategory::Green,
            ['action_id' => $action->id, 'points' => $action->points]
        );
    }

    public function handleRewardRedemptionRequested(RewardRedemptionRequested $event): void
    {
        $redemption = $event->redemption->loadMissing(['reward', 'member.user']);
        $memberName = trim(($redemption->member?->user?->first_name ?? '').' '.($redemption->member?->user?->last_name ?? '')) ?: 'Adhérent';
        $reward = $redemption->reward?->name ?? 'récompense';

        $this->notifications->sendMany(
            $this->staffUsers(),
            'Échange boutique à accepter',
            "{$memberName} demande « {$reward} » ({$redemption->points_spent} pts). Accepte ou refuse dans Green Rewards.",
            NotificationCategory::Green,
            ['type' => 'eco_redemption_pending', 'redemption_id' => $redemption->id],
            false
        );
    }

    public function handleRewardRedemptionProcessed(RewardRedemptionProcessed $event): void
    {
        $redemption = $event->redemption->loadMissing(['reward', 'member.user']);
        $user = $redemption->member?->user;

        if (! $user) {
            return;
        }

        $reward = $redemption->reward?->name ?? 'récompense';
        $approved = $event->decision === 'approved';

        $this->notifications->send(
            $user,
            $approved ? 'Échange accepté' : 'Échange refusé',
            $approved
                ? "Ton échange « {$reward} » a été accepté. Présente-toi à l’accueil pour récupérer."
                : "Ton échange « {$reward} » a été refusé. Les points ont été remboursés.",
            NotificationCategory::Green,
            [
                'type' => 'eco_redemption_'.$event->decision,
                'redemption_id' => $redemption->id,
                'reward' => $reward,
            ]
        );
    }

    public function handleScheduleSlotCreated(ScheduleSlotCreated $event): void
    {
        $slot = $event->slot->loadMissing(['course', 'room', 'coach']);
        $course = $slot->course?->name ?? 'cours';
        $when = $slot->starts_at?->format('d/m/Y H:i') ?? '';
        $room = $slot->room?->name;

        $this->notifications->sendMany(
            $this->activeMemberUsers(),
            'Nouveau créneau',
            "Nouveau créneau « {$course} » le {$when}".($room ? " · {$room}" : '').'. Réserve ta place !',
            NotificationCategory::Schedule,
            ['type' => 'slot_created', 'schedule_slot_id' => $slot->id],
            false
        );
    }

    public function handleScheduleSlotUpdated(ScheduleSlotUpdated $event): void
    {
        $slot = $event->slot->loadMissing(['course', 'room', 'bookings.member.user']);
        $course = $slot->course?->name ?? 'cours';
        $when = $slot->starts_at?->format('d/m/Y H:i') ?? '';

        $users = $slot->bookings
            ->whereIn('status', [BookingStatus::Confirmed, BookingStatus::Waitlist])
            ->map(fn (Booking $b) => $b->member?->user)
            ->filter()
            ->unique('id')
            ->values();

        if ($users->isEmpty()) {
            return;
        }

        $this->notifications->sendMany(
            $users,
            'Changement de planning',
            "Le créneau « {$course} » a été modifié ({$when}). Vérifie ta réservation.",
            NotificationCategory::Schedule,
            ['type' => 'slot_updated', 'schedule_slot_id' => $slot->id],
            true
        );
    }

    public function handleScheduleSlotCancelled(ScheduleSlotCancelled $event): void
    {
        $slot = $event->slot->loadMissing(['course', 'bookings.member.user']);
        $course = $slot->course?->name ?? 'cours';
        $when = $slot->starts_at?->format('d/m/Y H:i') ?? '';

        $users = $slot->bookings
            ->whereIn('status', [BookingStatus::Confirmed, BookingStatus::Waitlist])
            ->map(fn (Booking $b) => $b->member?->user)
            ->filter()
            ->unique('id')
            ->values();

        if ($users->isEmpty()) {
            return;
        }

        $this->notifications->sendMany(
            $users,
            'Créneau annulé',
            "Le créneau « {$course} » du {$when} a été annulé.",
            NotificationCategory::Schedule,
            ['type' => 'slot_cancelled', 'schedule_slot_id' => $slot->id],
            true
        );
    }

    /**
     * @return \Illuminate\Support\Collection<int, User>
     */
    private function activeMemberUsers(): \Illuminate\Support\Collection
    {
        return User::query()
            ->where('is_active', true)
            ->whereHas('member', fn ($q) => $q->where('is_active', true))
            ->get();
    }

    /**
     * @return \Illuminate\Support\Collection<int, User>
     */
    public function staffUsers(): \Illuminate\Support\Collection
    {
        $roleIds = Role::query()->whereIn('slug', ['admin', 'reception'])->pluck('id');

        return User::query()
            ->where('is_active', true)
            ->whereHas('roles', fn ($q) => $q->whereIn('roles.id', $roleIds))
            ->get();
    }
}
