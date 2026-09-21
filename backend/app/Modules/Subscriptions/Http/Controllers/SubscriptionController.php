<?php

namespace App\Modules\Subscriptions\Http\Controllers;

use App\Modules\Core\Http\Controllers\ApiController;
use App\Modules\Members\Models\Member;
use App\Modules\Offers\Models\Offer;
use App\Modules\Subscriptions\Http\Requests\StoreSubscriptionRequest;
use App\Modules\Subscriptions\Http\Resources\SubscriptionResource;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Subscriptions\Services\SubscriptionService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends ApiController
{
    public function __construct(
        private readonly SubscriptionService $subscriptionService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Subscription::class);

        $memberId = $request->integer('member_id') ?: null;

        $subscriptions = $this->subscriptionService->paginate(
            memberId: $memberId,
            perPage: $request->integer('per_page', 15)
        );

        return $this->success(SubscriptionResource::collection($subscriptions));
    }

    public function store(StoreSubscriptionRequest $request): JsonResponse
    {
        $this->authorize('create', Subscription::class);

        $validated = $request->validated();
        $member = Member::query()->findOrFail($validated['member_id']);
        $offer = Offer::query()->with('quotas')->findOrFail($validated['offer_id']);

        $subscription = $this->subscriptionService->create(
            $member,
            $offer,
            $request->user(),
            $validated['price_paid'] ?? null,
            isset($validated['starts_at']) ? Carbon::parse($validated['starts_at']) : null,
            $validated['notes'] ?? null,
        );

        return $this->success(new SubscriptionResource($subscription), 'Abonnement créé.', 201);
    }

    public function show(Subscription $subscription): JsonResponse
    {
        $this->authorize('view', $subscription);

        return $this->success(
            new SubscriptionResource($this->subscriptionService->find($subscription->id))
        );
    }

    public function suspend(Subscription $subscription): JsonResponse
    {
        $this->authorize('update', $subscription);

        $updated = $this->subscriptionService->suspend($subscription, request('notes'));

        return $this->success(new SubscriptionResource($updated), 'Abonnement suspendu.');
    }

    public function activate(Subscription $subscription): JsonResponse
    {
        $this->authorize('update', $subscription);

        $updated = $this->subscriptionService->activate($subscription);

        return $this->success(new SubscriptionResource($updated), 'Abonnement activé.');
    }

    public function cancel(Subscription $subscription): JsonResponse
    {
        $this->authorize('update', $subscription);

        $updated = $this->subscriptionService->cancel($subscription, request('notes'));

        return $this->success(new SubscriptionResource($updated), 'Abonnement résilié.');
    }

    public function renew(Request $request, Subscription $subscription): JsonResponse
    {
        $this->authorize('update', $subscription);

        $updated = $this->subscriptionService->renew($subscription, $request->user());

        return $this->success(new SubscriptionResource($updated), 'Abonnement renouvelé.', 201);
    }

    public function activeForMember(Request $request, Member $member): JsonResponse
    {
        $user = $request->user();
        $isStaff = $user->hasAnyRole(['admin', 'reception', 'coach']);
        $isSelf = $user->member?->id === $member->id;

        if (! $isStaff && ! $isSelf) {
            return $this->error('Accès refusé.', 403);
        }

        $items = $this->subscriptionService->listActiveForMember($member);

        return $this->success(SubscriptionResource::collection($items));
    }
}
