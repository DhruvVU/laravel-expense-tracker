<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class ProfileController extends Controller
{
    // Function to view statistics of user on the profile page
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

    // Function to update user details 
    public function update(ProfileUpdateRequest $request): JsonResponse {
        $user = $request->user();

        // For debugging use either of these
        //dd($request->all()) || dd($request->validated());
        $user->update($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Profile details updated!',
            'user' => $user
        ]);
    }

    // Function to change password of user
    public function updatePassword(Request $request): JsonResponse {
        $user = $request->user();
        $validated = $request->validate([
            'curr_password' => 'required|current_password',
            'password' => 'required|min:8|confirmed'
        ]);

        $user->update([
            'password' => $validated['password']
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Password changed'
        ]);
    }

    // ⚠️ Warning: This function will clear all expenses of the logged-in user
    public function clearExpenses(Request $request): JsonResponse {
        $user = $request->user();
        $user->expenses()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Expense data cleared!'
        ]);
    }

    // ⚠️ Warning: This function will delete the account of the logged-in user
    public function destroy(Request $request): JsonResponse {
        $user = $request->user();

        // First make sure the user is logged out
        Auth::logout();

        // Delete the user account
        $user->delete();

        // Invalidate the session
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'status' => 'success',
            'message' => 'Account deleted!'
        ]);
    }
}
