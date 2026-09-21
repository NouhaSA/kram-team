<?php

namespace App\Modules\Subscriptions\Enums;

enum SubscriptionStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';
    case Expired = 'expired';
    case Pending = 'pending';
    case Cancelled = 'cancelled';
    case Renewed = 'renewed';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Actif',
            self::Suspended => 'Suspendu',
            self::Expired => 'Expiré',
            self::Pending => 'En attente',
            self::Cancelled => 'Résilié',
            self::Renewed => 'Renouvelé',
        };
    }

    public function isUsable(): bool
    {
        return $this === self::Active;
    }
}
