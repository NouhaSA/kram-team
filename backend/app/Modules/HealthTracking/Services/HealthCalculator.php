<?php

namespace App\Modules\HealthTracking\Services;

use App\Modules\Core\Enums\Gender;
use App\Modules\HealthTracking\Enums\HealthGoal;
use App\Modules\HealthTracking\Models\MemberHealthEntry;
use App\Modules\HealthTracking\Models\MemberHealthProfile;
use App\Modules\Members\Models\Member;
use Illuminate\Support\Collection;

class HealthCalculator
{
    /**
     * @param  Collection<int, MemberHealthEntry>  $entries
     * @return array<string, mixed>
     */
    public function summarize(Member $member, ?MemberHealthProfile $profile, Collection $entries): array
    {
        $latest = $entries->sortByDesc(fn (MemberHealthEntry $e) => $e->recorded_at)->first();
        $heightCm = (float) ($latest?->height_cm ?: $profile?->height_cm ?: 0);
        $weightKg = (float) ($latest?->weight_kg ?: $profile?->start_weight_kg ?: 0);
        $startWeight = (float) ($profile?->start_weight_kg ?: $entries->sortBy('recorded_at')->first()?->weight_kg ?: $weightKg);
        $targetWeight = $profile?->target_weight_kg !== null ? (float) $profile->target_weight_kg : null;
        $goal = $profile?->goal ?? HealthGoal::Maintain;

        $bmi = $this->bmi($weightKg, $heightCm);
        $ideal = $this->idealWeightRange($heightCm, $member->gender);
        $progress = $this->progressPercent($startWeight, $weightKg, $targetWeight, $goal);
        $delta = $weightKg && $startWeight ? round($weightKg - $startWeight, 1) : null;

        $history = $entries
            ->sortBy('recorded_at')
            ->values()
            ->map(function (MemberHealthEntry $entry) use ($profile) {
                $h = (float) ($entry->height_cm ?: $profile?->height_cm ?: 0);

                return [
                    'id' => $entry->id,
                    'recorded_at' => $entry->recorded_at?->toIso8601String(),
                    'weight_kg' => $entry->weight_kg,
                    'height_cm' => $entry->height_cm,
                    'body_fat_percent' => $entry->body_fat_percent,
                    'muscle_mass_kg' => $entry->muscle_mass_kg,
                    'waist_cm' => $entry->waist_cm,
                    'resting_hr' => $entry->resting_hr,
                    'notes' => $entry->notes,
                    'bmi' => $this->bmi((float) $entry->weight_kg, $h),
                    'recorded_by' => $entry->recordedBy?->full_name,
                ];
            })
            ->all();

        $age = $member->date_of_birth?->age;
        $nutrition = $this->nutritionGuidance(
            weightKg: $weightKg,
            heightCm: $heightCm,
            age: $age,
            gender: $member->gender,
            activityLevel: $profile?->activity_level ?? 3,
            goal: $goal,
        );

        return [
            'profile' => $profile ? [
                'height_cm' => $profile->height_cm,
                'goal' => $profile->goal->value,
                'goal_label' => $profile->goal->label(),
                'start_weight_kg' => $profile->start_weight_kg,
                'target_weight_kg' => $profile->target_weight_kg,
                'target_date' => $profile->target_date?->toDateString(),
                'activity_level' => $profile->activity_level,
                'notes' => $profile->notes,
            ] : null,
            'latest' => $latest ? [
                'weight_kg' => $latest->weight_kg,
                'height_cm' => $heightCm ?: null,
                'body_fat_percent' => $latest->body_fat_percent,
                'recorded_at' => $latest->recorded_at?->toIso8601String(),
            ] : null,
            'metrics' => [
                'bmi' => $bmi,
                'bmi_category' => $this->bmiCategory($bmi),
                'ideal_weight_min_kg' => $ideal['min'],
                'ideal_weight_max_kg' => $ideal['max'],
                'ideal_weight_kg' => $ideal['ideal'],
                'start_weight_kg' => $startWeight ?: null,
                'current_weight_kg' => $weightKg ?: null,
                'target_weight_kg' => $targetWeight,
                'delta_kg' => $delta,
                'progress_percent' => $progress,
                'remaining_kg' => $targetWeight !== null && $weightKg
                    ? round($targetWeight - $weightKg, 1)
                    : null,
            ],
            'nutrition' => $nutrition,
            'recommendations' => $this->recommendations($bmi, $goal, $progress, $delta, $nutrition),
            'history' => $history,
            'entries_count' => count($history),
        ];
    }

    public function bmi(float $weightKg, float $heightCm): ?float
    {
        if ($weightKg <= 0 || $heightCm <= 0) {
            return null;
        }

        $meters = $heightCm / 100;

        return round($weightKg / ($meters * $meters), 1);
    }

    public function bmiCategory(?float $bmi): ?string
    {
        if ($bmi === null) {
            return null;
        }

        return match (true) {
            $bmi < 18.5 => 'Insuffisance pondérale',
            $bmi < 25 => 'Poids normal',
            $bmi < 30 => 'Surpoids',
            default => 'Obésité',
        };
    }

    /**
     * Devine formula + BMI 18.5–24.9 band.
     *
     * @return array{min: ?float, max: ?float, ideal: ?float}
     */
    public function idealWeightRange(float $heightCm, ?Gender $gender): array
    {
        if ($heightCm < 100) {
            return ['min' => null, 'max' => null, 'ideal' => null];
        }

        $meters = $heightCm / 100;
        $min = round(18.5 * $meters * $meters, 1);
        $max = round(24.9 * $meters * $meters, 1);

        $inches = $heightCm / 2.54;
        $ideal = match ($gender) {
            Gender::Female => 45.5 + 2.3 * max(0, $inches - 60),
            default => 50 + 2.3 * max(0, $inches - 60),
        };

        return [
            'min' => $min,
            'max' => $max,
            'ideal' => round($ideal, 1),
        ];
    }

    public function progressPercent(
        float $start,
        float $current,
        ?float $target,
        HealthGoal $goal
    ): ?float {
        if ($start <= 0 || $current <= 0 || $target === null) {
            return null;
        }

        if ($goal === HealthGoal::Maintain) {
            $tolerance = max(1, abs($start) * 0.02);
            $distance = abs($current - $target);

            return round(max(0, min(100, (1 - ($distance / $tolerance)) * 100)), 1);
        }

        $total = $start - $target;
        if (abs($total) < 0.1) {
            return 100.0;
        }

        $done = $start - $current;
        $percent = ($done / $total) * 100;

        return round(max(0, min(100, $percent)), 1);
    }

    /**
     * @return array<string, mixed>
     */
    public function nutritionGuidance(
        float $weightKg,
        float $heightCm,
        ?int $age,
        ?Gender $gender,
        int $activityLevel,
        HealthGoal $goal,
    ): array {
        if ($weightKg <= 0 || $heightCm <= 0 || ! $age || $age < 10) {
            return [
                'bmr' => null,
                'tdee' => null,
                'calorie_target' => null,
                'protein_g' => null,
                'note' => 'Renseigne poids, taille et date de naissance pour les calculs nutritionnels.',
            ];
        }

        $bmr = match ($gender) {
            Gender::Female => 10 * $weightKg + 6.25 * $heightCm - 5 * $age - 161,
            default => 10 * $weightKg + 6.25 * $heightCm - 5 * $age + 5,
        };

        $multiplier = match (max(1, min(5, $activityLevel))) {
            1 => 1.2,
            2 => 1.375,
            3 => 1.55,
            4 => 1.725,
            default => 1.9,
        };

        $tdee = $bmr * $multiplier;
        $calorieTarget = match ($goal) {
            HealthGoal::LoseWeight => $tdee - 500,
            HealthGoal::GainWeight => $tdee + 300,
            HealthGoal::Recomposition => $tdee - 200,
            HealthGoal::Maintain => $tdee,
        };

        $protein = match ($goal) {
            HealthGoal::GainWeight, HealthGoal::Recomposition => $weightKg * 1.8,
            HealthGoal::LoseWeight => $weightKg * 1.6,
            default => $weightKg * 1.4,
        };

        return [
            'bmr' => (int) round($bmr),
            'tdee' => (int) round($tdee),
            'calorie_target' => (int) round(max(1200, $calorieTarget)),
            'protein_g' => (int) round($protein),
            'note' => null,
        ];
    }

    /**
     * @param  array<string, mixed>  $nutrition
     * @return list<string>
     */
    public function recommendations(
        ?float $bmi,
        HealthGoal $goal,
        ?float $progress,
        ?float $delta,
        array $nutrition
    ): array {
        $tips = [];

        if ($bmi !== null && $bmi >= 30) {
            $tips[] = 'IMC élevé : privilégie un déficit calorique progressif et un suivi coach régulier.';
        } elseif ($bmi !== null && $bmi < 18.5) {
            $tips[] = 'IMC bas : vise une prise de masse contrôlée avec protéines et force.';
        }

        $tips[] = match ($goal) {
            HealthGoal::LoseWeight => 'Objectif perte : vise ~0.5 kg/semaine et 2–4 séances cardio + force.',
            HealthGoal::GainWeight => 'Objectif prise : surplus calorique modéré + force 3–4×/semaine.',
            HealthGoal::Recomposition => 'Recomposition : protéines élevées, déficit léger, force prioritaire.',
            HealthGoal::Maintain => 'Maintien : stabilise les apports et garde 2–3 séances/semaine.',
        };

        if ($nutrition['calorie_target']) {
            $tips[] = "Cible estimée : {$nutrition['calorie_target']} kcal/jour · protéines ~{$nutrition['protein_g']} g.";
        }

        if ($progress !== null && $progress >= 80) {
            $tips[] = 'Très bon avancement — ajuste la cible ou passe en phase maintien.';
        } elseif ($progress !== null && $progress < 20 && $delta !== null && abs($delta) < 0.3) {
            $tips[] = 'Peu de variation : vérifie la régularité des saisies et l’adhérence au plan.';
        }

        $tips[] = 'Saisis ton poids 1×/semaine dans les mêmes conditions (matin, à jeun).';

        return $tips;
    }
}
