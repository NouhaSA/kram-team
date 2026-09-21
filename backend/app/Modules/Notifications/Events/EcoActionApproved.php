<?php

namespace App\Modules\Notifications\Events;

use App\Modules\GreenRewards\Models\MemberEcoAction;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EcoActionApproved
{
    use Dispatchable, SerializesModels;

    public function __construct(public MemberEcoAction $action) {}
}
