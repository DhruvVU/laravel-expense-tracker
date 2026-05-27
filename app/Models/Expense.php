<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

// Allow mass input 
#[Fillable('user_id', 'category_id', 'description', 'amount', 'expense_date')]
class Expense extends Model
{
    protected $casts = [
        'expense_date' => 'date'
    ];

    // Get user who owns this expense
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Get custom category for this expense
    public function category(): BelongsTo 
    {
        return $this->belongsTo(Category::class);
    }
}
