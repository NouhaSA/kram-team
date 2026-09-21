<?php

namespace App\Modules\Booking\Http\Controllers;

use App\Modules\Booking\Http\Requests\StoreBookingRequest;
use App\Modules\Booking\Http\Resources\BookingResource;
use App\Modules\Booking\Models\Booking;
use App\Modules\Booking\Services\BookingService;
use App\Modules\Core\Http\Controllers\ApiController;
use App\Modules\Members\Models\Member;
use App\Modules\Schedule\Models\ScheduleSlot;
use App\Modules\Subscriptions\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends ApiController
{
    public function __construct(
        private readonly BookingService $bookingService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $bookings = $this->bookingService->paginate(
            memberId: $request->integer('member_id') ?: null,
            slotId: $request->integer('schedule_slot_id') ?: null,
            perPage: $request->integer('per_page', 20)
        );

        return $this->success(BookingResource::collection($bookings));
    }

    public function store(StoreBookingRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $slot = ScheduleSlot::query()->findOrFail($validated['schedule_slot_id']);
        $member = Member::query()->findOrFail($validated['member_id']);
        $user = $request->user();

        $isStaff = $user->hasAnyRole(['admin', 'reception', 'coach']);
        $isSelf = $user->member?->id === $member->id;
        // Only admin / gestionnaire confirm immediately; member & coach need validation
        $requiresApproval = ! $user->hasAnyRole(['admin', 'reception']);

        if (! $isStaff && ! $isSelf) {
            return $this->error('Tu ne peux réserver que pour ton compte adhérent.', 403);
        }

        $booking = $this->bookingService->book(
            $slot,
            $member,
            Subscription::query()->findOrFail($validated['subscription_id']),
            $user,
            $validated['notes'] ?? null,
            $requiresApproval
        );

        $message = match ($booking->status->value) {
            'pending' => 'Demande envoyée — en attente de validation gestionnaire/admin.',
            'waitlist' => 'Créneau complet — placé en liste d\'attente.',
            default => 'Réservation confirmée.',
        };

        return $this->success(new BookingResource($booking), $message, 201);
    }

    public function show(Booking $booking): JsonResponse
    {
        return $this->success(
            new BookingResource($this->bookingService->find($booking->id))
        );
    }

    public function accept(Request $request, Booking $booking): JsonResponse
    {
        if (! $request->user()->hasAnyRole(['admin', 'reception'])) {
            return $this->error('Seuls l’admin et le gestionnaire peuvent accepter une réservation.', 403);
        }

        $accepted = $this->bookingService->accept($booking);

        $message = $accepted->status->value === 'waitlist'
            ? 'Acceptée — créneau complet, placée en liste d\'attente.'
            : 'Réservation acceptée.';

        return $this->success(new BookingResource($accepted), $message);
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        $user = $request->user();
        $isModerator = $user->hasAnyRole(['admin', 'reception']);
        $isOwner = $user->member?->id === $booking->member_id;

        if (! $isModerator && ! $isOwner) {
            return $this->error('Tu ne peux annuler que tes propres réservations.', 403);
        }

        $cancelled = $this->bookingService->cancel(
            $booking,
            $request->input('reason')
        );

        return $this->success(new BookingResource($cancelled), 'Réservation annulée.');
    }
}
