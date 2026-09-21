<?php

namespace App\Modules\Subscriptions\Services;

use App\Modules\Members\Models\Member;
use App\Modules\Notifications\Events\SubscriptionCreated;
use App\Modules\Offers\Models\Offer;
use App\Modules\Subscriptions\Enums\SubscriptionStatus;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Users\Models\User;
use Carbon\Carbon;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SubscriptionService
{
    public function paginate(?int $memberId = null, int $perPage = 15): LengthAwarePaginator
    {
        return Subscription::query()
            ->with(['member.user', 'offer', 'quotas'])
            ->when($memberId, fn ($q) => $q->where('member_id', $memberId))
            ->latest()
            ->paginate($perPage);
    }

    public function find(int $id): Subscription
    {
        return Subscription::query()
            ->with(['member.user', 'offer.quotas', 'quotas.transactions', 'createdBy'])
            ->findOrFail($id);
    }

    public function getActiveForMember(Member $member): ?Subscription
    {
        return $this->listActiveForMember($member)->first();
    }

    /**
     * @return \Illuminate\Support\Collection<int, Subscription>
     */
    public function listActiveForMember(Member $member): \Illuminate\Support\Collection
    {
        return Subscription::query()
            ->with(['offer', 'quotas'])
            ->where('member_id', $member->id)
            ->where('status', SubscriptionStatus::Active)
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>', now()))
            ->latest('starts_at')
            ->get();
    }

    public function findActiveForMember(Member $member, int $subscriptionId): ?Subscription
    {
        return Subscription::query()
            ->with(['offer', 'quotas'])
            ->where('id', $subscriptionId)
            ->where('member_id', $member->id)
            ->where('status', SubscriptionStatus::Active)
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>', now()))
            ->first();
    }

    public function create(
        Member $member,
        Offer $offer,
        ?User $createdBy = null,
        ?float $pricePaid = null,
        ?Carbon $startsAt = null,
        ?string $notes = null,
    ): Subscription {
        $subscription = DB::transaction(function () use ($member, $offer, $createdBy, $pricePaid, $startsAt, $notes) {
            $startsAt ??= now();
            $endsAt = $offer->duration_days
                ? $startsAt->copy()->addDays($offer->duration_days)
                : null;

            $subscription = Subscription::query()->create([
                'member_id' => $member->id,
                'offer_id' => $offer->id,
                'status' => SubscriptionStatus::Active,
                'price_paid' => $pricePaid ?? $offer->effectivePrice(),
                'starts_at' => $startsAt,
                'ends_at' => $endsAt,
                'notes' => $notes,
                'created_by' => $createdBy?->id,
            ]);

            foreach ($offer->quotas as $offerQuota) {
                $subscription->quotas()->create([
                    'offer_quota_id' => $offerQuota->id,
                    'label' => $offerQuota->label,
                    'quota_type' => $offerQuota->quota_type,
                    'total' => $offerQuota->total,
                    'activity_type' => $offerQuota->activity_type,
                    'expires_at' => $endsAt,
                ]);
            }

            return $subscription->load(['offer', 'quotas', 'member.user']);
        });

        SubscriptionCreated::dispatch($subscription);

        return $subscription;
    }

    public function suspend(Subscription $subscription, ?string $notes = null): Subscription
    {
        $this->ensureStatus($subscription, [SubscriptionStatus::Active]);

        $subscription->update([
            'status' => SubscriptionStatus::Suspended,
            'notes' => $notes ?? $subscription->notes,
        ]);

        return $subscription->fresh(['quotas', 'offer']);
    }

    public function activate(Subscription $subscription): Subscription
    {
        $this->ensureStatus($subscription, [SubscriptionStatus::Suspended, SubscriptionStatus::Pending]);

        $subscription->update(['status' => SubscriptionStatus::Active]);

        return $subscription->fresh(['quotas', 'offer']);
    }

    public function cancel(Subscription $subscription, ?string $notes = null): Subscription
    {
        $this->ensureStatus($subscription, [
            SubscriptionStatus::Active,
            SubscriptionStatus::Suspended,
            SubscriptionStatus::Pending,
        ]);

        $subscription->update([
            'status' => SubscriptionStatus::Cancelled,
            'notes' => $notes ?? $subscription->notes,
        ]);

        return $subscription->fresh(['quotas', 'offer']);
    }

    public function renew(Subscription $subscription, User $createdBy): Subscription
    {
        $this->ensureStatus($subscription, [SubscriptionStatus::Active, SubscriptionStatus::Expired]);

        return DB::transaction(function () use ($subscription, $createdBy) {
            $subscription->update(['status' => SubscriptionStatus::Renewed]);

            $newSubscription = $this->create(
                $subscription->member,
                $subscription->offer,
                $createdBy,
                (float) $subscription->offer->effectivePrice(),
                now(),
                "Renouvellement de l'abonnement #{$subscription->id}"
            );

            $newSubscription->update(['renewed_from_id' => $subscription->id]);

            return $newSubscription->load(['offer', 'quotas', 'member.user']);
        });
    }

    /**
     * @param  list<SubscriptionStatus>  $allowed
     */
    private function ensureStatus(Subscription $subscription, array $allowed): void
    {
        if (! in_array($subscription->status, $allowed, true)) {
            throw ValidationException::withMessages([
                'status' => ["Transition impossible depuis le statut « {$subscription->status->label()} »."],
            ]);
        }
    }
}
