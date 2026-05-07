<?php

namespace App\Services;

use DateTime;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\Request;

class ExpenseService
{
    public function getFilteredQuery(Request $request): Builder|HasMany {
        
        $query = $request->user()->expenses();

        // Filter based on year
        if ($request->filled('year')) {
            $query->whereYear('expense_date', $request->year);
        }

        // Filter based on category
        if ($request->filled('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        // Filter by Search values
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        // Filter by date range 
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('expense_date', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('start_date')) {
            $query->where('expense_date', '>=', $request->start_date);
        } elseif ($request->filled('end_date')) {
            $query->where('expense_date', '<=', $request->end_date);
        }

        return $query;
    }

    public function applyLabelFilters($query, $label) {
        
        if (preg_match('/^\d{1,2}$/', $label)) {
            $date = DateTime::createFromFormat('n', $label);
            return $query->whereMonth('expense_date', $date->format('m'));
        }

        if (preg_match('/^[A-Za-z]{3}$/', $label)) {
            $date = DateTime::createFromFormat('M', $label);
            return $query->whereMonth('expense_date', $date->format('m'));
        } 
        
        if (preg_match('/^\d{1,2}\s[A-Za-z]{3}$/', $label)) {
            $date = DateTime::createFromFormat('d M', $label);
            return $query->whereDay('expense_date', $date->format('d'))
                ->whereMonth('expense_date', $date->format('m'));
        } 
        
        if (preg_match('/^[A-Za-z]{3}\s\d{4}$/', $label)) {
            $date = DateTime::createFromFormat('M Y', $label);
            return $query->whereMonth('expense_date', $date->format('m'))
                ->whereYear('expense_date', $date->format('Y'));
        } 
        
        return $query->whereRaw('DAYNAME(expense_date) = ?', [$label]);
    }
}