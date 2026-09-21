<?php

namespace App\Modules\Reports\Http\Controllers;

use App\Modules\Core\Enums\UserRole;
use App\Modules\Core\Http\Controllers\ApiController;
use App\Modules\Reports\Services\CoachReportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReportController extends ApiController
{
    public function __construct(
        private readonly CoachReportService $coachReportService
    ) {}

    public function coaches(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'period' => ['nullable', Rule::in(['day', 'week', 'month'])],
            'date' => ['nullable', 'date'],
            'coach_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $user = $request->user();
        $coachId = $validated['coach_id'] ?? null;

        if (! $user->hasRole(UserRole::Admin) && ! $user->hasRole(UserRole::Reception)) {
            $coachId = $user->id;
        }

        return $this->success(
            $this->coachReportService->report(
                $coachId,
                $validated['period'] ?? 'month',
                $validated['date'] ?? null
            )
        );
    }
}
