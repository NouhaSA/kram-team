<?php

namespace App\Modules\Members\Http\Controllers;

use App\Modules\Core\Http\Controllers\ApiController;
use App\Modules\Members\Http\Requests\StoreMemberRequest;
use App\Modules\Members\Http\Requests\UpdateMemberRequest;
use App\Modules\Members\Http\Resources\MemberResource;
use App\Modules\Members\Models\Member;
use App\Modules\Members\Services\MemberService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberController extends ApiController
{
    public function __construct(
        private readonly MemberService $memberService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Member::class);
        $members = $this->memberService->paginate(
            $request->integer('per_page', 15)
        );

        return $this->success(MemberResource::collection($members));
    }

    public function store(StoreMemberRequest $request): JsonResponse
    {
        $this->authorize('create', Member::class);
        $validated = $request->validated();

        $member = $this->memberService->create(
            [
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => $validated['password'],
                'is_active' => true,
            ],
            collect($validated)->except([
                'first_name', 'last_name', 'email', 'phone', 'password',
            ])->all()
        );

        return $this->success(
            new MemberResource($member),
            'Adhérent créé avec succès.',
            201
        );
    }

    public function show(Member $member): JsonResponse
    {
        $this->authorize('view', $member);
        return $this->success(
            new MemberResource($this->memberService->find($member->id))
        );
    }

    public function update(UpdateMemberRequest $request, Member $member): JsonResponse
    {
        $this->authorize('update', $member);
        $validated = $request->validated();

        $userFields = collect($validated)->only([
            'first_name', 'last_name', 'email', 'phone',
        ])->filter()->all();

        $memberFields = collect($validated)->except([
            'first_name', 'last_name', 'email', 'phone',
        ])->all();

        $updated = $this->memberService->update($member, $userFields, $memberFields);

        return $this->success(
            new MemberResource($updated),
            'Adhérent mis à jour.'
        );
    }
}
