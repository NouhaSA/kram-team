<?php

use App\Modules\Quotas\Http\Controllers\QuotaController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('members/{member}/quotas', [QuotaController::class, 'memberQuotas']);
    Route::get('subscriptions/{subscription}/quotas', [QuotaController::class, 'subscriptionQuotas']);
    Route::get('subscription-quotas/{subscriptionQuota}/history', [QuotaController::class, 'history']);

    Route::middleware('role:admin,reception,coach')->group(function () {
        Route::post('subscription-quotas/{subscriptionQuota}/consume', [QuotaController::class, 'consume']);
    });
});
