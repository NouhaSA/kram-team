<?php

namespace App\Modules\Offers\Services;

use App\Modules\Offers\Models\Offer;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OfferService
{
    public function paginate(bool $activeOnly = false, int $perPage = 15): LengthAwarePaginator
    {
        return Offer::query()
            ->with(['quotas', 'coaches'])
            ->when($activeOnly, fn ($q) => $q->where('is_active', true))
            ->latest()
            ->paginate($perPage);
    }

    public function find(int $id): Offer
    {
        return Offer::query()
            ->with(['quotas', 'coaches'])
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  list<array<string, mixed>>  $quotas
     * @param  list<int>  $coachIds
     */
    public function create(array $data, array $quotas = [], array $coachIds = []): Offer
    {
        return DB::transaction(function () use ($data, $quotas, $coachIds) {
            $offer = Offer::query()->create([
                ...$data,
                'slug' => $data['slug'] ?? Str::slug($data['name']),
            ]);

            $this->syncQuotas($offer, $quotas);
            $offer->coaches()->sync($coachIds);

            return $offer->load(['quotas', 'coaches']);
        });
    }

    /**
     * @param  array<string, mixed>  $data
     * @param  list<array<string, mixed>>|null  $quotas
     * @param  list<int>|null  $coachIds
     */
    public function update(Offer $offer, array $data, ?array $quotas = null, ?array $coachIds = null): Offer
    {
        return DB::transaction(function () use ($offer, $data, $quotas, $coachIds) {
            $offer->update($data);

            if ($quotas !== null) {
                $this->syncQuotas($offer, $quotas);
            }

            if ($coachIds !== null) {
                $offer->coaches()->sync($coachIds);
            }

            return $offer->fresh(['quotas', 'coaches']);
        });
    }

    /**
     * @param  list<array<string, mixed>>  $quotas
     */
    private function syncQuotas(Offer $offer, array $quotas): void
    {
        $offer->quotas()->delete();

        foreach ($quotas as $index => $quota) {
            $offer->quotas()->create([
                'label' => $quota['label'],
                'quota_type' => $quota['quota_type'],
                'total' => $quota['total'] ?? null,
                'activity_type' => $quota['activity_type'] ?? null,
                'sort_order' => $quota['sort_order'] ?? $index,
            ]);
        }
    }
}
