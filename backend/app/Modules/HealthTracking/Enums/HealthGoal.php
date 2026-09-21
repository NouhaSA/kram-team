<?php

namespace App\Modules\HealthTracking\Enums;

enum HealthGoal: string
{
    case LoseWeight = 'lose_weight';
    case GainWeight = 'gain_weight';
    case Maintain = 'maintain';
    case Recomposition = 'recomposition';

    public function label(): string
    {
        return match ($this) {
            self::LoseWeight => 'Perte de poids',
            self::GainWeight => 'Prise de masse',
            self::Maintain => 'Maintien',
            self::Recomposition => 'Recomposition',
        };
    }
}
