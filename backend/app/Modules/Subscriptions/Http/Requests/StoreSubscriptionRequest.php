<?php

namespace App\Modules\Subscriptions\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSubscriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'member_id' => ['required', 'integer', 'exists:members,id'],
            'offer_id' => ['required', 'integer', 'exists:offers,id'],
            'price_paid' => ['nullable', 'numeric', 'min:0'],
            'starts_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
