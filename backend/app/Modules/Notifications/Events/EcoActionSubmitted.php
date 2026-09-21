<?php

namespace App\Modules\Notifications\Events;

use App\Modules\GreenRewards\Models\MemberEcoAction;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class EcoActionSubmitted
{
    use Dispatchable, SerializesModels;

    public function __construct(public MemberEcoAction $action) {}
}
