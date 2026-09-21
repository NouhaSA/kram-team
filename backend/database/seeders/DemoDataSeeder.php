<?php

namespace Database\Seeders;

use App\Modules\Booking\Enums\BookingStatus;
use App\Modules\Booking\Models\Booking;
use App\Modules\Core\Enums\Gender;
use App\Modules\Core\Enums\UserRole;
use App\Modules\HealthTracking\Enums\HealthGoal;
use App\Modules\HealthTracking\Models\MemberHealthEntry;
use App\Modules\HealthTracking\Models\MemberHealthProfile;
use App\Modules\Members\Models\Member;
use App\Modules\Offers\Models\Offer;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Enums\PaymentType;
use App\Modules\Payments\Models\Payment;
use App\Modules\Schedule\Enums\SlotStatus;
use App\Modules\Schedule\Models\Course;
use App\Modules\Schedule\Models\Room;
use App\Modules\Schedule\Models\ScheduleSlot;
use App\Modules\Subscriptions\Services\SubscriptionService;
use App\Modules\Users\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('email', 'admin@kramteam.com')->first();

        $reception = $this->user(
            'reception@kramteam.com',
            'Sara',
            'Ben Ali',
            '+21620101010',
            [UserRole::Reception],
        );

        $coach1 = $this->user(
            'coach@kramteam.com',
            'Youssef',
            'Mansouri',
            '+21622101010',
            [UserRole::Coach],
        );

        $coach2 = $this->user(
            'coach2@kramteam.com',
            'Ines',
            'Trabelsi',
            '+21623101010',
            [UserRole::Coach],
        );

        $membersData = [
            [
                'email' => 'member@kramteam.com',
                'first_name' => 'Ahmed',
                'last_name' => 'Chatti',
                'phone' => '+21624101010',
                'gender' => Gender::Male,
                'city' => 'Le Kram',
                'goals' => 'Perte de poids + technique kickboxing',
                'coach' => $coach1,
                'offer' => 'illimite-1-mois',
                'weight' => 84.5,
                'height' => 178,
                'target' => 78,
                'goal' => HealthGoal::LoseWeight,
            ],
            [
                'email' => 'member2@kramteam.com',
                'first_name' => 'Mariem',
                'last_name' => 'Gharbi',
                'phone' => '+21625101010',
                'gender' => Gender::Female,
                'city' => 'La Marsa',
                'goals' => 'Cardio et tonification',
                'coach' => $coach2,
                'offer' => 'pack-10-seances-kickboxing',
                'weight' => 62.0,
                'height' => 165,
                'target' => 58,
                'goal' => HealthGoal::LoseWeight,
            ],
            [
                'email' => 'member3@kramteam.com',
                'first_name' => 'Karim',
                'last_name' => 'Bouaziz',
                'phone' => '+21626101010',
                'gender' => Gender::Male,
                'city' => 'Tunis',
                'goals' => 'Prise de masse MMA',
                'coach' => $coach1,
                'offer' => 'pack-mixte-premium',
                'weight' => 72.0,
                'height' => 180,
                'target' => 78,
                'goal' => HealthGoal::GainWeight,
            ],
            [
                'email' => 'member4@kramteam.com',
                'first_name' => 'Nadia',
                'last_name' => 'Slim',
                'phone' => '+21627101010',
                'gender' => Gender::Female,
                'city' => 'Carthage',
                'goals' => 'Fitness régulier',
                'coach' => $coach2,
                'offer' => 'illimite-1-mois',
                'weight' => 58.5,
                'height' => 168,
                'target' => 58,
                'goal' => HealthGoal::Maintain,
            ],
            [
                'email' => 'member5@kramteam.com',
                'first_name' => 'Omar',
                'last_name' => 'Jebali',
                'phone' => '+21628101010',
                'gender' => Gender::Male,
                'city' => 'Ariana',
                'goals' => 'Préparation combat',
                'coach' => $coach1,
                'offer' => 'pack-20h-coaching',
                'weight' => 79.0,
                'height' => 175,
                'target' => 75,
                'goal' => HealthGoal::Recomposition,
            ],
        ];

        $members = [];
        foreach ($membersData as $data) {
            $user = $this->user(
                $data['email'],
                $data['first_name'],
                $data['last_name'],
                $data['phone'],
                [UserRole::Member],
            );

            $member = Member::query()->firstOrCreate(
                ['user_id' => $user->id],
                [
                    'date_of_birth' => now()->subYears(fake()->numberBetween(20, 38))->subDays(fake()->numberBetween(0, 300)),
                    'gender' => $data['gender'],
                    'city' => $data['city'],
                    'address' => 'Avenue Habib Bourguiba',
                    'goals' => $data['goals'],
                    'coach_id' => $data['coach']->id,
                    'eco_points' => fake()->numberBetween(20, 280),
                    'green_score' => fake()->numberBetween(10, 90),
                    'green_level' => fake()->numberBetween(1, 3),
                    'medical_certificate_expires_at' => now()->addMonths(6),
                    'is_active' => true,
                ]
            );

            $member->update([
                'coach_id' => $data['coach']->id,
                'is_active' => true,
            ]);

            $members[] = ['model' => $member, 'meta' => $data];
        }

        $subscriptionService = app(SubscriptionService::class);
        $recordedBy = $reception->id;

        foreach ($members as $row) {
            $member = $row['model'];
            $meta = $row['meta'];
            $offer = Offer::query()->where('slug', $meta['offer'])->first();

            if (! $offer) {
                continue;
            }

            if (! $subscriptionService->getActiveForMember($member)) {
                $subscription = $subscriptionService->create(
                    $member,
                    $offer->load('quotas'),
                    $reception,
                    (float) $offer->price,
                    now()->subDays(5),
                    'Abonnement démo seed'
                );

                Payment::query()->firstOrCreate(
                    ['reference' => 'DEMO-PAY-'.$member->id],
                    [
                        'member_id' => $member->id,
                        'subscription_id' => $subscription->id,
                        'type' => PaymentType::Subscription,
                        'method' => fake()->randomElement([PaymentMethod::Cash, PaymentMethod::Card, PaymentMethod::Transfer]),
                        'status' => PaymentStatus::Completed,
                        'amount' => $subscription->price_paid,
                        'currency' => 'TND',
                        'paid_at' => now()->subDays(5),
                        'notes' => 'Paiement démo',
                        'recorded_by' => $recordedBy,
                    ]
                );
            }

            $this->seedHealth($member, $meta, $admin ?? $reception);
        }

        $this->seedScheduleAndBookings($coach1, $coach2, collect($members)->pluck('model'), $admin ?? $reception);

        $this->command?->info('Comptes démo prêts (mot de passe: password)');
        $this->command?->table(
            ['Rôle', 'Email'],
            [
                ['Admin', 'admin@kramteam.com'],
                ['Gestionnaire', 'reception@kramteam.com'],
                ['Coach 1', 'coach@kramteam.com'],
                ['Coach 2', 'coach2@kramteam.com'],
                ['Adhérent 1', 'member@kramteam.com'],
                ['Adhérent 2', 'member2@kramteam.com'],
                ['Adhérent 3', 'member3@kramteam.com'],
                ['Adhérent 4', 'member4@kramteam.com'],
                ['Adhérent 5', 'member5@kramteam.com'],
            ]
        );
    }

    /**
     * @param  list<UserRole>  $roles
     */
    private function user(string $email, string $first, string $last, string $phone, array $roles): User
    {
        $user = User::query()->firstOrCreate(
            ['email' => $email],
            [
                'first_name' => $first,
                'last_name' => $last,
                'phone' => $phone,
                'password' => 'password',
                'is_active' => true,
            ]
        );

        $user->forceFill([
            'first_name' => $first,
            'last_name' => $last,
            'phone' => $phone,
            'is_active' => true,
            'hourly_rate' => collect($roles)->contains(UserRole::Coach) ? ($email === 'coach2@kramteam.com' ? 40 : 35) : null,
            'currency' => 'TND',
        ])->save();

        $user->syncRoles($roles);

        return $user->fresh();
    }

    /**
     * @param  array<string, mixed>  $meta
     */
    private function seedHealth(Member $member, array $meta, User $actor): void
    {
        $profile = MemberHealthProfile::query()->firstOrCreate(
            ['member_id' => $member->id],
            [
                'height_cm' => $meta['height'],
                'goal' => $meta['goal'],
                'start_weight_kg' => $meta['weight'] + 2.5,
                'target_weight_kg' => $meta['target'],
                'target_date' => now()->addMonths(3)->toDateString(),
                'activity_level' => 4,
                'notes' => 'Profil santé démo',
            ]
        );

        if (MemberHealthEntry::query()->where('member_id', $member->id)->exists()) {
            return;
        }

        $start = (float) $profile->start_weight_kg;
        $current = (float) $meta['weight'];

        foreach ([21, 14, 7, 0] as $daysAgo) {
            $progress = 1 - ($daysAgo / 21);
            $weight = round($start + (($current - $start) * $progress), 1);

            MemberHealthEntry::query()->create([
                'member_id' => $member->id,
                'recorded_at' => now()->subDays($daysAgo)->setTime(8, 30),
                'weight_kg' => $weight,
                'height_cm' => $meta['height'],
                'body_fat_percent' => fake()->randomFloat(1, 12, 28),
                'waist_cm' => fake()->randomFloat(1, 70, 98),
                'notes' => $daysAgo === 0 ? 'Dernière mesure' : null,
                'recorded_by' => $actor->id,
            ]);
        }
    }

    /**
     * @param  \Illuminate\Support\Collection<int, Member>  $members
     */
    private function seedScheduleAndBookings(User $coach1, User $coach2, $members, User $createdBy): void
    {
        $ring = Room::query()->where('slug', 'ring-principal')->first();
        $dojo = Room::query()->where('slug', 'dojo-mma')->first();
        $cardio = Room::query()->where('slug', 'salle-cardio')->first();

        $kickboxing = Course::query()->where('slug', 'kickboxing')->first();
        $mma = Course::query()->where('slug', 'mma-technique')->first();
        $crossfit = Course::query()->where('slug', 'crossfit')->first();
        $fitness = Course::query()->where('slug', 'fitness')->first();

        $plan = [
            ['coach' => $coach1, 'course' => $kickboxing, 'room' => $ring, 'days' => -6, 'hour' => 18, 'cap' => 15],
            ['coach' => $coach1, 'course' => $mma, 'room' => $dojo, 'days' => -4, 'hour' => 20, 'cap' => 10],
            ['coach' => $coach2, 'course' => $crossfit, 'room' => $cardio, 'days' => -3, 'hour' => 9, 'cap' => 18],
            ['coach' => $coach2, 'course' => $fitness, 'room' => $cardio, 'days' => -1, 'hour' => 17, 'cap' => 20],
            ['coach' => $coach1, 'course' => $kickboxing, 'room' => $ring, 'days' => 1, 'hour' => 18, 'cap' => 15],
            ['coach' => $coach1, 'course' => $mma, 'room' => $dojo, 'days' => 2, 'hour' => 20, 'cap' => 10],
            ['coach' => $coach2, 'course' => $crossfit, 'room' => $cardio, 'days' => 3, 'hour' => 9, 'cap' => 18],
            ['coach' => $coach2, 'course' => $fitness, 'room' => $cardio, 'days' => 4, 'hour' => 17, 'cap' => 16],
            ['coach' => $coach1, 'course' => $kickboxing, 'room' => $ring, 'days' => 5, 'hour' => 19, 'cap' => 12],
        ];

        $memberList = $members->values();
        $slots = [];

        foreach ($plan as $row) {
            if (! $row['course']) {
                continue;
            }

            $startsAt = now()->addDays($row['days'])->setTime($row['hour'], 0)->seconds(0);
            $endsAt = $startsAt->copy()->addMinutes($row['course']->default_duration_minutes);
            $isPast = $startsAt->isPast();

            $slot = ScheduleSlot::query()->firstOrCreate(
                [
                    'course_id' => $row['course']->id,
                    'coach_id' => $row['coach']->id,
                    'starts_at' => $startsAt,
                ],
                [
                    'room_id' => $row['room']?->id,
                    'ends_at' => $endsAt,
                    'capacity' => min($row['cap'], $row['room']?->capacity ?? $row['cap']),
                    'level' => $row['course']->level,
                    'status' => $isPast ? SlotStatus::Completed : SlotStatus::Open,
                    'booked_count' => 0,
                    'waitlist_count' => 0,
                ]
            );

            $slots[] = $slot;
        }

        foreach ($slots as $index => $slot) {
            $take = min(3, $memberList->count());
            $picked = $memberList->slice($index % max(1, $memberList->count() - $take + 1), $take);

            if ($picked->isEmpty()) {
                $picked = $memberList->take(2);
            }

            foreach ($picked as $member) {
                $booking = Booking::query()->firstOrCreate(
                    [
                        'schedule_slot_id' => $slot->id,
                        'member_id' => $member->id,
                    ],
                    [
                        'status' => $slot->starts_at->isPast()
                            ? BookingStatus::Attended
                            : BookingStatus::Confirmed,
                        'booked_at' => $slot->starts_at->copy()->subDays(1),
                        'created_by' => $createdBy->id,
                        'notes' => 'Réservation démo',
                        'qr_code' => (string) Str::uuid(),
                    ]
                );

                if ($booking->wasRecentlyCreated || $booking->status !== BookingStatus::Cancelled) {
                    // recount below
                }
            }

            $confirmed = Booking::query()
                ->where('schedule_slot_id', $slot->id)
                ->whereIn('status', [BookingStatus::Confirmed, BookingStatus::Attended])
                ->count();

            $slot->update([
                'booked_count' => $confirmed,
                'status' => $slot->starts_at->isPast()
                    ? SlotStatus::Completed
                    : ($confirmed >= $slot->capacity ? SlotStatus::Full : SlotStatus::Open),
            ]);
        }
    }
}
