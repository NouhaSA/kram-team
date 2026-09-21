<?php

namespace App\Modules\Booking\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'schedule_slot_id' => ['required', 'integer', 'exists:schedule_slots,id'],
            'member_id' => ['required', 'integer', 'exists:members,id'],
            'subscription_id' => ['required', 'integer', 'exists:subscriptions,id'],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
