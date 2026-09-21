<?php

namespace Database\Seeders;

use App\Modules\Core\Enums\UserRole;
use App\Modules\Schedule\Enums\CourseLevel;
use App\Modules\Schedule\Models\Course;
use App\Modules\Schedule\Models\Room;
use App\Modules\Schedule\Models\ScheduleSlot;
use App\Modules\Users\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $rooms = [
            ['name' => 'Ring Principal', 'capacity' => 20],
            ['name' => 'Salle Cardio', 'capacity' => 25],
            ['name' => 'Dojo MMA', 'capacity' => 12],
        ];

        foreach ($rooms as $room) {
            Room::query()->firstOrCreate(
                ['slug' => Str::slug($room['name'])],
                [
                    'name' => $room['name'],
                    'capacity' => $room['capacity'],
                    'is_active' => true,
                ]
            );
        }

        $courses = [
            [
                'name' => 'Kickboxing',
                'activity_type' => 'kickboxing',
                'level' => CourseLevel::All,
                'default_duration_minutes' => 60,
                'default_capacity' => 15,
            ],
            [
                'name' => 'MMA Technique',
                'activity_type' => 'mma',
                'level' => CourseLevel::Intermediate,
                'default_duration_minutes' => 90,
                'default_capacity' => 10,
            ],
            [
                'name' => 'CrossFit',
                'activity_type' => 'crossfit',
                'level' => CourseLevel::All,
                'default_duration_minutes' => 45,
                'default_capacity' => 18,
            ],
            [
                'name' => 'Fitness',
                'activity_type' => 'fitness',
                'level' => CourseLevel::Beginner,
                'default_duration_minutes' => 50,
                'default_capacity' => 20,
            ],
        ];

        foreach ($courses as $course) {
            Course::query()->firstOrCreate(
                ['slug' => Str::slug($course['name'])],
                [
                    ...$course,
                    'requires_booking' => true,
                    'is_active' => true,
                ]
            );
        }

        $coach = User::query()->where('email', 'coach@kramteam.com')->first()
            ?? User::query()->where('email', 'admin@kramteam.com')->first()
            ?? User::query()->first();

        if (! $coach) {
            return;
        }

        if (! $coach->hasRole(UserRole::Coach) && ! $coach->hasRole(UserRole::Admin)) {
            $coach->assignRole(UserRole::Coach);
        }

        $ring = Room::query()->where('slug', 'ring-principal')->first();
        $dojo = Room::query()->where('slug', 'dojo-mma')->first();
        $cardio = Room::query()->where('slug', 'salle-cardio')->first();

        $kickboxing = Course::query()->where('slug', 'kickboxing')->first();
        $mma = Course::query()->where('slug', 'mma-technique')->first();
        $crossfit = Course::query()->where('slug', 'crossfit')->first();

        $slots = [
            [
                'course' => $kickboxing,
                'room' => $ring,
                'starts_at' => now()->addDay()->setTime(18, 0),
                'capacity' => 15,
            ],
            [
                'course' => $kickboxing,
                'room' => $ring,
                'starts_at' => now()->addDays(2)->setTime(19, 0),
                'capacity' => 12,
            ],
            [
                'course' => $mma,
                'room' => $dojo,
                'starts_at' => now()->addDays(1)->setTime(20, 0),
                'capacity' => 10,
            ],
            [
                'course' => $crossfit,
                'room' => $cardio,
                'starts_at' => now()->addDays(3)->setTime(9, 0),
                'capacity' => 18,
            ],
        ];

        foreach ($slots as $data) {
            if (! $data['course']) {
                continue;
            }

            $startsAt = $data['starts_at'];
            $endsAt = $startsAt->copy()->addMinutes($data['course']->default_duration_minutes);

            ScheduleSlot::query()->firstOrCreate(
                [
                    'course_id' => $data['course']->id,
                    'coach_id' => $coach->id,
                    'starts_at' => $startsAt,
                ],
                [
                    'room_id' => $data['room']?->id,
                    'ends_at' => $endsAt,
                    'capacity' => min($data['capacity'], $data['room']?->capacity ?? $data['capacity']),
                    'level' => $data['course']->level,
                    'status' => 'open',
                ]
            );
        }
    }
}
