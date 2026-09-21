<?php

use App\Modules\Users\Http\Controllers\ActivityLogController;
use App\Modules\Users\Http\Controllers\StaffController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum'])->group(function () {
    Route::middleware('role:admin')->group(function () {
        Route::get('admin/staff', [StaffController::class, 'index']);
        Route::post('admin/staff', [StaffController::class, 'store']);
        Route::put('admin/staff/{user}', [StaffController::class, 'update']);
        Route::patch('admin/staff/{user}', [StaffController::class, 'update']);

        Route::get('admin/activity', [ActivityLogController::class, 'index']);
        Route::get('admin/accounts', [ActivityLogController::class, 'accounts']);
        Route::post('admin/accounts/{user}/toggle', [ActivityLogController::class, 'toggleAccount']);
    });

    Route::middleware('role:admin,reception,coach')->group(function () {
        Route::get('staff/coaches', [StaffController::class, 'coaches']);
    });
});
