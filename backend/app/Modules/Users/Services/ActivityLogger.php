<?php

namespace App\Modules\Users\Services;

use App\Modules\Users\Models\ActivityLog;
use App\Modules\Users\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;

class ActivityLogger
{
    public function log(
        string $action,
        string $description,
        mixed $subject = null,
        ?array $meta = null,
        ?User $actor = null,
    ): ActivityLog {
        $actor ??= Auth::user();

        $role = null;
        if ($actor) {
            $actor->loadMissing('roles');
            $slugs = $actor->roles->pluck('slug');
            foreach (['admin', 'reception', 'coach', 'member'] as $preferred) {
                if ($slugs->contains($preferred)) {
                    $role = $preferred;
                    break;
                }
            }
        }

        return ActivityLog::query()->create([
            'user_id' => $actor?->id,
            'actor_role' => $role,
            'action' => $action,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id' => $subject?->id,
            'description' => $description,
            'meta' => $meta,
        ]);
    }

    public function paginate(
        ?string $role = null,
        ?string $action = null,
        ?int $userId = null,
        int $perPage = 40,
    ): LengthAwarePaginator {
        return ActivityLog::query()
            ->with('user.roles')
            ->when($role, fn ($q) => $q->where('actor_role', $role))
            ->when($action, fn ($q) => $q->where('action', 'like', "%{$action}%"))
            ->when($userId, fn ($q) => $q->where('user_id', $userId))
            ->latest('id')
            ->paginate($perPage);
    }
}
