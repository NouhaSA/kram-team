<?php

namespace App\Modules\Booking\Enums;

enum BookingStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Waitlist = 'waitlist';
    case Cancelled = 'cancelled';
    case Attended = 'attended';
    case NoShow = 'no_show';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Confirmed => 'Confirmée',
            self::Waitlist => 'Liste d\'attente',
            self::Cancelled => 'Annulée',
            self::Attended => 'Présent',
            self::NoShow => 'Absent',
        };
    }
}
