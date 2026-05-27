<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

// Allow mass input of fields
#[Fillable('user_id', 'name', 'color')]
class Category extends Model
{
    // Get the user who is the owner of custom category
    public function user(): BelongsTo 
    {
        return $this->belongsTo(User::class);
    }
    
    // Get the associated expenses for a particular category
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'category_id', 'id');
    }
}
