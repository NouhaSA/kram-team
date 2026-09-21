<?php

namespace App\Modules\Notifications\Http\Controllers;

use App\Modules\Core\Http\Controllers\ApiController;
use App\Modules\Notifications\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends ApiController
{
    public function __construct(
        private readonly NotificationService $notificationService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $notifications = $this->notificationService->paginateForUser(
            $request->user(),
            $request->integer('per_page', 20),
            $request->boolean('unread_only')
        );

        return $this->success([
            'unread_count' => $this->notificationService->unreadCount($request->user()),
            'notifications' => $notifications,
        ]);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return $this->success([
            'unread_count' => $this->notificationService->unreadCount($request->user()),
        ]);
    }

    public function markAsRead(Request $request, string $notification): JsonResponse
    {
        $item = $this->notificationService->markAsRead($request->user(), $notification);

        return $this->success($item, 'Notification lue.');
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $count = $this->notificationService->markAllAsRead($request->user());

        return $this->success(['marked' => $count], 'Toutes les notifications ont été lues.');
    }
}
