<?php

namespace App\Modules\Offers\Policies;

use App\Modules\Offers\Models\Offer;
use App\Modules\Users\Models\User;

class OfferPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'reception', 'coach', 'member']);
    }

    public function view(User $user, Offer $offer): bool
    {
        return $this->viewAny($user);
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('offers.manage') || $user->hasRole('admin');
    }

    public function update(User $user, Offer $offer): bool
    {
        return $this->create($user);
    }
}
