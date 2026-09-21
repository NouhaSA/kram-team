<?php

namespace App\Modules\GreenRewards\Enums;

enum ValidationType: string
{
    case Automatic = 'automatic';
    case Coach = 'coach';
    case Admin = 'admin';
    case QrEvent = 'qr_event';
    case Photo = 'photo';

    public function label(): string
    {
        return match ($this) {
            self::Automatic => 'Automatique',
            self::Coach => 'Coach',
            self::Admin => 'Admin',
            self::QrEvent => 'QR événement',
            self::Photo => 'Photo preuve',
        };
    }
}
