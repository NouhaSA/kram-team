<?php

namespace App\Modules\Notifications\Events;

use App\Modules\Subscriptions\Models\Subscription;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SubscriptionCreated
{
    use Dispatchable, SerializesModels;

    public function __construct(public Subscription $subscription) {}
}
