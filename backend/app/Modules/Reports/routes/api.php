<?php

use App\Modules\Reports\Http\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('role:admin,reception,coach')->group(function () {
        Route::get('reports/coaches', [ReportController::class, 'coaches']);
    });
});
