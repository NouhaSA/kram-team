<?php

namespace App\Modules\Members\Services;

use App\Modules\Members\Models\Member;
use App\Modules\Users\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MemberService
{
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Member::query()
            ->with(['user', 'coach'])
            ->latest()
            ->paginate($perPage);
    }

    public function find(int $id): Member
    {
        return Member::query()
            ->with(['user.roles', 'coach'])
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $userData
     * @param  array<string, mixed>  $memberData
     */
    public function create(array $userData, array $memberData): Member
    {
        return DB::transaction(function () use ($userData, $memberData) {
            $user = User::query()->create($userData);
            $user->assignRole('member');

            return Member::query()->create([
                ...$memberData,
                'user_id' => $user->id,
            ])->load(['user', 'coach']);
        });
    }

    /**
     * @param  array<string, mixed>  $userData
     * @param  array<string, mixed>  $memberData
     */
    public function update(Member $member, array $userData, array $memberData): Member
    {
        return DB::transaction(function () use ($member, $userData, $memberData) {
            $member->user->update($userData);
            $member->update($memberData);

            return $member->fresh(['user.roles', 'coach']);
        });
    }
}
