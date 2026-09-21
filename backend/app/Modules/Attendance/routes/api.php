<?php

use App\Modules\Attendance\Http\Controllers\AttendanceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin,reception,coach'])->group(function () {
    Route::get('attendances', [AttendanceController::class, 'index']);
    Route::post('qr/verify', [AttendanceController::class, 'verify']);
    Route::post('qr/check-in', [AttendanceController::class, 'checkIn']);
    Route::post('qr/check-out', [AttendanceController::class, 'checkOut']);
});
