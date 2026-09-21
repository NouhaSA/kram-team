<?php

use App\Modules\Subscriptions\Http\Controllers\SubscriptionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('members/{member}/active-subscriptions', [SubscriptionController::class, 'activeForMember']);

    Route::middleware('role:admin,reception')->group(function () {
        Route::apiResource('subscriptions', SubscriptionController::class)->only(['index', 'store', 'show']);
        Route::post('subscriptions/{subscription}/suspend', [SubscriptionController::class, 'suspend']);
        Route::post('subscriptions/{subscription}/activate', [SubscriptionController::class, 'activate']);
        Route::post('subscriptions/{subscription}/cancel', [SubscriptionController::class, 'cancel']);
        Route::post('subscriptions/{subscription}/renew', [SubscriptionController::class, 'renew']);
    });
});
