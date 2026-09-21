<?php

namespace Database\Seeders;

use App\Modules\GreenRewards\Enums\EcoCategory;
use App\Modules\GreenRewards\Enums\ValidationType;
use App\Modules\GreenRewards\Models\EcoBadge;
use App\Modules\GreenRewards\Models\EcoChallenge;
use App\Modules\GreenRewards\Models\EcoLevel;
use App\Modules\GreenRewards\Models\EcoReward;
use App\Modules\GreenRewards\Models\EcoRule;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GreenRewardsSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            ['name' => 'Green Starter', 'slug' => 'green-starter', 'min_points' => 0, 'rank' => 0],
            ['name' => 'Eco Member', 'slug' => 'eco-member', 'min_points' => 500, 'rank' => 1],
            ['name' => 'Green Athlete', 'slug' => 'green-athlete', 'min_points' => 1500, 'rank' => 2],
            ['name' => 'Eco Warrior', 'slug' => 'eco-warrior', 'min_points' => 3000, 'rank' => 3],
            ['name' => 'Kram Green Champion', 'slug' => 'kram-green-champion', 'min_points' => 5000, 'rank' => 4],
        ];

        foreach ($levels as $level) {
            EcoLevel::query()->firstOrCreate(['slug' => $level['slug']], $level);
        }

        $rules = [
            ['code' => 'bike', 'name' => 'Venir à vélo', 'category' => EcoCategory::Mobility, 'points' => 50, 'validation_type' => ValidationType::Automatic, 'daily_limit' => 1, 'co2_kg' => 1.5],
            ['code' => 'walk', 'name' => 'Venir à pied', 'category' => EcoCategory::Mobility, 'points' => 40, 'validation_type' => ValidationType::Automatic, 'daily_limit' => 1, 'co2_kg' => 1.2],
            ['code' => 'public_transport', 'name' => 'Transport public', 'category' => EcoCategory::Mobility, 'points' => 20, 'validation_type' => ValidationType::Automatic, 'daily_limit' => 1, 'co2_kg' => 0.8],
            ['code' => 'carpool', 'name' => 'Covoiturage', 'category' => EcoCategory::Mobility, 'points' => 30, 'validation_type' => ValidationType::Coach, 'daily_limit' => 1, 'co2_kg' => 1.0],
            ['code' => 'bottle', 'name' => 'Gourde réutilisable', 'category' => EcoCategory::Water, 'points' => 10, 'validation_type' => ValidationType::Automatic, 'daily_limit' => 1, 'water_liters' => 0.5],
            ['code' => 'save_water', 'name' => 'Économie d\'eau', 'category' => EcoCategory::Water, 'points' => 20, 'validation_type' => ValidationType::Coach, 'daily_limit' => 1, 'water_liters' => 5],
            ['code' => 'plastic', 'name' => 'Réduction plastique', 'category' => EcoCategory::Recycling, 'points' => 5, 'validation_type' => ValidationType::Automatic, 'daily_limit' => 3],
            ['code' => 'sorting', 'name' => 'Tri des déchets', 'category' => EcoCategory::Recycling, 'points' => 10, 'validation_type' => ValidationType::Automatic, 'daily_limit' => 2],
            ['code' => 'textile', 'name' => 'Textile recyclé', 'category' => EcoCategory::Recycling, 'points' => 40, 'validation_type' => ValidationType::Photo, 'monthly_limit' => 4],
            ['code' => 'beach_clean', 'name' => 'Nettoyage plage', 'category' => EcoCategory::Association, 'points' => 100, 'validation_type' => ValidationType::Admin, 'monthly_limit' => 2, 'co2_kg' => 0],
            ['code' => 'plant_tree', 'name' => 'Plantation d\'arbre', 'category' => EcoCategory::Association, 'points' => 150, 'validation_type' => ValidationType::Admin, 'monthly_limit' => 5],
            ['code' => 'waste_collect', 'name' => 'Collecte déchets', 'category' => EcoCategory::Association, 'points' => 80, 'validation_type' => ValidationType::Coach, 'monthly_limit' => 4],
            ['code' => 'regular_attendance', 'name' => 'Présence régulière', 'category' => EcoCategory::KramLife, 'points' => 50, 'validation_type' => ValidationType::Automatic, 'monthly_limit' => 4],
            ['code' => 'event_participation', 'name' => 'Participation événement', 'category' => EcoCategory::KramLife, 'points' => 30, 'validation_type' => ValidationType::QrEvent, 'monthly_limit' => 5],
            ['code' => 'referral', 'name' => 'Parrainage', 'category' => EcoCategory::KramLife, 'points' => 100, 'validation_type' => ValidationType::Admin, 'monthly_limit' => 10],
        ];

        foreach ($rules as $rule) {
            EcoRule::query()->firstOrCreate(
                ['code' => $rule['code']],
                [
                    ...$rule,
                    'is_active' => true,
                    'co2_kg' => $rule['co2_kg'] ?? 0,
                    'water_liters' => $rule['water_liters'] ?? 0,
                ]
            );
        }

        $badges = [
            ['name' => 'Green Starter', 'slug' => 'green-starter', 'icon' => '🌱', 'required_points' => 0],
            ['name' => 'Bike Member', 'slug' => 'bike-member', 'icon' => '🚴', 'required_rule_code' => 'bike', 'required_rule_count' => 5],
            ['name' => 'Water Saver', 'slug' => 'water-saver', 'icon' => '💧', 'required_rule_code' => 'bottle', 'required_rule_count' => 10],
            ['name' => 'Recycling Hero', 'slug' => 'recycling-hero', 'icon' => '♻', 'required_rule_code' => 'sorting', 'required_rule_count' => 10],
            ['name' => 'Ocean Protector', 'slug' => 'ocean-protector', 'icon' => '🌊', 'required_rule_code' => 'beach_clean', 'required_rule_count' => 1],
            ['name' => 'Tree Guardian', 'slug' => 'tree-guardian', 'icon' => '🌳', 'required_rule_code' => 'plant_tree', 'required_rule_count' => 1],
            ['name' => 'Eco Champion', 'slug' => 'eco-champion', 'icon' => '🏆', 'required_points' => 5000],
        ];

        foreach ($badges as $badge) {
            EcoBadge::query()->firstOrCreate(['slug' => $badge['slug']], $badge);
        }

        $bikeBadge = EcoBadge::query()->where('slug', 'bike-member')->first();

        EcoChallenge::query()->firstOrCreate(
            ['slug' => '10-venues-velo'],
            [
                'name' => '10 venues à vélo',
                'description' => 'Viens 10 fois à vélo ce mois-ci.',
                'starts_at' => now()->startOfMonth(),
                'ends_at' => now()->endOfMonth(),
                'target_count' => 10,
                'target_rule_code' => 'bike',
                'reward_points' => 200,
                'eco_badge_id' => $bikeBadge?->id,
                'is_active' => true,
            ]
        );

        $challenge = EcoChallenge::query()->firstOrCreate(
            ['slug' => 'zero-plastique-30j'],
            [
                'name' => '30 jours sans plastique',
                'description' => 'Réduis le plastique pendant 30 jours.',
                'starts_at' => now(),
                'ends_at' => now()->addDays(30),
                'target_count' => 15,
                'target_rule_code' => 'plastic',
                'reward_points' => 300,
                'is_active' => true,
            ]
        );
        $challenge->update([
            'is_active' => true,
            'ends_at' => now()->addDays(30),
            'starts_at' => now()->subDay(),
        ]);

        EcoChallenge::query()->firstOrCreate(
            ['slug' => 'velo-semaine'],
            [
                'name' => 'Semaine à vélo',
                'description' => 'Viens 3 fois à vélo cette semaine.',
                'starts_at' => now(),
                'ends_at' => now()->addDays(14),
                'target_count' => 3,
                'target_rule_code' => 'bike',
                'reward_points' => 120,
                'is_active' => true,
            ]
        )->update(['is_active' => true, 'ends_at' => now()->addDays(14)]);

        $rewards = [
            ['name' => 'Sticker Kram Team', 'cost_points' => 50, 'stock' => 200],
            ['name' => 'Gourde éco', 'cost_points' => 150, 'stock' => 80],
            ['name' => 'Séance gratuite', 'cost_points' => 500, 'stock' => 50],
            ['name' => 'Réduction abonnement', 'cost_points' => 1000, 'stock' => 20],
            ['name' => 'T-shirt Kram Team', 'cost_points' => 1500, 'stock' => 30],
            ['name' => 'Coaching privé', 'cost_points' => 2000, 'stock' => 10],
            ['name' => 'Pack Premium', 'cost_points' => 3000, 'stock' => 5],
        ];

        foreach ($rewards as $reward) {
            EcoReward::query()->firstOrCreate(
                ['slug' => Str::slug($reward['name'])],
                [
                    ...$reward,
                    'slug' => Str::slug($reward['name']),
                    'is_active' => true,
                ]
            );
        }
    }
}
