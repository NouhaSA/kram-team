<?php

namespace App\Modules\GreenRewards\Enums;

enum EcoCategory: string
{
    case Mobility = 'mobility';
    case Water = 'water';
    case Recycling = 'recycling';
    case Association = 'association';
    case KramLife = 'kram_life';

    public function label(): string
    {
        return match ($this) {
            self::Mobility => 'Mobilité',
            self::Water => 'Eau',
            self::Recycling => 'Recyclage',
            self::Association => 'Association',
            self::KramLife => 'Vie Kram Team',
        };
    }
}
