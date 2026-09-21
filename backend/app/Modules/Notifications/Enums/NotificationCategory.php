<?php

namespace App\Modules\Notifications\Enums;

enum NotificationCategory: string
{
    case Booking = 'booking';
    case Subscription = 'subscription';
    case Payment = 'payment';
    case Attendance = 'attendance';
    case Green = 'green';
    case Schedule = 'schedule';
    case Birthday = 'birthday';
    case System = 'system';

    public function label(): string
    {
        return match ($this) {
            self::Booking => 'Réservation',
            self::Subscription => 'Abonnement',
            self::Payment => 'Paiement',
            self::Attendance => 'Présence',
            self::Green => 'Green Rewards',
            self::Schedule => 'Planning',
            self::Birthday => 'Anniversaire',
            self::System => 'Système',
        };
    }
}
