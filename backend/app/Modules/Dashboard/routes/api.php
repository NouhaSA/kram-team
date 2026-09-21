<?php

use App\Modules\Dashboard\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('role:admin')->group(function () {
        Route::get('dashboard/admin', [DashboardController::class, 'admin']);
    });

    Route::middleware('role:admin,reception,coach')->group(function () {
        Route::get('dashboard/members/{member}', [DashboardController::class, 'memberById']);
    });

    Route::middleware('role:admin,reception')->group(function () {
        Route::get('dashboard/reception', [DashboardController::class, 'reception']);
    });

    Route::middleware('role:admin,coach')->group(function () {
        Route::get('dashboard/coach', [DashboardController::class, 'coach']);
    });

    Route::middleware('role:admin,member')->group(function () {
        Route::get('dashboard/member', [DashboardController::class, 'member']);
    });
});
