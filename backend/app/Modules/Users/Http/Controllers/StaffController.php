<?php

namespace App\Modules\Users\Http\Controllers;

use App\Modules\Core\Enums\UserRole;
use App\Modules\Core\Http\Controllers\ApiController;
use App\Modules\Users\Http\Resources\UserResource;
use App\Modules\Users\Models\User;
use App\Modules\Users\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StaffController extends ApiController
{
    private const STAFF_ROLES = ['reception', 'coach'];

    public function __construct(
        private readonly ActivityLogger $activity
    ) {}

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['nullable', 'string', Rule::in(self::STAFF_ROLES)],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $role = $validated['role'] ?? null;

        $users = User::query()
            ->with('roles')
            ->whereHas('roles', function ($q) use ($role) {
                if ($role) {
                    $q->where('slug', $role);
                } else {
                    $q->whereIn('slug', self::STAFF_ROLES);
                }
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->paginate($validated['per_page'] ?? 50);

        return $this->success(UserResource::collection($users));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', Rule::in(self::STAFF_ROLES)],
            'is_active' => ['sometimes', 'boolean'],
            'hourly_rate' => ['nullable', 'numeric', 'min:0', 'max:9999'],
            'currency' => ['nullable', 'string', 'size:3'],
        ]);

        $user = User::query()->create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'],
            'is_active' => $validated['is_active'] ?? true,
            'hourly_rate' => $validated['role'] === 'coach'
                ? ($validated['hourly_rate'] ?? 35)
                : ($validated['hourly_rate'] ?? null),
            'currency' => strtoupper($validated['currency'] ?? 'TND'),
        ]);

        $user->syncRoles([$validated['role']]);

        $this->activity->log(
            'staff.create',
            'Création compte '.($validated['role'] === 'reception' ? 'gestionnaire' : 'coach').' '.$user->full_name,
            $user,
            ['role' => $validated['role'], 'email' => $user->email],
            $request->user()
        );

        return $this->success(
            new UserResource($user->load('roles')),
            'Compte staff créé.',
            201
        );
    }

    public function update(Request $request, User $user): JsonResponse
    {
        if (! $user->hasAnyRole(self::STAFF_ROLES)) {
            return $this->error('Cet utilisateur n’est pas un compte staff (gestionnaire/coach).', 422);
        }

        $validated = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['sometimes', 'string', Rule::in(self::STAFF_ROLES)],
            'is_active' => ['sometimes', 'boolean'],
            'hourly_rate' => ['nullable', 'numeric', 'min:0', 'max:9999'],
            'currency' => ['nullable', 'string', 'size:3'],
        ]);

        $user->fill(collect($validated)->except(['password', 'role', 'currency'])->all());

        if (isset($validated['currency'])) {
            $user->currency = strtoupper($validated['currency']);
        }

        if (! empty($validated['password'])) {
            $user->password = $validated['password'];
        }

        $user->save();

        if (isset($validated['role'])) {
            $user->syncRoles([$validated['role']]);
        }

        $this->activity->log(
            'staff.update',
            'Mise à jour compte staff '.$user->full_name,
            $user,
            $validated,
            $request->user()
        );

        return $this->success(new UserResource($user->fresh()->load('roles')), 'Compte staff mis à jour.');
    }

    public function coaches(Request $request): JsonResponse
    {
        $includeAdmins = $request->boolean('include_admins', true);

        $slugs = $includeAdmins
            ? [UserRole::Coach->value, UserRole::Admin->value]
            : [UserRole::Coach->value];

        $users = User::query()
            ->with('roles')
            ->where('is_active', true)
            ->whereHas('roles', fn ($q) => $q->whereIn('slug', $slugs))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return $this->success(UserResource::collection($users));
    }
}
