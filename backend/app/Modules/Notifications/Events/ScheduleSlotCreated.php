<?php

namespace App\Modules\Notifications\Events;

use App\Modules\Schedule\Models\ScheduleSlot;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ScheduleSlotCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public ScheduleSlot $slot) {}
}
