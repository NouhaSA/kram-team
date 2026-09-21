<?php

namespace App\Modules\Payments\Enums;

enum PaymentMethod: string
{
    case Cash = 'cash';
    case Card = 'card';
    case Transfer = 'transfer';
    case Check = 'check';
    case Online = 'online';

    public function label(): string
    {
        return match ($this) {
            self::Cash => 'Espèces',
            self::Card => 'Carte bancaire',
            self::Transfer => 'Virement',
            self::Check => 'Chèque',
            self::Online => 'En ligne',
        };
    }
}
