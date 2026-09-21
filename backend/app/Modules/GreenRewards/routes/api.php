<?php

use App\Modules\GreenRewards\Http\Controllers\GreenRewardsController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('green/rules', [GreenRewardsController::class, 'rules']);
    Route::get('green/challenges', [GreenRewardsController::class, 'challenges']);
    Route::get('green/rewards', [GreenRewardsController::class, 'rewards']);
    Route::get('green/leaderboard', [GreenRewardsController::class, 'leaderboard']);

    Route::get('member/green-profile', [GreenRewardsController::class, 'profile']);
    Route::get('member/eco-history', [GreenRewardsController::class, 'history']);
    Route::post('member/eco-action', [GreenRewardsController::class, 'submitAction']);
    Route::post('challenge/{ecoChallenge}/join', [GreenRewardsController::class, 'joinChallenge']);
    Route::post('reward/{ecoReward}/redeem', [GreenRewardsController::class, 'redeem']);
    Route::get('member/eco-redemptions', [GreenRewardsController::class, 'myRedemptions']);

    Route::get('members/{member}/green-profile', [GreenRewardsController::class, 'profile']);
    Route::get('members/{member}/eco-history', [GreenRewardsController::class, 'history']);

    Route::middleware('role:admin,reception,coach')->group(function () {
        Route::get('admin/eco-actions/pending', [GreenRewardsController::class, 'pendingActions']);
        Route::post('admin/eco-actions/{memberEcoAction}/validate', [GreenRewardsController::class, 'validateAction']);
        Route::get('admin/eco-redemptions/pending', [GreenRewardsController::class, 'pendingRedemptions']);
        Route::post('admin/eco-redemptions/{rewardRedemption}/process', [GreenRewardsController::class, 'processRedemption']);
    });
});
