<?php

namespace App\Modules\Attendance\Enums;

enum AttendanceType: string
{
    case CheckIn = 'check_in';
    case CheckOut = 'check_out';

    public function label(): string
    {
        return match ($this) {
            self::CheckIn => 'Entrée',
            self::CheckOut => 'Sortie',
        };
    }
}
