<?php

namespace App\Modules\Notifications\Events;

use App\Modules\GreenRewards\Models\RewardRedemption;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RewardRedemptionRequested
{
    use Dispatchable, SerializesModels;

    public function __construct(public RewardRedemption $redemption) {}
}
