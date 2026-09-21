<?php

use App\Modules\Schedule\Http\Controllers\ScheduleController;
use Illuminate\Support\Facades\Route;

Route::prefix('public')->group(function () {
    Route::get('courses', [ScheduleController::class, 'publicCourses']);
    Route::get('schedule-slots', [ScheduleController::class, 'publicSlots']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::get('courses', [ScheduleController::class, 'courses']);
    Route::get('rooms', [ScheduleController::class, 'rooms']);
    Route::get('schedule-slots', [ScheduleController::class, 'slots']);
    Route::get('schedule-slots/{scheduleSlot}', [ScheduleController::class, 'showSlot']);

    Route::middleware('role:admin,reception,coach')->group(function () {
        Route::post('courses', [ScheduleController::class, 'storeCourse']);
        Route::post('rooms', [ScheduleController::class, 'storeRoom']);
        Route::post('schedule-slots', [ScheduleController::class, 'storeSlot']);
        Route::put('schedule-slots/{scheduleSlot}', [ScheduleController::class, 'updateSlot']);
        Route::patch('schedule-slots/{scheduleSlot}', [ScheduleController::class, 'updateSlot']);
        Route::post('schedule-slots/{scheduleSlot}/cancel', [ScheduleController::class, 'cancelSlot']);
    });
});
