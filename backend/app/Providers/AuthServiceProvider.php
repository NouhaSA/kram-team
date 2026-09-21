<?php

namespace App\Providers;

use App\Modules\Attendance\Models\Attendance;
use App\Modules\Attendance\Policies\AttendancePolicy;
use App\Modules\Members\Models\Member;
use App\Modules\Members\Policies\MemberPolicy;
use App\Modules\Offers\Models\Offer;
use App\Modules\Offers\Policies\OfferPolicy;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Subscriptions\Policies\SubscriptionPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Gate::policy(Member::class, MemberPolicy::class);
        Gate::policy(Offer::class, OfferPolicy::class);
        Gate::policy(Subscription::class, SubscriptionPolicy::class);
        Gate::policy(Attendance::class, AttendancePolicy::class);
    }
}
