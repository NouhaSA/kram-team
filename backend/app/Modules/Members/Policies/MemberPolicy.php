<?php

namespace App\Modules\Members\Policies;

use App\Modules\Members\Models\Member;
use App\Modules\Users\Models\User;

class MemberPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'reception', 'coach']);
    }

    public function view(User $user, Member $member): bool
    {
        return $user->hasAnyRole(['admin', 'reception', 'coach'])
            || $user->member?->id === $member->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'reception']);
    }

    public function update(User $user, Member $member): bool
    {
        return $user->hasAnyRole(['admin', 'reception', 'coach']);
    }
}
