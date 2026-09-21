<?php

namespace App\Modules\GreenRewards\Services;

use App\Modules\GreenRewards\Enums\EcoActionStatus;
use App\Modules\GreenRewards\Enums\ValidationType;
use App\Modules\GreenRewards\Models\EcoBadge;
use App\Modules\GreenRewards\Models\EcoChallenge;
use App\Modules\GreenRewards\Models\EcoImpact;
use App\Modules\GreenRewards\Models\EcoLevel;
use App\Modules\GreenRewards\Models\EcoPointsTransaction;
use App\Modules\GreenRewards\Models\EcoReward;
use App\Modules\GreenRewards\Models\EcoRule;
use App\Modules\GreenRewards\Models\MemberEcoAction;
use App\Modules\GreenRewards\Models\RewardRedemption;
use App\Modules\Members\Models\Member;
use App\Modules\Notifications\Events\EcoActionApproved;
use App\Modules\Notifications\Events\EcoActionSubmitted;
use App\Modules\Notifications\Events\RewardRedemptionProcessed;
use App\Modules\Notifications\Events\RewardRedemptionRequested;
use App\Modules\Users\Models\User;
use App\Modules\Users\Services\ActivityLogger;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class EcoPointEngine
{
    public function __construct(
        private readonly ActivityLogger $activity
    ) {}
    public function submitAction(Member $member, EcoRule $rule, ?string $notes = null, ?string $proofPath = null): MemberEcoAction
    {
        if (! $rule->is_active) {
            throw ValidationException::withMessages(['eco_rule_id' => ['Cette règle est inactive.']]);
        }

        $this->assertLimits($member, $rule);

        $action = MemberEcoAction::query()->create([
            'member_id' => $member->id,
            'eco_rule_id' => $rule->id,
            'status' => EcoActionStatus::Pending,
            'points' => $rule->points,
            'notes' => $notes,
            'proof_path' => $proofPath,
            'submitted_at' => now(),
        ]);

        if ($rule->validation_type === ValidationType::Automatic) {
            return $this->approveAction($action);
        }

        $action->load(['rule', 'member.user']);
        EcoActionSubmitted::dispatch($action);

        return $action;
    }

    public function approveAction(MemberEcoAction $action, ?User $validator = null): MemberEcoAction
    {
        return DB::transaction(function () use ($action, $validator) {
            $action = MemberEcoAction::query()->lockForUpdate()->findOrFail($action->id);

            if ($action->status !== EcoActionStatus::Pending && $action->status !== EcoActionStatus::Approved) {
                throw ValidationException::withMessages(['status' => ['Action non validable.']]);
            }

            if ($action->status === EcoActionStatus::Approved) {
                return $action->load('rule');
            }

            $member = Member::query()->lockForUpdate()->findOrFail($action->member_id);
            $rule = $action->rule;

            $action->update([
                'status' => EcoActionStatus::Approved,
                'validated_by' => $validator?->id,
                'validated_at' => now(),
            ]);

            $this->creditPoints($member, $rule->points, "Action: {$rule->name}", $action, $validator);

            EcoImpact::query()->create([
                'member_id' => $member->id,
                'member_eco_action_id' => $action->id,
                'co2_kg' => $rule->co2_kg,
                'water_liters' => $rule->water_liters,
                'trees_planted' => $rule->code === 'plant_tree' ? 1 : 0,
                'waste_items' => str_contains($rule->code, 'waste') || str_contains($rule->code, 'plastic') ? 1 : 0,
            ]);

            $this->syncLevel($member);
            $this->checkBadges($member);
            $this->progressChallenges($member, $rule->code);

            $approved = $action->fresh(['rule', 'member.user']);
            EcoActionApproved::dispatch($approved);

            $this->activity->log(
                'eco.action.approve',
                'Action green #'.$approved->id.' validée (+'.$approved->points.' pts)',
                $approved,
                ['member_id' => $approved->member_id],
                $validator
            );

            return $approved;
        });
    }

    public function rejectAction(MemberEcoAction $action, User $validator, string $reason): MemberEcoAction
    {
        if ($action->status !== EcoActionStatus::Pending) {
            throw ValidationException::withMessages(['status' => ['Seules les actions en attente peuvent être rejetées.']]);
        }

        $action->update([
            'status' => EcoActionStatus::Rejected,
            'rejection_reason' => $reason,
            'validated_by' => $validator->id,
            'validated_at' => now(),
        ]);

        $fresh = $action->fresh(['rule']);

        $this->activity->log(
            'eco.action.reject',
            'Action green #'.$fresh->id.' refusée',
            $fresh,
            ['reason' => $reason],
            $validator
        );

        return $fresh;
    }

    public function redeem(Member $member, EcoReward $reward, ?User $processedBy = null): RewardRedemption
    {
        return DB::transaction(function () use ($member, $reward, $processedBy) {
            $member = Member::query()->lockForUpdate()->findOrFail($member->id);
            $reward = EcoReward::query()->lockForUpdate()->findOrFail($reward->id);

            if (! $reward->is_active) {
                throw ValidationException::withMessages(['reward' => ['Récompense indisponible.']]);
            }

            if ($reward->stock !== null && $reward->stock < 1) {
                throw ValidationException::withMessages(['reward' => ['Stock épuisé.']]);
            }

            if ($member->eco_points < $reward->cost_points) {
                throw ValidationException::withMessages([
                    'points' => ["Points insuffisants. Solde: {$member->eco_points}, coût: {$reward->cost_points}."],
                ]);
            }

            // Hold points until admin accepts the exchange
            $this->debitPoints($member, $reward->cost_points, "Demande échange: {$reward->name}", $reward, $processedBy);

            if ($reward->stock !== null) {
                $reward->decrement('stock');
            }

            $redemption = RewardRedemption::query()->create([
                'member_id' => $member->id,
                'eco_reward_id' => $reward->id,
                'points_spent' => $reward->cost_points,
                'status' => 'pending',
                'redeemed_at' => now(),
                'processed_by' => null,
            ])->load(['reward', 'member.user']);

            RewardRedemptionRequested::dispatch($redemption);

            return $redemption;
        });
    }

    public function approveRedemption(RewardRedemption $redemption, User $admin): RewardRedemption
    {
        return DB::transaction(function () use ($redemption, $admin) {
            $redemption = RewardRedemption::query()->lockForUpdate()->findOrFail($redemption->id);

            if ($redemption->status !== 'pending') {
                throw ValidationException::withMessages(['status' => ['Échange déjà traité.']]);
            }

            $redemption->update([
                'status' => 'completed',
                'processed_by' => $admin->id,
            ]);

            $fresh = $redemption->fresh(['reward', 'member.user']);
            RewardRedemptionProcessed::dispatch($fresh, 'approved');

            $this->activity->log(
                'eco.redemption.approve',
                'Échange #'.$fresh->id.' accepté',
                $fresh,
                null,
                $admin
            );

            return $fresh;
        });
    }

    public function rejectRedemption(RewardRedemption $redemption, User $admin, ?string $reason = null): RewardRedemption
    {
        return DB::transaction(function () use ($redemption, $admin, $reason) {
            $redemption = RewardRedemption::query()->lockForUpdate()->findOrFail($redemption->id);

            if ($redemption->status !== 'pending') {
                throw ValidationException::withMessages(['status' => ['Échange déjà traité.']]);
            }

            $member = Member::query()->lockForUpdate()->findOrFail($redemption->member_id);
            $reward = EcoReward::query()->lockForUpdate()->findOrFail($redemption->eco_reward_id);

            $this->creditPoints(
                $member,
                $redemption->points_spent,
                'Remboursement échange refusé'.($reason ? ": {$reason}" : ''),
                $redemption,
                $admin
            );

            if ($reward->stock !== null) {
                $reward->increment('stock');
            }

            $redemption->update([
                'status' => 'rejected',
                'processed_by' => $admin->id,
            ]);

            $fresh = $redemption->fresh(['reward', 'member.user']);
            RewardRedemptionProcessed::dispatch($fresh, 'rejected');

            $this->activity->log(
                'eco.redemption.reject',
                'Échange #'.$fresh->id.' refusé',
                $fresh,
                ['reason' => $reason],
                $admin
            );

            return $fresh;
        });
    }

    public function joinChallenge(Member $member, EcoChallenge $challenge): void
    {
        if (! $challenge->is_active || $challenge->ends_at->isPast()) {
            throw ValidationException::withMessages(['challenge' => ['Challenge indisponible.']]);
        }

        if ($member->challenges()->where('eco_challenge_id', $challenge->id)->exists()) {
            throw ValidationException::withMessages(['challenge' => ['Déjà inscrit à ce challenge.']]);
        }

        $member->challenges()->attach($challenge->id, [
            'progress' => 0,
            'completed' => false,
            'joined_at' => now(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function profile(Member $member): array
    {
        $level = $this->resolveLevel($member->eco_points);
        $next = EcoLevel::query()
            ->where('min_points', '>', $member->eco_points)
            ->orderBy('min_points')
            ->first();

        return [
            'member_id' => $member->id,
            'green_score' => $member->green_score,
            'eco_points' => $member->eco_points,
            'green_level' => $member->green_level,
            'level' => $level ? [
                'name' => $level->name,
                'slug' => $level->slug,
                'min_points' => $level->min_points,
                'rank' => $level->rank,
            ] : null,
            'next_level' => $next ? [
                'name' => $next->name,
                'min_points' => $next->min_points,
                'points_needed' => $next->min_points - $member->eco_points,
            ] : null,
            'badges' => $member->badges()->get(['eco_badges.id', 'name', 'slug', 'icon']),
            'impact' => [
                'co2_kg' => (float) EcoImpact::query()->where('member_id', $member->id)->sum('co2_kg'),
                'water_liters' => (float) EcoImpact::query()->where('member_id', $member->id)->sum('water_liters'),
                'trees_planted' => (int) EcoImpact::query()->where('member_id', $member->id)->sum('trees_planted'),
                'waste_items' => (int) EcoImpact::query()->where('member_id', $member->id)->sum('waste_items'),
            ],
        ];
    }

    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function leaderboard(string $period = 'global', int $limit = 20): Collection
    {
        $query = Member::query()
            ->with('user')
            ->where('is_active', true)
            ->orderByDesc('eco_points')
            ->limit($limit);

        if ($period === 'monthly') {
            $memberIds = EcoPointsTransaction::query()
                ->where('created_at', '>=', now()->startOfMonth())
                ->where('points', '>', 0)
                ->selectRaw('member_id, SUM(points) as period_points')
                ->groupBy('member_id')
                ->orderByDesc('period_points')
                ->limit($limit)
                ->pluck('period_points', 'member_id');

            return Member::query()
                ->with('user')
                ->whereIn('id', $memberIds->keys())
                ->get()
                ->map(fn (Member $m) => [
                    'member_id' => $m->id,
                    'full_name' => $m->user->full_name,
                    'eco_points' => (int) ($memberIds[$m->id] ?? 0),
                    'green_level' => $m->green_level,
                ])
                ->sortByDesc('eco_points')
                ->values();
        }

        return $query->get()->map(fn (Member $m, int $i) => [
            'rank' => $i + 1,
            'member_id' => $m->id,
            'full_name' => $m->user->full_name,
            'eco_points' => $m->eco_points,
            'green_score' => $m->green_score,
            'green_level' => $m->green_level,
        ]);
    }

    private function creditPoints(Member $member, int $points, string $reason, mixed $reference = null, ?User $by = null): void
    {
        $member->increment('eco_points', $points);
        $member->increment('green_score', $points);
        $member->refresh();

        EcoPointsTransaction::query()->create([
            'member_id' => $member->id,
            'points' => $points,
            'balance_after' => $member->eco_points,
            'reason' => $reason,
            'reference_type' => $reference ? $reference::class : null,
            'reference_id' => $reference?->id,
            'created_by' => $by?->id,
        ]);
    }

    private function debitPoints(Member $member, int $points, string $reason, mixed $reference = null, ?User $by = null): void
    {
        $member->decrement('eco_points', $points);
        $member->refresh();

        EcoPointsTransaction::query()->create([
            'member_id' => $member->id,
            'points' => -$points,
            'balance_after' => $member->eco_points,
            'reason' => $reason,
            'reference_type' => $reference ? $reference::class : null,
            'reference_id' => $reference?->id,
            'created_by' => $by?->id,
        ]);
    }

    private function syncLevel(Member $member): void
    {
        $level = $this->resolveLevel($member->eco_points);

        if ($level) {
            $member->update(['green_level' => $level->rank]);
        }
    }

    private function resolveLevel(int $points): ?EcoLevel
    {
        return EcoLevel::query()
            ->where('min_points', '<=', $points)
            ->orderByDesc('min_points')
            ->first();
    }

    private function checkBadges(Member $member): void
    {
        $badges = EcoBadge::query()->get();
        $owned = $member->badges()->pluck('eco_badges.id');

        foreach ($badges as $badge) {
            if ($owned->contains($badge->id)) {
                continue;
            }

            $earned = false;

            if ($badge->required_points && $member->eco_points >= $badge->required_points) {
                $earned = true;
            }

            if ($badge->required_rule_code && $badge->required_rule_count) {
                $count = MemberEcoAction::query()
                    ->where('member_id', $member->id)
                    ->where('status', EcoActionStatus::Approved)
                    ->whereHas('rule', fn ($q) => $q->where('code', $badge->required_rule_code))
                    ->count();

                if ($count >= $badge->required_rule_count) {
                    $earned = true;
                }
            }

            if ($earned) {
                $member->badges()->attach($badge->id, ['earned_at' => now()]);
            }
        }
    }

    private function progressChallenges(Member $member, string $ruleCode): void
    {
        $pivots = DB::table('member_challenges')
            ->where('member_id', $member->id)
            ->where('completed', false)
            ->get();

        foreach ($pivots as $pivot) {
            $challenge = EcoChallenge::query()->find($pivot->eco_challenge_id);

            if (! $challenge || ($challenge->target_rule_code && $challenge->target_rule_code !== $ruleCode)) {
                continue;
            }

            $progress = $pivot->progress + 1;
            $completed = $progress >= $challenge->target_count;

            DB::table('member_challenges')
                ->where('id', $pivot->id)
                ->update([
                    'progress' => $progress,
                    'completed' => $completed,
                    'completed_at' => $completed ? now() : null,
                    'updated_at' => now(),
                ]);

            if ($completed && $challenge->reward_points > 0) {
                $member = Member::query()->lockForUpdate()->findOrFail($member->id);
                $this->creditPoints($member, $challenge->reward_points, "Challenge: {$challenge->name}", $challenge);
                $this->syncLevel($member);

                if ($challenge->eco_badge_id && ! $member->badges()->where('eco_badge_id', $challenge->eco_badge_id)->exists()) {
                    $member->badges()->attach($challenge->eco_badge_id, ['earned_at' => now()]);
                }
            }
        }
    }

    private function assertLimits(Member $member, EcoRule $rule): void
    {
        if ($rule->daily_limit) {
            $daily = MemberEcoAction::query()
                ->where('member_id', $member->id)
                ->where('eco_rule_id', $rule->id)
                ->where('submitted_at', '>=', now()->startOfDay())
                ->whereIn('status', [EcoActionStatus::Pending, EcoActionStatus::Approved])
                ->count();

            if ($daily >= $rule->daily_limit) {
                throw ValidationException::withMessages(['eco_rule_id' => ['Limite quotidienne atteinte.']]);
            }
        }

        if ($rule->monthly_limit) {
            $monthly = MemberEcoAction::query()
                ->where('member_id', $member->id)
                ->where('eco_rule_id', $rule->id)
                ->where('submitted_at', '>=', now()->startOfMonth())
                ->whereIn('status', [EcoActionStatus::Pending, EcoActionStatus::Approved])
                ->count();

            if ($monthly >= $rule->monthly_limit) {
                throw ValidationException::withMessages(['eco_rule_id' => ['Limite mensuelle atteinte.']]);
            }
        }
    }
}
