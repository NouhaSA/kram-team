<?php

namespace App\Modules\Payments\Enums;

enum PaymentType: string
{
    case Subscription = 'subscription';
    case Renewal = 'renewal';
    case Booking = 'booking';
    case Product = 'product';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Subscription => 'Abonnement',
            self::Renewal => 'Renouvellement',
            self::Booking => 'Réservation',
            self::Product => 'Produit',
            self::Other => 'Autre',
        };
    }
}
