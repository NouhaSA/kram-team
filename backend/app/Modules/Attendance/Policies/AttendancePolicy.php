<?php

namespace App\Modules\Attendance\Policies;

use App\Modules\Attendance\Models\Attendance;
use App\Modules\Users\Models\User;

class AttendancePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'reception', 'coach'])
            || $user->hasPermission('attendance.checkin');
    }

    public function view(User $user, Attendance $attendance): bool
    {
        return $this->viewAny($user)
            || $user->member?->id === $attendance->member_id;
    }

    public function checkIn(User $user): bool
    {
        return $user->hasAnyRole(['admin', 'reception', 'coach'])
            || $user->hasPermission('attendance.checkin');
    }
}
