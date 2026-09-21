<?php

namespace App\Modules\Core\Traits;

use App\Modules\Core\Enums\UserRole;
use App\Modules\Users\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasRoles
{
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function hasRole(UserRole|string $role): bool
    {
        $slug = $role instanceof UserRole ? $role->value : $role;

        return $this->roles()->where('slug', $slug)->exists();
    }

    public function hasAnyRole(array $roles): bool
    {
        $slugs = array_map(
            fn ($role) => $role instanceof UserRole ? $role->value : $role,
            $roles
        );

        return $this->roles()->whereIn('slug', $slugs)->exists();
    }

    public function assignRole(UserRole|string $role): void
    {
        $slug = $role instanceof UserRole ? $role->value : $role;
        $roleModel = Role::query()->where('slug', $slug)->firstOrFail();

        $this->roles()->syncWithoutDetaching([$roleModel->id]);
    }

    public function syncRoles(array $roles): void
    {
        $slugs = array_map(
            fn ($role) => $role instanceof UserRole ? $role->value : $role,
            $roles
        );

        $roleIds = Role::query()->whereIn('slug', $slugs)->pluck('id');

        $this->roles()->sync($roleIds);
    }

    public function hasPermission(string $permission): bool
    {
        return $this->roles()
            ->whereHas('permissions', fn ($query) => $query->where('slug', $permission))
            ->exists();
    }
}
