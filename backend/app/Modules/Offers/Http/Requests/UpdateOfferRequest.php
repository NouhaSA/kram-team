<?php

namespace App\Modules\Offers\Http\Requests;

use App\Modules\Offers\Enums\OfferType;
use App\Modules\Quotas\Enums\QuotaType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOfferRequest extends FormRequest
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
        $offerId = $this->route('offer')?->id;

        return [
            'name' => ['sometimes', 'string', 'max:150'],
            'slug' => ['sometimes', 'string', 'max:150', Rule::unique('offers', 'slug')->ignore($offerId)],
            'description' => ['nullable', 'string'],
            'type' => ['sometimes', Rule::enum(OfferType::class)],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'duration_days' => ['nullable', 'integer', 'min:1'],
            'requires_booking' => ['boolean'],
            'promotion_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'promotion_starts_at' => ['nullable', 'date'],
            'promotion_ends_at' => ['nullable', 'date'],
            'image_path' => ['nullable', 'string', 'max:500'],
            'services_included' => ['nullable', 'array'],
            'is_active' => ['boolean'],
            'quotas' => ['sometimes', 'array', 'min:1'],
            'quotas.*.label' => ['required_with:quotas', 'string', 'max:100'],
            'quotas.*.quota_type' => ['required_with:quotas', Rule::enum(QuotaType::class)],
            'quotas.*.total' => ['nullable', 'integer', 'min:1'],
            'quotas.*.activity_type' => ['nullable', 'string', 'max:50'],
            'coach_ids' => ['nullable', 'array'],
            'coach_ids.*' => ['integer', 'exists:users,id'],
        ];
    }
}
