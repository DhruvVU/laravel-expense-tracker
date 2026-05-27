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

        // Check if the user is coming in via 'POST' or 'PUT/PATCH', this will help in setting different validation rules for create and update requests
        $current_rule = $this->isMethod('post') ? 'required' : 'sometimes|required';
        
        return [
            'description' => [$current_rule, 'string', 'max:255'],
            'amount' => [$current_rule, 'numeric', 'min:0.01', 'decimal:0,2'],
            'expense_date' => [$current_rule, 'date', 'date_format:Y-m-d', 'before_or_equal:today'],
            'category_id' => [
                $current_rule,
                'integer',
                Rule::exists('categories', 'id')->where(function($query) use ($userId) {
                    return $query->where('user_id', $userId);
                })
            ]
        ];
    }
}
