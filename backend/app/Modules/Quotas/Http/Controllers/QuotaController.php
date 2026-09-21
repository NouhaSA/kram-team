<?php

namespace App\Modules\Quotas\Http\Controllers;

use App\Modules\Core\Http\Controllers\ApiController;
use App\Modules\Members\Models\Member;
use App\Modules\Quotas\Http\Requests\ConsumeQuotaRequest;
use App\Modules\Quotas\Services\QuotaService;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Subscriptions\Models\SubscriptionQuota;
use App\Modules\Subscriptions\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuotaController extends ApiController
{
    public function __construct(
        private readonly QuotaService $quotaService,
        private readonly SubscriptionService $subscriptionService
    ) {}

    public function memberQuotas(Request $request, Member $member): JsonResponse
    {
        $this->authorize('view', $member);

        $subscription = $this->subscriptionService->getActiveForMember($member);

        if (! $subscription) {
            return $this->success(['subscription' => null, 'quotas' => [], 'alerts' => []]);
        }

        return $this->success([
            'subscription_id' => $subscription->id,
            'quotas' => $this->quotaService->getBalances($subscription),
            'alerts' => $this->quotaService->getAlerts($subscription),
        ]);
    }

    public function subscriptionQuotas(Subscription $subscription): JsonResponse
    {
        $this->authorize('view', $subscription);

        $subscription->load('quotas');

        return $this->success([
            'quotas' => $this->quotaService->getBalances($subscription),
            'alerts' => $this->quotaService->getAlerts($subscription),
        ]);
    }

    public function history(SubscriptionQuota $subscriptionQuota): JsonResponse
    {
        $this->authorize('view', $subscriptionQuota->subscription);

        return $this->success(
            $this->quotaService->getHistory($subscriptionQuota)
        );
    }

    public function consume(ConsumeQuotaRequest $request, SubscriptionQuota $subscriptionQuota): JsonResponse
    {
        $this->authorize('update', $subscriptionQuota->subscription);

        $validated = $request->validated();

        $transaction = $this->quotaService->consume(
            $subscriptionQuota,
            $validated['amount'],
            $validated['type'],
            $request->user(),
            $validated['notes'] ?? null,
        );

        $subscriptionQuota->refresh();

        return $this->success([
            'transaction' => $transaction,
            'quota' => $this->quotaService->formatQuotaBalance($subscriptionQuota),
        ], 'Quota consommé.');
    }
}
