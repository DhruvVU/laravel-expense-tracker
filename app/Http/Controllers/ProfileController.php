<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\View\View;

class ProfileController extends Controller
{
    public function index(): View {
        $user = auth()->user();

        $latest_expense = $user->expenses()
                                ->latest('expense_date')
                                ->first();

        $highest_spent = $user->expenses()
                            ->orderBy('amount', 'desc')
                            ->first();

        // Fetch user stats for profile page
        $stats = [
            'latest_expense' => $latest_expense?->description ?? 'No Expense Found',
            'latest_amount' => $latest_expense?->amount ?? 0,
            'total_count' => $user->expenses()->count(),
            'last_30_days' => $user->expenses()
                                ->where('expense_date', '>=', Carbon::now()->subDays(30))
                                ->sum('amount'),
            'previous_year_spending' => $user->expenses()
                                            ->whereYear('expense_date', Carbon::now()->subYear()->year)
                                            ->sum('amount'),
            'highest_spent_description' => $highest_spent?->description ?? 'N/A',
            'highest_spent_amount' => $highest_spent?->amount ?? 0      
        ];

        return view('profile.index', compact('stats'));
    }

    public function update(ProfileUpdateRequest $request) {
        $user = $request->user();
        
        $user->update($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Profile details updated!',
            'user' => $user
        ]);
    }
}
