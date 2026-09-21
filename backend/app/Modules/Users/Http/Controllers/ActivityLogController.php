<?php

namespace App\Modules\Users\Http\Controllers;

use App\Modules\Core\Http\Controllers\ApiController;
use App\Modules\Users\Models\ActivityLog;
use App\Modules\Users\Models\User;
use App\Modules\Users\Services\ActivityLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends ApiController
{
    public function __construct(
        private readonly ActivityLogger $logger
    ) {}

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['nullable', 'string', 'in:admin,reception,coach,member'],
            'action' => ['nullable', 'string', 'max:100'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $items = $this->logger->paginate(
            role: $validated['role'] ?? null,
            action: $validated['action'] ?? null,
            userId: isset($validated['user_id']) ? (int) $validated['user_id'] : null,
            perPage: $validated['per_page'] ?? 40,
        );

        $payload = $items->through(fn (ActivityLog $log) => [
            'id' => $log->id,
            'action' => $log->action,
            'description' => $log->description,
            'actor_role' => $log->actor_role,
            'actor_role_label' => match ($log->actor_role) {
                'admin' => 'Admin',
                'reception' => 'Gestionnaire',
                'coach' => 'Coach',
                'member' => 'Adhérent',
                default => $log->actor_role ?? '—',
            },
            'user' => $log->user ? [
                'id' => $log->user->id,
                'full_name' => $log->user->full_name,
                'email' => $log->user->email,
            ] : null,
            'meta' => $log->meta,
            'created_at' => $log->created_at?->toIso8601String(),
        ]);

        return $this->success($payload);
    }

    public function accounts(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['nullable', 'string', 'in:admin,reception,coach,member'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $role = $validated['role'] ?? null;

        $users = User::query()
            ->with(['roles', 'member'])
            ->when($role, fn ($q) => $q->whereHas('roles', fn ($r) => $r->where('slug', $role)))
            ->orderBy('last_name')
            ->paginate($validated['per_page'] ?? 50);

        $payload = $users->through(fn (User $u) => [
            'id' => $u->id,
            'full_name' => $u->full_name,
            'email' => $u->email,
            'phone' => $u->phone,
            'is_active' => $u->is_active,
            'roles' => $u->roles->pluck('slug'),
            'member_id' => $u->member?->id,
            'created_at' => $u->created_at?->toIso8601String(),
        ]);

        return $this->success($payload);
    }

    public function toggleAccount(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return $this->error('Tu ne peux pas désactiver ton propre compte.', 422);
        }

        if ($user->hasRole('admin') && ! $request->user()->hasRole('admin')) {
            return $this->error('Impossible de modifier un admin.', 403);
        }

        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $user->update(['is_active' => $validated['is_active']]);

        app(ActivityLogger::class)->log(
            'account.toggle',
            ($validated['is_active'] ? 'Activation' : 'Désactivation').' du compte '.$user->full_name,
            $user,
            ['is_active' => $validated['is_active'], 'email' => $user->email],
            $request->user()
        );

        return $this->success([
            'id' => $user->id,
            'is_active' => $user->is_active,
            'full_name' => $user->full_name,
            'email' => $user->email,
        ], $validated['is_active'] ? 'Compte activé.' : 'Compte désactivé.');
    }
}
