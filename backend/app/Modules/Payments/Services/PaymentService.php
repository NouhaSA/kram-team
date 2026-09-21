<?php

namespace App\Modules\Payments\Services;

use App\Modules\Members\Models\Member;
use App\Modules\Notifications\Events\PaymentRecorded;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Enums\PaymentType;
use App\Modules\Payments\Models\Payment;
use App\Modules\Subscriptions\Models\Subscription;
use App\Modules\Users\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function paginate(
        ?int $memberId = null,
        ?string $status = null,
        int $perPage = 20
    ): LengthAwarePaginator {
        return Payment::query()
            ->with(['member.user', 'subscription.offer', 'recordedBy'])
            ->when($memberId, fn ($q) => $q->where('member_id', $memberId))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest()
            ->paginate($perPage);
    }

    public function find(int $id): Payment
    {
        return Payment::query()
            ->with(['member.user', 'subscription.offer', 'recordedBy'])
            ->findOrFail($id);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function record(
        Member $member,
        float $amount,
        PaymentMethod $method,
        PaymentType $type,
        ?User $recordedBy = null,
        ?Subscription $subscription = null,
        PaymentStatus $status = PaymentStatus::Completed,
        ?string $notes = null,
        ?string $externalReference = null,
        array $metadata = [],
    ): Payment {
        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => ['Le montant doit être supérieur à 0.'],
            ]);
        }

        $payment = DB::transaction(function () use (
            $member,
            $amount,
            $method,
            $type,
            $recordedBy,
            $subscription,
            $status,
            $notes,
            $externalReference,
            $metadata
        ) {
            return Payment::query()->create([
                'reference' => $this->generateReference(),
                'member_id' => $member->id,
                'subscription_id' => $subscription?->id,
                'type' => $type,
                'method' => $method,
                'status' => $status,
                'amount' => $amount,
                'currency' => 'TND',
                'external_reference' => $externalReference,
                'paid_at' => $status === PaymentStatus::Completed ? now() : null,
                'notes' => $notes,
                'metadata' => $metadata ?: null,
                'recorded_by' => $recordedBy?->id,
            ])->load(['member.user', 'subscription.offer', 'recordedBy']);
        });

        PaymentRecorded::dispatch($payment);

        return $payment;
    }

    public function complete(Payment $payment, ?string $externalReference = null): Payment
    {
        if ($payment->status !== PaymentStatus::Pending) {
            throw ValidationException::withMessages([
                'status' => ['Seuls les paiements en attente peuvent être validés.'],
            ]);
        }

        $payment->update([
            'status' => PaymentStatus::Completed,
            'paid_at' => now(),
            'external_reference' => $externalReference ?? $payment->external_reference,
        ]);

        return $payment->fresh(['member.user', 'subscription.offer', 'recordedBy']);
    }

    public function cancel(Payment $payment, ?string $notes = null): Payment
    {
        if (! in_array($payment->status, [PaymentStatus::Pending, PaymentStatus::Failed], true)) {
            throw ValidationException::withMessages([
                'status' => ['Ce paiement ne peut pas être annulé.'],
            ]);
        }

        $payment->update([
            'status' => PaymentStatus::Cancelled,
            'notes' => $notes ?? $payment->notes,
        ]);

        return $payment->fresh(['member.user', 'subscription.offer']);
    }

    public function refund(Payment $payment, ?float $amount = null, ?string $notes = null, ?User $recordedBy = null): Payment
    {
        if (! in_array($payment->status, [PaymentStatus::Completed, PaymentStatus::PartiallyRefunded], true)) {
            throw ValidationException::withMessages([
                'status' => ['Seuls les paiements complétés peuvent être remboursés.'],
            ]);
        }

        $refundAmount = $amount ?? $payment->refundableAmount();

        if ($refundAmount <= 0) {
            throw ValidationException::withMessages([
                'amount' => ['Aucun montant remboursable.'],
            ]);
        }

        if ($refundAmount > $payment->refundableAmount()) {
            throw ValidationException::withMessages([
                'amount' => ['Montant supérieur au solde remboursable ('.$payment->refundableAmount().' TND).'],
            ]);
        }

        return DB::transaction(function () use ($payment, $refundAmount, $notes, $recordedBy) {
            $newRefunded = (float) $payment->refunded_amount + $refundAmount;
            $isFull = $newRefunded >= (float) $payment->amount;

            $payment->update([
                'refunded_amount' => $newRefunded,
                'status' => $isFull ? PaymentStatus::Refunded : PaymentStatus::PartiallyRefunded,
                'notes' => trim(($payment->notes ? $payment->notes."\n" : '').($notes ?? "Remboursement {$refundAmount} TND")),
                'metadata' => array_merge($payment->metadata ?? [], [
                    'last_refund' => [
                        'amount' => $refundAmount,
                        'at' => now()->toIso8601String(),
                        'by' => $recordedBy?->id,
                    ],
                ]),
            ]);

            return $payment->fresh(['member.user', 'subscription.offer', 'recordedBy']);
        });
    }

    /**
     * @return array{total: float, completed: float, refunded: float, pending: float, count: int}
     */
    public function memberSummary(Member $member): array
    {
        $payments = Payment::query()->where('member_id', $member->id)->get();

        return [
            'total_paid' => (float) $payments
                ->whereIn('status', [PaymentStatus::Completed, PaymentStatus::PartiallyRefunded, PaymentStatus::Refunded])
                ->sum('amount'),
            'total_refunded' => (float) $payments->sum('refunded_amount'),
            'pending' => (float) $payments->where('status', PaymentStatus::Pending)->sum('amount'),
            'count' => $payments->count(),
            'currency' => 'TND',
        ];
    }

    private function generateReference(): string
    {
        do {
            $reference = 'PAY-'.now()->format('Ymd').'-'.Str::upper(Str::random(6));
        } while (Payment::query()->where('reference', $reference)->exists());

        return $reference;
    }
}
