<?php

namespace App\Modules\QRSystem\Services;

use App\Modules\Attendance\Enums\AttendanceStatus;
use App\Modules\Attendance\Models\Attendance;
use App\Modules\Members\Models\Member;
use App\Modules\Quotas\Enums\QuotaType;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Subscriptions\Models\SubscriptionQuota;
use App\Modules\Subscriptions\Services\SubscriptionService;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class QRCodeService
{
    public function __construct(
        private readonly SubscriptionService $subscriptionService
    ) {}

    public function findMemberByQr(string $qrUuid): Member
    {
        if (! Str::isUuid($qrUuid)) {
            throw ValidationException::withMessages([
                'qr_uuid' => ['QR code invalide.'],
            ]);
        }

        $member = Member::query()
            ->with(['user', 'subscriptions'])
            ->where('qr_uuid', $qrUuid)
            ->first();

        if (! $member) {
            throw ValidationException::withMessages([
                'qr_uuid' => ['Adhérent introuvable pour ce QR code.'],
            ]);
        }

        return $member;
    }

    /**
     * @return array{allowed: bool, reason: ?string, subscription: ?Subscription, quota: ?SubscriptionQuota}
     */
    public function verifyAccess(Member $member, ?string $activityType = null): array
    {
        if (! $member->is_active) {
            return $this->denied('Compte adhérent désactivé.');
        }

        if ($member->medical_certificate_expires_at?->isPast()) {
            return $this->denied('Certificat médical expiré.');
        }

        $subscription = $this->subscriptionService->getActiveForMember($member);

        if (! $subscription) {
            return $this->denied('Aucun abonnement actif.');
        }

        if ($subscription->ends_at?->isPast()) {
            return $this->denied('Abonnement expiré.');
        }

        $openSession = $this->getOpenSession($member);

        if ($openSession) {
            return $this->denied('Session déjà ouverte. Veuillez scanner la sortie.', duplicate: true);
        }

        $quota = $this->resolveQuota($subscription, $activityType);

        if ($quota === null && ! $this->hasUnlimitedQuota($subscription)) {
            return $this->denied('Aucun quota disponible.');
        }

        if ($quota && ! $quota->isUnlimited()) {
            if ($quota->isExpired()) {
                return $this->denied('Quota expiré.');
            }

            if ($quota->quota_type === QuotaType::Sessions && $quota->remaining() < 1) {
                return $this->denied('Plus de séances disponibles.');
            }
        }

        return [
            'allowed' => true,
            'reason' => null,
            'subscription' => $subscription,
            'quota' => $quota,
        ];
    }

    public function getOpenSession(Member $member): ?Attendance
    {
        return Attendance::query()
            ->where('member_id', $member->id)
            ->where('status', AttendanceStatus::Success)
            ->whereNotNull('checked_in_at')
            ->whereNull('checked_out_at')
            ->latest('checked_in_at')
            ->first();
    }

    private function resolveQuota(Subscription $subscription, ?string $activityType): ?SubscriptionQuota
    {
        $quotas = $subscription->quotas;

        if ($activityType) {
            $matched = $quotas->first(
                fn (SubscriptionQuota $q) => $q->activity_type === $activityType
            );

            if ($matched) {
                return $matched;
            }
        }

        $sessionQuota = $quotas->first(
            fn (SubscriptionQuota $q) => $q->quota_type === QuotaType::Sessions && ($q->isUnlimited() || $q->remaining() > 0)
        );

        if ($sessionQuota) {
            return $sessionQuota;
        }

        $hourlyQuota = $quotas->first(
            fn (SubscriptionQuota $q) => $q->quota_type === QuotaType::Hours
        );

        if ($hourlyQuota) {
            return $hourlyQuota;
        }

        return $quotas->first(fn (SubscriptionQuota $q) => $q->isUnlimited());
    }

    private function hasUnlimitedQuota(Subscription $subscription): bool
    {
        return $subscription->quotas->contains(fn (SubscriptionQuota $q) => $q->isUnlimited());
    }

    private function denied(string $reason, bool $duplicate = false): array
    {
        return [
            'allowed' => false,
            'reason' => $reason,
            'duplicate' => $duplicate,
            'subscription' => null,
            'quota' => null,
        ];
    }
}
