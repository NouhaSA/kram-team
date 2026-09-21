<?php

namespace App\Modules\Attendance\Http\Controllers;

use App\Modules\Attendance\Http\Requests\ScanQrRequest;
use App\Modules\Attendance\Http\Resources\AttendanceResource;
use App\Modules\Attendance\Models\Attendance;
use App\Modules\Attendance\Services\AttendanceService;
use App\Modules\Core\Http\Controllers\ApiController;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends ApiController
{
    public function __construct(
        private readonly AttendanceService $attendanceService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Attendance::class);

        $attendances = $this->attendanceService->paginate(
            memberId: $request->integer('member_id') ?: null,
            perPage: $request->integer('per_page', 20)
        );

        return $this->success(AttendanceResource::collection($attendances));
    }

    public function verify(ScanQrRequest $request): JsonResponse
    {
        $this->authorize('checkIn', Attendance::class);

        $result = $this->attendanceService->verifyQr(
            $request->validated('qr_uuid'),
            $request->validated('activity_type')
        );

        return $this->success($result);
    }

    public function checkIn(ScanQrRequest $request): JsonResponse
    {
        $this->authorize('checkIn', Attendance::class);

        try {
            $result = $this->attendanceService->checkIn(
                $request->validated('qr_uuid'),
                $request->user(),
                $request->validated('activity_type'),
                ['ip' => $request->ip(), 'user_agent' => $request->userAgent()]
            );
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error(
                $e->getMessage() ?: 'Accès refusé.',
                422,
                $e->errors()
            );
        }

        return $this->success([
            'attendance' => new AttendanceResource($result['attendance']),
            'member' => [
                'id' => $result['member']->id,
                'full_name' => $result['member']->user->full_name,
            ],
        ], 'Check-in réussi.', 201);
    }

    public function checkOut(ScanQrRequest $request): JsonResponse
    {
        $this->authorize('checkIn', Attendance::class);

        $attendance = $this->attendanceService->checkOut(
            $request->validated('qr_uuid'),
            $request->user(),
            ['ip' => $request->ip(), 'user_agent' => $request->userAgent()]
        );

        return $this->success(
            new AttendanceResource($attendance),
            'Check-out réussi.'
        );
    }
}
