<?php

namespace App\Modules\Schedule\Http\Controllers;

use App\Modules\Core\Http\Controllers\ApiController;
use App\Modules\Schedule\Http\Requests\StoreCourseRequest;
use App\Modules\Schedule\Http\Requests\StoreSlotRequest;
use App\Modules\Schedule\Http\Requests\UpdateSlotRequest;
use App\Modules\Schedule\Http\Resources\CourseResource;
use App\Modules\Schedule\Http\Resources\ScheduleSlotResource;
use App\Modules\Schedule\Models\ScheduleSlot;
use App\Modules\Schedule\Services\ScheduleService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScheduleController extends ApiController
{
    public function __construct(
        private readonly ScheduleService $scheduleService
    ) {}

    public function publicCourses(Request $request): JsonResponse
    {
        $courses = $this->scheduleService->paginateCourses(
            activeOnly: true,
            perPage: $request->integer('per_page', 50)
        );

        return $this->success(CourseResource::collection($courses));
    }

    public function publicSlots(Request $request): JsonResponse
    {
        $from = $request->filled('from')
            ? Carbon::parse($request->string('from'))
            : now()->startOfDay();
        $to = $request->filled('to')
            ? Carbon::parse($request->string('to'))
            : now()->addDays(14)->endOfDay();

        $slots = $this->scheduleService->paginateSlots(
            from: $from,
            to: $to,
            courseId: $request->integer('course_id') ?: null,
            coachId: null,
            perPage: $request->integer('per_page', 100)
        );

        return $this->success(ScheduleSlotResource::collection($slots));
    }

    public function courses(Request $request): JsonResponse
    {
        $courses = $this->scheduleService->paginateCourses(
            activeOnly: $request->boolean('active_only', true),
            perPage: $request->integer('per_page', 20)
        );

        return $this->success(CourseResource::collection($courses));
    }

    public function storeCourse(StoreCourseRequest $request): JsonResponse
    {
        $course = $this->scheduleService->createCourse($request->validated());

        return $this->success(new CourseResource($course), 'Cours créé.', 201);
    }

    public function rooms(): JsonResponse
    {
        return $this->success($this->scheduleService->paginateRooms());
    }

    public function storeRoom(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'capacity' => ['required', 'integer', 'min:1', 'max:500'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ]);

        $room = $this->scheduleService->createRoom($validated);

        return $this->success($room, 'Salle créée.', 201);
    }

    public function slots(Request $request): JsonResponse
    {
        $slots = $this->scheduleService->paginateSlots(
            from: $request->filled('from') ? Carbon::parse($request->string('from')) : now()->startOfDay(),
            to: $request->filled('to') ? Carbon::parse($request->string('to')) : null,
            courseId: $request->integer('course_id') ?: null,
            coachId: $request->integer('coach_id') ?: null,
            perPage: $request->integer('per_page', 20)
        );

        return $this->success(ScheduleSlotResource::collection($slots));
    }

    public function showSlot(ScheduleSlot $scheduleSlot): JsonResponse
    {
        return $this->success(
            new ScheduleSlotResource($this->scheduleService->findSlot($scheduleSlot->id))
        );
    }

    public function storeSlot(StoreSlotRequest $request): JsonResponse
    {
        $slot = $this->scheduleService->createSlot($request->validated());

        return $this->success(new ScheduleSlotResource($slot), 'Créneau créé.', 201);
    }

    public function updateSlot(UpdateSlotRequest $request, ScheduleSlot $scheduleSlot): JsonResponse
    {
        $slot = $this->scheduleService->updateSlot($scheduleSlot, $request->validated());

        return $this->success(new ScheduleSlotResource($slot), 'Créneau mis à jour.');
    }

    public function cancelSlot(Request $request, ScheduleSlot $scheduleSlot): JsonResponse
    {
        $slot = $this->scheduleService->cancelSlot($scheduleSlot, $request->input('notes'));

        return $this->success(new ScheduleSlotResource($slot), 'Créneau annulé.');
    }
}
