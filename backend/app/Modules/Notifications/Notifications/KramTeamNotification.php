<?php

namespace App\Modules\Notifications\Notifications;

use App\Modules\Notifications\Enums\NotificationCategory;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class KramTeamNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $title,
        public string $body,
        public NotificationCategory $category = NotificationCategory::System,
        public array $meta = [],
        public bool $sendMail = true,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        $channels = ['database'];

        if ($this->sendMail && filled($notifiable->email ?? null)) {
            $channels[] = 'mail';
        }

        return $channels;
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('[Kram Team] '.$this->title)
            ->greeting('Bonjour '.($notifiable->first_name ?? '').',')
            ->line($this->body)
            ->line('— Kram Team · Force & Honor');
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'body' => $this->body,
            'category' => $this->category->value,
            'category_label' => $this->category->label(),
            'meta' => $this->meta,
        ];
    }
}
