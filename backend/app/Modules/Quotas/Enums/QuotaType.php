<?php

namespace App\Modules\Quotas\Enums;

enum QuotaType: string
{
    case Sessions = 'sessions';
    case Hours = 'hours';
    case Unlimited = 'unlimited';

    public function label(): string
    {
        return match ($this) {
            self::Sessions => 'Séances',
            self::Hours => 'Heures',
            self::Unlimited => 'Illimité',
        };
    }
}
