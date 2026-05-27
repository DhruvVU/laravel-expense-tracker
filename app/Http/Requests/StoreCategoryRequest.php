<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {   
        $user_id = auth()->id();
        $category_id = $this->route('id');

        return [
            'name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('categories')->where(function($query) use ($user_id){
                    return $query->where('user_id', $user_id);
                })->ignore($category_id), // This helps ignore the id during update validation (name already exists)
            ],
            'color' => ['required', 'string', 'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/'],
        ];
    }

    public function messages(): array 
    {
        return [
            'name.unique' => 'You already have a category with this name!',
            'color.regex' => 'Please select a valid hex color code'
        ];
    }
}
