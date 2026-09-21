<?php

use App\Modules\Members\Http\Controllers\MemberController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:sanctum', 'role:admin,reception,coach'])->group(function () {
    Route::apiResource('members', MemberController::class);
});
