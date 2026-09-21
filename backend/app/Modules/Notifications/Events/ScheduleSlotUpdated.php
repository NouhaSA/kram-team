<?php

namespace App\Modules\Notifications\Events;

use App\Modules\Schedule\Models\ScheduleSlot;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ScheduleSlotUpdated
{
    use Dispatchable, SerializesModels;

    public function __construct(public ScheduleSlot $slot) {}
}
