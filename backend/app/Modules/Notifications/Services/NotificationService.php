<?php

namespace App\Modules\Notifications\Services;

use App\Modules\Notifications\Enums\NotificationCategory;
use App\Modules\Notifications\Notifications\KramTeamNotification;
use App\Modules\Users\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Support\Collection;

class NotificationService
{
    public function send(
        User $user,
        string $title,
        string $body,
        NotificationCategory $category = NotificationCategory::System,
        array $meta = [],
        bool $sendMail = true,
    ): void {
        $user->notify(new KramTeamNotification($title, $body, $category, $meta, $sendMail));
    }

    /**
     * @param  Collection<int, User>|list<User>  $users
     */
    public function sendMany(
        iterable $users,
        string $title,
        string $body,
        NotificationCategory $category = NotificationCategory::System,
        array $meta = [],
        bool $sendMail = true,
    ): void {
        foreach ($users as $user) {
            $this->send($user, $title, $body, $category, $meta, $sendMail);
        }
    }

    public function paginateForUser(User $user, int $perPage = 20, bool $unreadOnly = false): LengthAwarePaginator
    {
        return $user->notifications()
            ->when($unreadOnly, fn ($q) => $q->whereNull('read_at'))
            ->paginate($perPage);
    }

    public function unreadCount(User $user): int
    {
        return $user->unreadNotifications()->count();
    }

    public function markAsRead(User $user, string $notificationId): DatabaseNotification
    {
        $notification = $user->notifications()->where('id', $notificationId)->firstOrFail();
        $notification->markAsRead();

        return $notification;
    }

    public function markAllAsRead(User $user): int
    {
        $count = $user->unreadNotifications()->count();
        $user->unreadNotifications->markAsRead();

        return $count;
    }
}
