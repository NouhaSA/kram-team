<?php

namespace App\Modules\Quotas\Http\Requests;

use App\Modules\Quotas\Enums\QuotaTransactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ConsumeQuotaRequest extends FormRequest
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
            'amount' => ['required', 'integer', 'min:1'],
            'type' => ['required', Rule::enum(QuotaTransactionType::class)],
            'notes' => ['nullable', 'string', 'max:500'],
        ];
    }
}
