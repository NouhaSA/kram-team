<?php

namespace Database\Seeders;

use App\Modules\Offers\Enums\OfferType;
use App\Modules\Offers\Models\Offer;
use App\Modules\Quotas\Enums\QuotaType;
use Illuminate\Database\Seeder;

class OfferSeeder extends Seeder
{
    public function run(): void
    {
        $offers = [
            [
                'name' => 'Abonnement Illimité 1 mois',
                'slug' => 'illimite-1-mois',
                'description' => 'Accès illimité à toutes les activités pendant 1 mois.',
                'type' => OfferType::Unlimited,
                'price' => 89.00,
                'duration_days' => 30,
                'requires_booking' => false,
                'services_included' => ['Musculation', 'Cardio', 'CrossFit'],
                'quotas' => [
                    ['label' => 'Accès illimité', 'quota_type' => QuotaType::Unlimited, 'total' => null],
                ],
            ],
            [
                'name' => 'Pack 10 séances Kickboxing',
                'slug' => 'pack-10-seances-kickboxing',
                'description' => '10 séances de kickboxing à utiliser sous 3 mois.',
                'type' => OfferType::Sessions,
                'price' => 120.00,
                'duration_days' => 90,
                'requires_booking' => true,
                'services_included' => ['Kickboxing'],
                'quotas' => [
                    ['label' => 'Séances Kickboxing', 'quota_type' => QuotaType::Sessions, 'total' => 10, 'activity_type' => 'kickboxing'],
                ],
            ],
            [
                'name' => 'Pack 20 heures Coaching',
                'slug' => 'pack-20h-coaching',
                'description' => '20 heures de coaching personnel.',
                'type' => OfferType::Hourly,
                'price' => 400.00,
                'duration_days' => 180,
                'requires_booking' => true,
                'services_included' => ['Coaching personnel'],
                'quotas' => [
                    ['label' => 'Heures coaching', 'quota_type' => QuotaType::Hours, 'total' => 20, 'activity_type' => 'coaching'],
                ],
            ],
            [
                'name' => 'Pack Mixte Premium',
                'slug' => 'pack-mixte-premium',
                'description' => '12 séances Fitness + 8 CrossFit + 5h Coaching + 4 séances MMA.',
                'type' => OfferType::Mixed,
                'price' => 299.00,
                'duration_days' => 90,
                'requires_booking' => true,
                'services_included' => ['Fitness', 'CrossFit', 'Coaching', 'MMA'],
                'quotas' => [
                    ['label' => 'Séances Fitness', 'quota_type' => QuotaType::Sessions, 'total' => 12, 'activity_type' => 'fitness'],
                    ['label' => 'Séances CrossFit', 'quota_type' => QuotaType::Sessions, 'total' => 8, 'activity_type' => 'crossfit'],
                    ['label' => 'Heures Coaching', 'quota_type' => QuotaType::Hours, 'total' => 5, 'activity_type' => 'coaching'],
                    ['label' => 'Séances MMA', 'quota_type' => QuotaType::Sessions, 'total' => 4, 'activity_type' => 'mma'],
                ],
            ],
        ];

        foreach ($offers as $data) {
            $quotas = $data['quotas'];
            unset($data['quotas']);

            $offer = Offer::query()->firstOrCreate(['slug' => $data['slug']], [
                ...$data,
                'is_active' => true,
            ]);

            if ($offer->quotas()->count() === 0) {
                foreach ($quotas as $index => $quota) {
                    $offer->quotas()->create([
                        ...$quota,
                        'sort_order' => $index,
                    ]);
                }
            }
        }
    }
}
