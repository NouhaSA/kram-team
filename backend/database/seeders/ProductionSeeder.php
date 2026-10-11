<?php

namespace Database\Seeders;

use App\Modules\Core\Enums\UserRole;
use App\Modules\Members\Models\Member;
use App\Modules\Users\Models\User;
use RuntimeException;

/**
 * Amorcage de PRODUCTION : roles, permissions, offres et un administrateur.
 * Aucun compte de demonstration. Le mot de passe vient de l'environnement.
 *
 * Usage : ADMIN_EMAIL=... ADMIN_PASSWORD=... php artisan db:seed --class=ProductionSeeder --force
 */
class ProductionSeeder extends DatabaseSeeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (! $email || ! $password || strlen($password) < 12) {
            throw new RuntimeException(
                'ADMIN_EMAIL et ADMIN_PASSWORD (12 caracteres minimum) sont obligatoires.'
            );
        }

        $this->seedRolesAndPermissions();

        $admin = User::query()->firstOrCreate(
            ['email' => $email],
            [
                'first_name' => 'Admin',
                'last_name' => 'Kram Team',
                'password' => $password,
                'is_active' => true,
            ]
        );

        $admin->syncRoles([UserRole::Admin]);

        Member::query()->firstOrCreate(
            ['user_id' => $admin->id],
            ['is_active' => true]
        );

        $this->call([
            OfferSeeder::class,
        ]);
    }
}
