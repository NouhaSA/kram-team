<?php

use App\Modules\Payments\Http\Controllers\PaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin,reception'])->group(function () {
    Route::get('payments', [PaymentController::class, 'index']);
    Route::post('payments', [PaymentController::class, 'store']);
    Route::get('payments/{payment}', [PaymentController::class, 'show']);
    Route::post('payments/{payment}/complete', [PaymentController::class, 'complete']);
    Route::post('payments/{payment}/cancel', [PaymentController::class, 'cancel']);
    Route::post('payments/{payment}/refund', [PaymentController::class, 'refund']);
    Route::get('members/{member}/payments-summary', [PaymentController::class, 'memberSummary']);
});
