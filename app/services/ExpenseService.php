<?php

namespace App\Services;

use App\Models\Expense;
use DateTime;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ExpenseService
{
    // Filtering query based on the given input
    public function getFilteredQuery(Request $request): Builder|HasMany {
        
        $query = Expense::with('category')->where('user_id', auth()->id());

        // Filter based on year
        if ($request->filled('year')) {
            $query->whereYear('expense_date', $request->year);
        }

        // Filter based on category
        if ($request->filled('category') && $request->category !== 'All') {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('name', $request->category);
            });
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

    // Regular expressions to fetch data based on date label
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

    // Monthly budget for user
    public function getExpenseStats($user, Request $request): JsonResponse {
        $budget = $user->monthly_budget ?? 0;
        $year = $request->year ?? now()->year;

        $total_spent = $user->expenses()
                            ->whereYear('expense_date', $year)
                            ->sum('amount');

        $count = $user->expenses()->whereYear('expense_date', $year)->count();

        $spent = $user->expenses()
                    ->whereMonth('expense_date', now()->month)
                    ->whereYear('expense_date', $year)
                    ->sum('amount');
                    
        $percentage = ($budget > 0) ? ( $spent / $budget ) * 100 : 0;
        
        $latest = $user->expenses()
                        ->with('category')
                        ->latest('id')
                        ->whereYear('expense_date', $year)
                        ->first();
        $last_active = $latest->category ? $latest->category->name : 'None';
        
        $prev_month = ($year == now()->year) ? now()->subMonth() : Carbon::parse($request->month)->month;
        $last_month = $user->expenses()
                        ->whereMonth('expense_date', $prev_month)
                        ->whereYear('expense_date', $year)
                        ->sum('amount');

        return response()->json([
            'status' => 'Monthly budget fetched',
            'budget' => $budget,
            'total_spent' => $total_spent,
            'total_expenses' => $count,
            'spent' => $spent,
            'percentage' => round($percentage, 2),
            'remaining' => $budget - $spent,
            'last_month' => $last_month,
            'latest_category' => $last_active
        ]);
    }

}