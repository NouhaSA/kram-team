<?php

namespace App\Modules\GreenRewards\Http\Controllers;

use App\Modules\Core\Http\Controllers\ApiController;
use App\Modules\GreenRewards\Models\EcoChallenge;
use App\Modules\GreenRewards\Models\EcoReward;
use App\Modules\GreenRewards\Models\EcoRule;
use App\Modules\GreenRewards\Models\MemberEcoAction;
use App\Modules\GreenRewards\Services\EcoPointEngine;
use App\Modules\Members\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GreenRewardsController extends ApiController
{
    public function __construct(
        private readonly EcoPointEngine $engine
    ) {}

    public function profile(Request $request, ?Member $member = null): JsonResponse
    {
        $target = $member ?? $request->user()->member;

        if (! $target) {
            return $this->error('Profil adhérent introuvable.', 404);
        }

        return $this->success($this->engine->profile($target));
    }

    public function history(Request $request, ?Member $member = null): JsonResponse
    {
        $target = $member ?? $request->user()->member;

        if (! $target) {
            return $this->error('Profil adhérent introuvable.', 404);
        }

        $actions = MemberEcoAction::query()
            ->with('rule')
            ->where('member_id', $target->id)
            ->latest('submitted_at')
            ->paginate($request->integer('per_page', 20));

        return $this->success($actions);
    }

    public function rules(): JsonResponse
    {
        $rules = EcoRule::query()->where('is_active', true)->orderBy('category')->orderBy('name')->get();

        return $this->success($rules);
    }

    public function submitAction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => ['nullable', 'integer', 'exists:members,id'],
            'eco_rule_id' => ['required', 'integer', 'exists:eco_rules,id'],
            'notes' => ['nullable', 'string', 'max:500'],
            'proof_path' => ['nullable', 'string', 'max:500'],
        ]);

        $member = isset($validated['member_id'])
            ? Member::query()->findOrFail($validated['member_id'])
            : $request->user()->member;

        if (! $member) {
            return $this->error('Adhérent requis.', 422);
        }

        $rule = EcoRule::query()->findOrFail($validated['eco_rule_id']);
        $action = $this->engine->submitAction(
            $member,
            $rule,
            $validated['notes'] ?? null,
            $validated['proof_path'] ?? null
        );

        return $this->success($action, 'Action soumise.', 201);
    }

    public function validateAction(Request $request, MemberEcoAction $memberEcoAction): JsonResponse
    {
        $validated = $request->validate([
            'decision' => ['required', 'in:approved,rejected'],
            'reason' => ['required_if:decision,rejected', 'nullable', 'string', 'max:500'],
        ]);

        $action = $validated['decision'] === 'approved'
            ? $this->engine->approveAction($memberEcoAction, $request->user())
            : $this->engine->rejectAction($memberEcoAction, $request->user(), $validated['reason'] ?? 'Rejeté');

        return $this->success($action, 'Action traitée.');
    }

    public function pendingActions(Request $request): JsonResponse
    {
        $actions = MemberEcoAction::query()
            ->with(['rule', 'member.user'])
            ->where('status', 'pending')
            ->latest('submitted_at')
            ->paginate($request->integer('per_page', 20));

        return $this->success($actions);
    }

    public function leaderboard(Request $request): JsonResponse
    {
        return $this->success(
            $this->engine->leaderboard(
                $request->string('period', 'global')->toString(),
                $request->integer('limit', 20)
            )
        );
    }

    public function challenges(Request $request): JsonResponse
    {
        $member = $request->user()->member;
        $memberId = $member?->id;

        $challenges = EcoChallenge::query()
            ->with('badge')
            ->where('is_active', true)
            ->where('ends_at', '>', now())
            ->orderBy('starts_at')
            ->get()
            ->map(function (EcoChallenge $challenge) use ($memberId) {
                $pivot = $memberId
                    ? $challenge->members()->where('members.id', $memberId)->first()?->pivot
                    : null;

                return [
                    ...$challenge->toArray(),
                    'joined' => (bool) $pivot,
                    'progress' => $pivot?->progress ?? 0,
                    'completed' => (bool) ($pivot?->completed ?? false),
                ];
            });

        return $this->success($challenges);
    }

    public function joinChallenge(Request $request, EcoChallenge $ecoChallenge): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => ['nullable', 'integer', 'exists:members,id'],
        ]);

        $member = isset($validated['member_id'])
            ? Member::query()->findOrFail($validated['member_id'])
            : $request->user()->member;

        if (! $member) {
            return $this->error('Profil adhérent requis pour rejoindre un challenge. Connecte-toi avec un compte adhérent.', 422);
        }

        $this->engine->joinChallenge($member, $ecoChallenge);

        return $this->success([
            'challenge_id' => $ecoChallenge->id,
            'member_id' => $member->id,
            'joined' => true,
        ], 'Inscription au challenge réussie.', 201);
    }

    public function rewards(): JsonResponse
    {
        return $this->success(
            EcoReward::query()->where('is_active', true)->orderBy('cost_points')->get()
        );
    }

    public function myRedemptions(Request $request): JsonResponse
    {
        $member = $request->user()->member;
        if (! $member) {
            return $this->error('Profil adhérent introuvable.', 404);
        }

        $items = \App\Modules\GreenRewards\Models\RewardRedemption::query()
            ->with('reward')
            ->where('member_id', $member->id)
            ->latest('redeemed_at')
            ->limit(30)
            ->get();

        return $this->success($items);
    }

    public function redeem(Request $request, EcoReward $ecoReward): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => ['nullable', 'integer', 'exists:members,id'],
        ]);

        $member = isset($validated['member_id'])
            ? Member::query()->findOrFail($validated['member_id'])
            : $request->user()->member;

        if (! $member) {
            return $this->error('Adhérent requis.', 422);
        }

        $redemption = $this->engine->redeem($member, $ecoReward, $request->user());

        return $this->success($redemption, 'Demande d’échange envoyée — en attente de validation admin.', 201);
    }

    public function pendingRedemptions(Request $request): JsonResponse
    {
        $items = \App\Modules\GreenRewards\Models\RewardRedemption::query()
            ->with(['reward', 'member.user'])
            ->where('status', 'pending')
            ->latest('redeemed_at')
            ->paginate($request->integer('per_page', 20));

        return $this->success($items);
    }

    public function processRedemption(Request $request, \App\Modules\GreenRewards\Models\RewardRedemption $rewardRedemption): JsonResponse
    {
        $validated = $request->validate([
            'decision' => ['required', 'in:approved,rejected'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $item = $validated['decision'] === 'approved'
            ? $this->engine->approveRedemption($rewardRedemption, $request->user())
            : $this->engine->rejectRedemption($rewardRedemption, $request->user(), $validated['reason'] ?? null);

        return $this->success($item, $validated['decision'] === 'approved' ? 'Échange accepté.' : 'Échange refusé.');
    }
}
