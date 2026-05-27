<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExpenseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id, 
            'description' => $this->description,
            'amount' => (float) $this->amount,
            'expense_date' => $this->expense_date->format('Y-m-d'),
            'category' => $this->category ? $this->category->name: 'Other',
            'category_color' => $this->category ? $this->category->color: '#383d41'
        ];
    }
}
