<?php

namespace App\Modules\Core\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Reception = 'reception';
    case Coach = 'coach';
    case Member = 'member';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrateur',
            self::Reception => 'Gestionnaire',
            self::Coach => 'Coach',
            self::Member => 'Adhérent',
        };
    }
}
