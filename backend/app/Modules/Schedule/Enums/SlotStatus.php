<?php

namespace App\Modules\Schedule\Enums;

enum SlotStatus: string
{
    case Open = 'open';
    case Full = 'full';
    case Cancelled = 'cancelled';
    case Completed = 'completed';

    public function label(): string
    {
        return match ($this) {
            self::Open => 'Ouvert',
            self::Full => 'Complet',
            self::Cancelled => 'Annulé',
            self::Completed => 'Terminé',
        };
    }
}
