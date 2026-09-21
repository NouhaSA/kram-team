<?php

use App\Modules\Offers\Http\Controllers\OfferController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('offers', OfferController::class)->except(['destroy']);
});
