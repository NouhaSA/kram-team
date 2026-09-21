<?php

namespace App\Modules\Attendance\Services;

use App\Modules\Attendance\Enums\AttendanceStatus;
use App\Modules\Attendance\Enums\AttendanceType;
use App\Modules\Attendance\Models\Attendance;
use App\Modules\Members\Models\Member;
use App\Modules\QRSystem\Services\QRCodeService;
use App\Modules\Quotas\Enums\QuotaTransactionType;
use App\Modules\Quotas\Enums\QuotaType;
use App\Modules\Quotas\Services\QuotaService;
use App\Modules\Users\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AttendanceService
{
    public function __construct(
        private readonly QRCodeService $qrCodeService,
        private readonly QuotaService $quotaService,
    ) {}

    public function paginate(?int $memberId = null, int $perPage = 20): LengthAwarePaginator
    {
        return Attendance::query()
            ->with(['member.user', 'subscription.offer', 'scannedBy'])
            ->when($memberId, fn ($q) => $q->where('member_id', $memberId))
            ->latest()
            ->paginate($perPage);
    }

    /**
     * @param  array<string, mixed>  $metadata
     * @return array{attendance: Attendance, member: Member, access: array<string, mixed>}
     */
    public function checkIn(string $qrUuid, User $scannedBy, ?string $activityType = null, array $metadata = []): array
    {
        $member = $this->qrCodeService->findMemberByQr($qrUuid);
        $access = $this->qrCodeService->verifyAccess($member, $activityType);

        if (! $access['allowed']) {
            $attendance = Attendance::query()->create([
                'member_id' => $member->id,
                'subscription_id' => $access['subscription']?->id,
                'type' => AttendanceType::CheckIn,
                'status' => ($access['duplicate'] ?? false)
                    ? AttendanceStatus::Duplicate
                    : AttendanceStatus::Denied,
                'qr_uuid' => $qrUuid,
                'activity_type' => $activityType,
                'denial_reason' => $access['reason'],
                'scanned_by' => $scannedBy->id,
                'metadata' => $metadata,
            ]);

            throw ValidationException::withMessages([
                'qr_uuid' => [$access['reason']],
            ])->errorBag('default');
        }

        return DB::transaction(function () use ($member, $access, $qrUuid, $scannedBy, $activityType, $metadata) {
            $subscription = $access['subscription'];
            $quota = $access['quota'];

            if ($quota && $quota->quota_type === QuotaType::Sessions && ! $quota->isUnlimited()) {
                $this->quotaService->consume(
                    $quota,
                    1,
                    QuotaTransactionType::CheckIn,
                    $scannedBy,
                    'Check-in QR',
                );
            }

            $attendance = Attendance::query()->create([
                'member_id' => $member->id,
                'subscription_id' => $subscription->id,
                'subscription_quota_id' => $quota?->id,
                'type' => AttendanceType::CheckIn,
                'status' => AttendanceStatus::Success,
                'qr_uuid' => $qrUuid,
                'checked_in_at' => now(),
                'activity_type' => $activityType ?? $quota?->activity_type,
                'scanned_by' => $scannedBy->id,
                'metadata' => $metadata,
            ]);

            return [
                'attendance' => $attendance->load(['member.user', 'subscription.offer']),
                'member' => $member->load('user'),
                'access' => $access,
            ];
        });
    }

    /**
     * @param  array<string, mixed>  $metadata
     */
    public function checkOut(string $qrUuid, User $scannedBy, array $metadata = []): Attendance
    {
        $member = $this->qrCodeService->findMemberByQr($qrUuid);
        $openSession = $this->qrCodeService->getOpenSession($member);

        if (! $openSession) {
            throw ValidationException::withMessages([
                'qr_uuid' => ['Aucune session ouverte pour cet adhérent.'],
            ]);
        }

        return DB::transaction(function () use ($openSession, $scannedBy, $metadata) {
            $checkedOutAt = now();
            $durationMinutes = (int) $openSession->checked_in_at->diffInMinutes($checkedOutAt);

            $openSession->update([
                'checked_out_at' => $checkedOutAt,
                'duration_minutes' => $durationMinutes,
                'metadata' => array_merge($openSession->metadata ?? [], $metadata),
            ]);

            if ($openSession->subscription_quota_id) {
                $quota = $openSession->subscriptionQuota;

                if ($quota && $quota->quota_type === QuotaType::Hours) {
                    $hoursToDeduct = max(1, (int) ceil($durationMinutes / 60));

                    $this->quotaService->consume(
                        $quota,
                        $hoursToDeduct,
                        QuotaTransactionType::CheckOut,
                        $scannedBy,
                        "Check-out — {$durationMinutes} min",
                        Attendance::class,
                        $openSession->id,
                    );
                }
            }

            return $openSession->fresh(['member.user', 'subscription.offer', 'scannedBy']);
        });
    }

    public function verifyQr(string $qrUuid, ?string $activityType = null): array
    {
        $member = $this->qrCodeService->findMemberByQr($qrUuid);
        $member->load('user');
        $openSession = $this->qrCodeService->getOpenSession($member);

        if ($openSession) {
            return [
                'member' => [
                    'id' => $member->id,
                    'full_name' => $member->user->full_name,
                    'qr_uuid' => $member->qr_uuid,
                    'photo' => $member->user->avatar,
                ],
                'access' => [
                    'allowed' => false,
                    'reason' => 'Session ouverte — check-out requis.',
                    'has_open_session' => true,
                    'open_session_id' => $openSession->id,
                    'action' => 'check_out',
                ],
                'subscription' => null,
                'quota' => null,
            ];
        }

        $access = $this->qrCodeService->verifyAccess($member, $activityType);

        return [
            'member' => [
                'id' => $member->id,
                'full_name' => $member->user->full_name,
                'qr_uuid' => $member->qr_uuid,
                'photo' => $member->user->avatar,
            ],
            'access' => [
                'allowed' => $access['allowed'],
                'reason' => $access['reason'] ?? null,
                'has_open_session' => false,
                'open_session_id' => null,
                'action' => $access['allowed'] ? 'check_in' : null,
            ],
            'subscription' => $access['subscription'] ? [
                'id' => $access['subscription']->id,
                'offer' => $access['subscription']->offer?->name,
                'ends_at' => $access['subscription']->ends_at?->toIso8601String(),
            ] : null,
            'quota' => $access['quota'] ? $this->quotaService->formatQuotaBalance($access['quota']) : null,
        ];
    }
}
