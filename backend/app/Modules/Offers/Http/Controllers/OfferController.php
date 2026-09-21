<?php

namespace App\Modules\Offers\Http\Controllers;

use App\Modules\Core\Http\Controllers\ApiController;
use App\Modules\Offers\Http\Requests\StoreOfferRequest;
use App\Modules\Offers\Http\Requests\UpdateOfferRequest;
use App\Modules\Offers\Http\Resources\OfferResource;
use App\Modules\Offers\Models\Offer;
use App\Modules\Offers\Services\OfferService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfferController extends ApiController
{
    public function __construct(
        private readonly OfferService $offerService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Offer::class);

        $offers = $this->offerService->paginate(
            activeOnly: $request->boolean('active_only'),
            perPage: $request->integer('per_page', 15)
        );

        return $this->success(OfferResource::collection($offers));
    }

    public function store(StoreOfferRequest $request): JsonResponse
    {
        $this->authorize('create', Offer::class);

        $validated = $request->validated();
        $quotas = $validated['quotas'] ?? [];
        $coachIds = $validated['coach_ids'] ?? [];

        $offer = $this->offerService->create(
            collect($validated)->except(['quotas', 'coach_ids'])->all(),
            $quotas,
            $coachIds
        );

        return $this->success(new OfferResource($offer), 'Offre créée.', 201);
    }

    public function show(Offer $offer): JsonResponse
    {
        $this->authorize('view', $offer);

        return $this->success(new OfferResource($this->offerService->find($offer->id)));
    }

    public function update(UpdateOfferRequest $request, Offer $offer): JsonResponse
    {
        $this->authorize('update', $offer);

        $validated = $request->validated();

        $updated = $this->offerService->update(
            $offer,
            collect($validated)->except(['quotas', 'coach_ids'])->all(),
            $validated['quotas'] ?? null,
            $validated['coach_ids'] ?? null
        );

        return $this->success(new OfferResource($updated), 'Offre mise à jour.');
    }
}
