<?php

namespace App\Modules\Quotas\Services;

use App\Modules\Quotas\Enums\QuotaTransactionType;
use App\Modules\Quotas\Enums\QuotaType;
use App\Modules\Quotas\Models\QuotaTransaction;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Subscriptions\Models\SubscriptionQuota;
use App\Modules\Users\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class QuotaService
{
    /**
     * @return Collection<int, array<string, mixed>>
     */
    public function getBalances(Subscription $subscription): Collection
    {
        return $subscription->quotas->map(fn (SubscriptionQuota $quota) => $this->formatQuotaBalance($quota));
    }

    /**
     * @return array<string, mixed>
     */
    public function formatQuotaBalance(SubscriptionQuota $quota): array
    {
        return [
            'id' => $quota->id,
            'label' => $quota->label,
            'quota_type' => $quota->quota_type->value,
            'activity_type' => $quota->activity_type,
            'total' => $quota->total,
            'consumed' => $quota->consumed,
            'remaining' => $quota->remaining(),
            'expires_at' => $quota->expires_at?->toIso8601String(),
            'is_unlimited' => $quota->isUnlimited(),
            'is_expired' => $quota->isExpired(),
            'alert' => $this->getAlertLevel($quota),
        ];
    }

    public function consume(
        SubscriptionQuota $quota,
        int $amount,
        QuotaTransactionType $type,
        ?User $createdBy = null,
        ?string $notes = null,
        ?string $referenceType = null,
        ?int $referenceId = null,
    ): QuotaTransaction {
        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => ['Le montant doit être positif.'],
            ]);
        }

        return DB::transaction(function () use ($quota, $amount, $type, $createdBy, $notes, $referenceType, $referenceId) {
            $quota = SubscriptionQuota::query()->lockForUpdate()->findOrFail($quota->id);

            if ($quota->isExpired()) {
                throw ValidationException::withMessages([
                    'quota' => ['Ce quota est expiré.'],
                ]);
            }

            if (! $quota->isUnlimited() && $quota->remaining() < $amount) {
                throw ValidationException::withMessages([
                    'quota' => ['Solde insuffisant. Restant : '.$quota->remaining()],
                ]);
            }

            if (! $quota->isUnlimited()) {
                $quota->increment('consumed', $amount);
                $quota->refresh();
            }

            return QuotaTransaction::query()->create([
                'subscription_quota_id' => $quota->id,
                'amount' => -$amount,
                'balance_after' => $quota->remaining() ?? 0,
                'type' => $type,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'notes' => $notes,
                'created_by' => $createdBy?->id,
            ]);
        });
    }

    public function credit(
        SubscriptionQuota $quota,
        int $amount,
        QuotaTransactionType $type,
        ?User $createdBy = null,
        ?string $notes = null,
    ): QuotaTransaction {
        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => ['Le montant doit être positif.'],
            ]);
        }

        return DB::transaction(function () use ($quota, $amount, $type, $createdBy, $notes) {
            $quota = SubscriptionQuota::query()->lockForUpdate()->findOrFail($quota->id);

            if (! $quota->isUnlimited()) {
                $quota->decrement('consumed', min($amount, $quota->consumed));
                $quota->refresh();
            }

            return QuotaTransaction::query()->create([
                'subscription_quota_id' => $quota->id,
                'amount' => $amount,
                'balance_after' => $quota->remaining() ?? 0,
                'type' => $type,
                'notes' => $notes,
                'created_by' => $createdBy?->id,
            ]);
        });
    }

    /**
     * @return Collection<int, QuotaTransaction>
     */
    public function getHistory(SubscriptionQuota $quota, int $limit = 50): Collection
    {
        return $quota->transactions()
            ->with('createdBy')
            ->limit($limit)
            ->get();
    }

    /**
     * @return list<array<string, mixed>>
     */
    public function getAlerts(Subscription $subscription): array
    {
        $alerts = [];

        foreach ($subscription->quotas as $quota) {
            $level = $this->getAlertLevel($quota);

            if ($level !== null) {
                $alerts[] = [
                    'quota_id' => $quota->id,
                    'label' => $quota->label,
                    'level' => $level,
                    'remaining' => $quota->remaining(),
                    'message' => match ($level) {
                        'critical' => "Quota « {$quota->label} » épuisé ou presque.",
                        'warning' => "Quota « {$quota->label} » bientôt épuisé.",
                        default => "Quota « {$quota->label} » à surveiller.",
                    },
                ];
            }
        }

        return $alerts;
    }

    private function getAlertLevel(SubscriptionQuota $quota): ?string
    {
        if ($quota->isUnlimited() || $quota->quota_type === QuotaType::Hours) {
            return null;
        }

        $remaining = $quota->remaining();

        if ($remaining === null) {
            return null;
        }

        if ($remaining === 0) {
            return 'critical';
        }

        $total = $quota->total ?? 0;

        if ($total > 0 && ($remaining / $total) <= 0.2) {
            return 'warning';
        }

        return null;
    }
}
