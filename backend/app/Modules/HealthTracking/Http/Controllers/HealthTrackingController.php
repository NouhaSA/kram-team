<?php

namespace App\Modules\HealthTracking\Http\Controllers;

use App\Modules\Core\Http\Controllers\ApiController;
use App\Modules\HealthTracking\Enums\HealthGoal;
use App\Modules\HealthTracking\Services\HealthTrackingService;
use App\Modules\Members\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HealthTrackingController extends ApiController
{
    public function __construct(
        private readonly HealthTrackingService $healthTrackingService
    ) {}

    public function me(Request $request): JsonResponse
    {
        $member = $request->user()->member;

        if (! $member) {
            return $this->error('Profil adhérent introuvable.', 404);
        }

        return $this->success(
            $this->healthTrackingService->overview($member->load('user'))
        );
    }

    public function show(Request $request, Member $member): JsonResponse
    {
        $this->healthTrackingService->assertCanAccess($request->user(), $member);

        return $this->success(
            $this->healthTrackingService->overview($member->load('user'))
        );
    }

    public function updateProfile(Request $request, Member $member): JsonResponse
    {
        $this->healthTrackingService->assertCanAccess($request->user(), $member);

        $validated = $request->validate([
            'height_cm' => ['required', 'numeric', 'min:100', 'max:250'],
            'goal' => ['required', Rule::enum(HealthGoal::class)],
            'start_weight_kg' => ['nullable', 'numeric', 'min:30', 'max:300'],
            'target_weight_kg' => ['nullable', 'numeric', 'min:30', 'max:300'],
            'target_date' => ['nullable', 'date', 'after:today'],
            'activity_level' => ['nullable', 'integer', 'min:1', 'max:5'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        return $this->success(
            $this->healthTrackingService->upsertProfile($member, $validated),
            'Profil santé mis à jour.'
        );
    }

    public function storeEntry(Request $request, Member $member): JsonResponse
    {
        $this->healthTrackingService->assertCanAccess($request->user(), $member);

        $validated = $request->validate([
            'weight_kg' => ['required', 'numeric', 'min:30', 'max:300'],
            'height_cm' => ['nullable', 'numeric', 'min:100', 'max:250'],
            'body_fat_percent' => ['nullable', 'numeric', 'min:1', 'max:70'],
            'muscle_mass_kg' => ['nullable', 'numeric', 'min:10', 'max:150'],
            'waist_cm' => ['nullable', 'numeric', 'min:40', 'max:200'],
            'resting_hr' => ['nullable', 'integer', 'min:30', 'max:220'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'recorded_at' => ['nullable', 'date'],
        ]);

        return $this->success(
            $this->healthTrackingService->addEntry($member, $validated, $request->user()),
            'Mesure enregistrée.',
            201
        );
    }
}
