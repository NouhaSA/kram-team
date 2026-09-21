<?php

namespace App\Modules\Subscriptions\Policies;

use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Users\Models\User;

class SubscriptionPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'reception', 'coach'])
            || $user->hasPermission('subscriptions.manage');
    }

    public function view(User $user, Subscription $subscription): bool
    {
        return $this->viewAny($user)
            || $user->member?->id === $subscription->member_id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'reception'])
            || $user->hasPermission('subscriptions.manage');
    }

    public function update(User $user, Subscription $subscription): bool
    {
        return $user->hasAnyRole(['admin', 'reception'])
            || $user->hasPermission('subscriptions.manage');
    }
}
