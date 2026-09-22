<?php

namespace App\Console\Commands;

use App\Models\Tenant;
use App\Modules\Core\Enums\UserRole;
use App\Modules\Users\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TenantOnboardCommand extends Command
{
    protected $signature = 'tenant:onboard
        {name : Nom de la salle (tenant)}
        {admin_email : Email du compte admin de la salle}
        {admin_password : Mot de passe du compte admin}
        {admin_first_name=Admin : Prenom du compte admin}
        {admin_last_name=Salle : Nom du compte admin}';

    protected $description = 'Cree un nouveau tenant (salle) et son compte administrateur';

    public function handle(): int
    {
        $name = $this->argument('name');
        $email = $this->argument('admin_email');
        $password = $this->argument('admin_password');
        $firstName = $this->argument('admin_first_name');
        $lastName = $this->argument('admin_last_name');

        if (User::where('email', $email)->exists()) {
            $this->error("Un utilisateur avec l'email {$email} existe deja.");

            return self::FAILURE;
        }

        $tenant = Tenant::create([
            'name' => $name,
            'slug' => Str::slug($name),
            'is_active' => true,
        ]);

        $admin = User::create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password' => Hash::make($password),
            'is_active' => true,
        ]);

        $admin->tenant_id = $tenant->id;
        $admin->save();

        $admin->syncRoles([UserRole::Admin]);

        $this->info("Tenant cree : {$tenant->name} (slug: {$tenant->slug}, id: {$tenant->id})");
        $this->info("Compte admin cree : {$admin->email}");

        return self::SUCCESS;
    }
}