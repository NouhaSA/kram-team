<?php

use App\Modules\Booking\Http\Controllers\BookingController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin,reception,coach,member'])->group(function () {
    Route::get('bookings', [BookingController::class, 'index']);
    Route::post('bookings', [BookingController::class, 'store']);
    Route::get('bookings/{booking}', [BookingController::class, 'show']);
    Route::post('bookings/{booking}/cancel', [BookingController::class, 'cancel']);
});

Route::middleware(['auth:sanctum', 'role:admin,reception'])->group(function () {
    Route::post('bookings/{booking}/accept', [BookingController::class, 'accept']);
});
