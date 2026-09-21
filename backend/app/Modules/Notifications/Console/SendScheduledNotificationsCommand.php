<?php

namespace App\Modules\Notifications\Console;

use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Booking\Models\Booking;
use App\Modules\Members\Models\Member;
use App\Modules\Notifications\Enums\NotificationCategory;
use App\Modules\Notifications\Services\NotificationService;
use App\Modules\Subscriptions\Enums\SubscriptionStatus;
use App\Modules\Subscriptions\Models\Subscription;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class SendScheduledNotificationsCommand extends Command
{
    protected $signature = 'kram:notifications-scheduled';

    protected $description = 'Anniversaires, rappels renouvellement (7/4/2/1 j) et rappels réservation';

    public function __construct(
        private readonly NotificationService $notifications
    ) {
        parent::__construct();
    }

    public function handle(): int
    {
        $birthdays = $this->sendBirthdays();
        $renewals = $this->sendRenewalReminders();
        $bookings = $this->sendBookingReminders();

        $this->info("Birthdays={$birthdays} renewals={$renewals} booking_reminders={$bookings}");

        return self::SUCCESS;
    }

    private function sendBirthdays(): int
    {
        $today = now();
        $sent = 0;

        $members = Member::query()
            ->with('user')
            ->where('is_active', true)
            ->whereNotNull('date_of_birth')
            ->whereMonth('date_of_birth', $today->month)
            ->whereDay('date_of_birth', $today->day)
            ->get();

        foreach ($members as $member) {
            $user = $member->user;
            if (! $user) {
                continue;
            }

            $key = "notif:birthday:{$user->id}:{$today->year}";
            if (! Cache::add($key, true, $today->copy()->endOfDay())) {
                continue;
            }

            $this->notifications->send(
                $user,
                'Joyeux anniversaire 🎉',
                "Toute l'équipe Kram Team te souhaite un excellent anniversaire, {$user->first_name} ! Force & Honor.",
                NotificationCategory::Birthday,
                ['member_id' => $member->id, 'type' => 'birthday'],
                true
            );
            $sent++;
        }

        return $sent;
    }

    private function sendRenewalReminders(): int
    {
        $sent = 0;
        $windows = [7, 4, 2, 1];

        foreach ($windows as $days) {
            $target = now()->addDays($days)->toDateString();

            $subscriptions = Subscription::query()
                ->with(['member.user', 'offer'])
                ->where('status', SubscriptionStatus::Active)
                ->whereDate('ends_at', $target)
                ->get();

            foreach ($subscriptions as $subscription) {
                $user = $subscription->member?->user;
                if (! $user) {
                    continue;
                }

                $key = "notif:renewal:{$subscription->id}:{$days}";
                if (! Cache::add($key, true, now()->addDays(2))) {
                    continue;
                }

                $offer = $subscription->offer?->name ?? 'abonnement';
                $ends = $subscription->ends_at?->format('d/m/Y') ?? $target;
                $amount = $subscription->price_paid;

                $this->notifications->send(
                    $user,
                    match ($days) {
                        7 => 'Renouvellement dans 1 semaine',
                        4 => 'Renouvellement dans 4 jours',
                        2 => 'Renouvellement dans 2 jours',
                        default => 'Renouvellement demain',
                    },
                    "Ton abonnement « {$offer} » expire le {$ends}".
                    ($amount ? " (montant de référence {$amount} TND)" : '').
                    '. Pense à renouveler ou régler ton paiement.',
                    NotificationCategory::Subscription,
                    [
                        'type' => 'renewal_reminder',
                        'days_before' => $days,
                        'subscription_id' => $subscription->id,
                    ],
                    true
                );
                $sent++;
            }
        }

        return $sent;
    }

    private function sendBookingReminders(): int
    {
        $sent = 0;
        // J-1 et jour J (matin)
        foreach ([1, 0] as $days) {
            $target = now()->addDays($days)->toDateString();

            $bookings = Booking::query()
                ->with(['member.user', 'scheduleSlot.course', 'scheduleSlot.room'])
                ->whereIn('status', [BookingStatus::Confirmed, BookingStatus::Waitlist])
                ->whereHas('scheduleSlot', fn ($q) => $q->whereDate('starts_at', $target))
                ->get();

            foreach ($bookings as $booking) {
                $user = $booking->member?->user;
                $slot = $booking->scheduleSlot;
                if (! $user || ! $slot) {
                    continue;
                }

                $key = "notif:booking-reminder:{$booking->id}:{$days}";
                if (! Cache::add($key, true, now()->addDay())) {
                    continue;
                }

                $course = $slot->course?->name ?? 'cours';
                $when = $slot->starts_at->format('d/m/Y H:i');
                $room = $slot->room?->name;

                $this->notifications->send(
                    $user,
                    $days === 0 ? 'Rappel : séance aujourd’hui' : 'Rappel : séance demain',
                    "N’oublie pas ta réservation « {$course} » le {$when}".
                    ($room ? " · {$room}" : '').
                    ($booking->status === BookingStatus::Waitlist ? ' (liste d’attente).' : '.'),
                    NotificationCategory::Booking,
                    [
                        'type' => 'booking_reminder',
                        'booking_id' => $booking->id,
                        'days_before' => $days,
                    ],
                    true
                );
                $sent++;
            }
        }

        return $sent;
    }
}
