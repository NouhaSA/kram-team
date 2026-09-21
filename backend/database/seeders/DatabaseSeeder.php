<?php

namespace Database\Seeders;

use App\Modules\Core\Enums\UserRole;
use App\Modules\Members\Models\Member;
use App\Modules\Users\Models\Permission;
use App\Modules\Users\Models\Role;
use App\Modules\Users\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedRolesAndPermissions();
        $this->seedAdminUser();
        $this->call([
            OfferSeeder::class,
            ScheduleSeeder::class,
            GreenRewardsSeeder::class,
            DemoDataSeeder::class,
        ]);
    }

    private function seedRolesAndPermissions(): void
    {
        $permissions = [
            ['name' => 'Voir adhérents', 'slug' => 'members.view', 'module' => 'Members'],
            ['name' => 'Créer adhérents', 'slug' => 'members.create', 'module' => 'Members'],
            ['name' => 'Modifier adhérents', 'slug' => 'members.update', 'module' => 'Members'],
            ['name' => 'Gérer offres', 'slug' => 'offers.manage', 'module' => 'Offers'],
            ['name' => 'Gérer abonnements', 'slug' => 'subscriptions.manage', 'module' => 'Subscriptions'],
            ['name' => 'Gérer paiements', 'slug' => 'payments.manage', 'module' => 'Payments'],
            ['name' => 'Voir notifications', 'slug' => 'notifications.view', 'module' => 'Notifications'],
            ['name' => 'Check-in QR', 'slug' => 'attendance.checkin', 'module' => 'Attendance'],
            ['name' => 'Dashboard admin', 'slug' => 'dashboard.admin', 'module' => 'Dashboard'],
        ];

        foreach ($permissions as $permission) {
            Permission::query()->firstOrCreate(
                ['slug' => $permission['slug']],
                $permission
            );
        }

        $rolePermissions = [
            UserRole::Admin->value => Permission::query()->pluck('slug')->all(),
            UserRole::Reception->value => [
                'members.view', 'members.create', 'members.update',
                'attendance.checkin', 'subscriptions.manage', 'payments.manage',
            ],
            UserRole::Coach->value => [
                'members.view', 'members.update', 'attendance.checkin',
            ],
            UserRole::Member->value => [],
        ];

        foreach (UserRole::cases() as $roleEnum) {
            $role = Role::query()->updateOrCreate(
                ['slug' => $roleEnum->value],
                [
                    'name' => $roleEnum->label(),
                    'description' => "Rôle {$roleEnum->label()}",
                ]
            );

            $slugs = $rolePermissions[$roleEnum->value];
            $permissionIds = Permission::query()->whereIn('slug', $slugs)->pluck('id');
            $role->permissions()->sync($permissionIds);
        }
    }

    private function seedAdminUser(): void
    {
        $admin = User::query()->firstOrCreate(
            ['email' => 'admin@kramteam.com'],
            [
                'first_name' => 'Admin',
                'last_name' => 'Kram Team',
                'phone' => '+21600000000',
                'password' => 'password',
                'is_active' => true,
            ]
        );

        $admin->syncRoles([UserRole::Admin]);

        Member::query()->firstOrCreate(
            ['user_id' => $admin->id],
            ['is_active' => true]
        );
    }
}
