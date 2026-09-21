<?php

namespace App\Modules\Payments\Http\Controllers;

use App\Modules\Core\Http\Controllers\ApiController;
use App\Modules\Members\Models\Member;
use App\Modules\Payments\Enums\PaymentMethod;
use App\Modules\Payments\Enums\PaymentStatus;
use App\Modules\Payments\Enums\PaymentType;
use App\Modules\Payments\Http\Requests\RefundPaymentRequest;
use App\Modules\Payments\Http\Requests\StorePaymentRequest;
use App\Modules\Payments\Http\Resources\PaymentResource;
use App\Modules\Payments\Models\Payment;
use App\Modules\Payments\Services\PaymentService;
use App\Modules\Subscriptions\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends ApiController
{
    public function __construct(
        private readonly PaymentService $paymentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $payments = $this->paymentService->paginate(
            memberId: $request->integer('member_id') ?: null,
            status: $request->string('status')->toString() ?: null,
            perPage: $request->integer('per_page', 20)
        );

        return $this->success(PaymentResource::collection($payments));
    }

    public function store(StorePaymentRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $member = Member::query()->findOrFail($validated['member_id']);
        $subscription = isset($validated['subscription_id'])
            ? Subscription::query()->findOrFail($validated['subscription_id'])
            : null;

        $status = isset($validated['status'])
            ? PaymentStatus::from($validated['status'])
            : PaymentStatus::Completed;

        $payment = $this->paymentService->record(
            $member,
            (float) $validated['amount'],
            PaymentMethod::from($validated['method']),
            PaymentType::from($validated['type']),
            $request->user(),
            $subscription,
            $status,
            $validated['notes'] ?? null,
            $validated['external_reference'] ?? null,
        );

        return $this->success(new PaymentResource($payment), 'Paiement enregistré.', 201);
    }

    public function show(Payment $payment): JsonResponse
    {
        return $this->success(
            new PaymentResource($this->paymentService->find($payment->id))
        );
    }

    public function complete(Request $request, Payment $payment): JsonResponse
    {
        $updated = $this->paymentService->complete(
            $payment,
            $request->input('external_reference')
        );

        return $this->success(new PaymentResource($updated), 'Paiement validé.');
    }

    public function cancel(Request $request, Payment $payment): JsonResponse
    {
        $updated = $this->paymentService->cancel($payment, $request->input('notes'));

        return $this->success(new PaymentResource($updated), 'Paiement annulé.');
    }

    public function refund(RefundPaymentRequest $request, Payment $payment): JsonResponse
    {
        $validated = $request->validated();

        $updated = $this->paymentService->refund(
            $payment,
            isset($validated['amount']) ? (float) $validated['amount'] : null,
            $validated['notes'] ?? null,
            $request->user()
        );

        return $this->success(new PaymentResource($updated), 'Remboursement effectué.');
    }

    public function memberSummary(Member $member): JsonResponse
    {
        return $this->success($this->paymentService->memberSummary($member));
    }
}
