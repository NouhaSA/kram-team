<?php

namespace App\Providers;

use App\Modules\Notifications\Events\BookingCreated;
use App\Modules\Notifications\Events\EcoActionApproved;
use App\Modules\Notifications\Events\EcoActionSubmitted;
use App\Modules\Notifications\Events\PaymentRecorded;
use App\Modules\Notifications\Events\RewardRedemptionProcessed;
use App\Modules\Notifications\Events\RewardRedemptionRequested;
use App\Modules\Notifications\Events\ScheduleSlotCancelled;
use App\Modules\Notifications\Events\ScheduleSlotCreated;
use App\Modules\Notifications\Events\ScheduleSlotUpdated;
use App\Modules\Notifications\Events\SubscriptionCreated;
use App\Modules\Notifications\Listeners\SendDomainNotifications;
use App\Modules\Notifications\Console\SendScheduledNotificationsCommand;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Event::listen(BookingCreated::class, [SendDomainNotifications::class, 'handleBookingCreated']);
        Event::listen(SubscriptionCreated::class, [SendDomainNotifications::class, 'handleSubscriptionCreated']);
        Event::listen(PaymentRecorded::class, [SendDomainNotifications::class, 'handlePaymentRecorded']);
        Event::listen(EcoActionSubmitted::class, [SendDomainNotifications::class, 'handleEcoActionSubmitted']);
        Event::listen(EcoActionApproved::class, [SendDomainNotifications::class, 'handleEcoActionApproved']);
        Event::listen(RewardRedemptionRequested::class, [SendDomainNotifications::class, 'handleRewardRedemptionRequested']);
        Event::listen(RewardRedemptionProcessed::class, [SendDomainNotifications::class, 'handleRewardRedemptionProcessed']);
        Event::listen(ScheduleSlotCreated::class, [SendDomainNotifications::class, 'handleScheduleSlotCreated']);
        Event::listen(ScheduleSlotUpdated::class, [SendDomainNotifications::class, 'handleScheduleSlotUpdated']);
        Event::listen(ScheduleSlotCancelled::class, [SendDomainNotifications::class, 'handleScheduleSlotCancelled']);

        if ($this->app->runningInConsole()) {
            $this->commands([SendScheduledNotificationsCommand::class]);
        }
    }
}
