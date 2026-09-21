<?php

namespace App\Modules\Dashboard\Http\Controllers;

use App\Modules\Core\Http\Controllers\ApiController;
use App\Modules\Dashboard\Services\DashboardService;
use App\Modules\Members\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends ApiController
{
    public function __construct(
        private readonly DashboardService $dashboardService
    ) {}

    public function admin(): JsonResponse
    {
        return $this->success($this->dashboardService->adminOverview());
    }

    public function reception(): JsonResponse
    {
        return $this->success($this->dashboardService->receptionOverview());
    }

    public function coach(Request $request): JsonResponse
    {
        return $this->success(
            $this->dashboardService->coachOverview($request->user())
        );
    }

    public function member(Request $request): JsonResponse
    {
        $member = $request->user()->member;

        if (! $member) {
            return $this->error('Profil adhérent introuvable.', 404);
        }

        return $this->success(
            $this->dashboardService->memberOverview($member->load(['user', 'coach']))
        );
    }

    public function memberById(Member $member): JsonResponse
    {
        return $this->success(
            $this->dashboardService->memberOverview($member->load(['user', 'coach']))
        );
    }
}
