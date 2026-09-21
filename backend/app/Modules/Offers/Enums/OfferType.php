<?php

namespace App\Modules\Offers\Enums;

enum OfferType: string
{
    case Unlimited = 'unlimited';
    case Sessions = 'sessions';
    case Hourly = 'hourly';
    case Mixed = 'mixed';

    public function label(): string
    {
        return match ($this) {
            self::Unlimited => 'Illimitée',
            self::Sessions => 'Par séances',
            self::Hourly => 'Horaire',
            self::Mixed => 'Mixte',
        };
    }
}
