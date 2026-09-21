<?php

namespace App\Modules\Payments\Enums;

enum PaymentStatus: string
{
    case Pending = 'pending';
    case Completed = 'completed';
    case Failed = 'failed';
    case Refunded = 'refunded';
    case PartiallyRefunded = 'partially_refunded';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'En attente',
            self::Completed => 'Payé',
            self::Failed => 'Échoué',
            self::Refunded => 'Remboursé',
            self::PartiallyRefunded => 'Partiellement remboursé',
            self::Cancelled => 'Annulé',
        };
    }

    public function isSuccessful(): bool
    {
        return $this === self::Completed;
    }
}
