<?php

namespace App\Modules\HealthTracking\Services;

use App\Modules\Core\Enums\UserRole;
use App\Modules\HealthTracking\Models\MemberHealthEntry;
use App\Modules\HealthTracking\Models\MemberHealthProfile;
use App\Modules\Members\Models\Member;
use App\Modules\Users\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class HealthTrackingService
{
    public function __construct(
        private readonly HealthCalculator $calculator
    ) {}

    public function canAccess(User $user, Member $member): bool
    {
        if ($user->hasRole(UserRole::Admin) || $user->hasRole(UserRole::Reception) || $user->hasRole(UserRole::Coach)) {
            return true;
        }

        return (int) $member->user_id === (int) $user->id;
    }

    /**
     * @return array<string, mixed>
     */
    public function overview(Member $member): array
    {
        $profile = MemberHealthProfile::query()->where('member_id', $member->id)->first();
        $entries = MemberHealthEntry::query()
            ->with('recordedBy')
            ->where('member_id', $member->id)
            ->orderByDesc('recorded_at')
            ->limit(50)
            ->get();

        return [
            'member' => [
                'id' => $member->id,
                'full_name' => $member->user?->full_name,
                'gender' => $member->gender?->value,
                'date_of_birth' => $member->date_of_birth?->toDateString(),
                'coach_id' => $member->coach_id,
            ],
            ...$this->calculator->summarize($member, $profile, $entries),
        ];
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function upsertProfile(Member $member, array $data): array
    {
        $profile = MemberHealthProfile::query()->updateOrCreate(
            ['member_id' => $member->id],
            $data
        );

        if (empty($profile->start_weight_kg)) {
            $first = MemberHealthEntry::query()
                ->where('member_id', $member->id)
                ->orderBy('recorded_at')
                ->first();
            if ($first) {
                $profile->update(['start_weight_kg' => $first->weight_kg]);
            }
        }

        return $this->overview($member->fresh(['user']));
    }

    /**
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public function addEntry(Member $member, array $data, User $actor): array
    {
        return DB::transaction(function () use ($member, $data, $actor) {
            $profile = MemberHealthProfile::query()->firstOrCreate(
                ['member_id' => $member->id],
                [
                    'height_cm' => $data['height_cm'] ?? 170,
                    'goal' => 'maintain',
                    'start_weight_kg' => $data['weight_kg'],
                    'activity_level' => 3,
                ]
            );

            if (! empty($data['height_cm']) && ! $profile->height_cm) {
                $profile->update(['height_cm' => $data['height_cm']]);
            }

            if (! $profile->start_weight_kg) {
                $profile->update(['start_weight_kg' => $data['weight_kg']]);
            }

            MemberHealthEntry::query()->create([
                ...$data,
                'member_id' => $member->id,
                'recorded_by' => $actor->id,
                'recorded_at' => $data['recorded_at'] ?? now(),
                'height_cm' => $data['height_cm'] ?? $profile->height_cm,
            ]);

            return $this->overview($member->fresh(['user']));
        });
    }

    public function assertCanAccess(User $user, Member $member): void
    {
        if (! $this->canAccess($user, $member)) {
            throw ValidationException::withMessages([
                'member_id' => ['Accès au suivi santé refusé pour cet adhérent.'],
            ]);
        }
    }
}
