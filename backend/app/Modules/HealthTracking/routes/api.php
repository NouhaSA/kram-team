<?php

use App\Modules\HealthTracking\Http\Controllers\HealthTrackingController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('health/me', [HealthTrackingController::class, 'me']);

    Route::middleware('role:admin,reception,coach,member')->group(function () {
        Route::get('health/members/{member}', [HealthTrackingController::class, 'show']);
        Route::put('health/members/{member}/profile', [HealthTrackingController::class, 'updateProfile']);
        Route::post('health/members/{member}/entries', [HealthTrackingController::class, 'storeEntry']);
    });
});
