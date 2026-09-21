<?php

namespace App\Modules\Quotas\Enums;

enum QuotaTransactionType: string
{
    case Consumption = 'consumption';
    case Credit = 'credit';
    case Refund = 'refund';
    case Adjustment = 'adjustment';
    case CheckIn = 'check_in';
    case CheckOut = 'check_out';

    public function label(): string
    {
        return match ($this) {
            self::Consumption => 'Consommation',
            self::Credit => 'Crédit',
            self::Refund => 'Remboursement',
            self::Adjustment => 'Ajustement',
            self::CheckIn => 'Check-in',
            self::CheckOut => 'Check-out',
        };
    }
}
