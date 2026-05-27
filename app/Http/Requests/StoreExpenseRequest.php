<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreExpenseRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $userId = auth()->id();
        return [
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0|decimal:0,2',
            'expense_date' => 'required|date|date_format:Y-m-d|before_or_equal:today',
            'category_id' => [
                'required',
                'integer',
                Rule::exists('categories', 'id')->where(function($query) use ($userId) {
                    return $query->where('user_id', $userId);
                })
            ]
        ];
    }
}
