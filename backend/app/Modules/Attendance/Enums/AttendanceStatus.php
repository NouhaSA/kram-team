<?php

namespace App\Modules\Attendance\Enums;

enum AttendanceStatus: string
{
    case Success = 'success';
    case Denied = 'denied';
    case Duplicate = 'duplicate';

    public function label(): string
    {
        return match ($this) {
            self::Success => 'Autorisé',
            self::Denied => 'Refusé',
            self::Duplicate => 'Doublon',
        };
    }
}
