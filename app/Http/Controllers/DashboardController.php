<?php

namespace App\Http\Controllers;

use App\Services\ExpenseService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{

    protected $expenseService;

    // 2. Inject the service through the constructor
    public function __construct(ExpenseService $expenseService)
    {
        $this->expenseService = $expenseService;
    }

    public function getBudget()
    {
        $monthly_stats = $this->expenseService->getMonthlyBudget(auth()->user());
        return response()->json([
            'status' => 'success',
            'data' => $monthly_stats
        ]);
    }

    public function setBudget(Request $request)
    {
        $request->validate([
            'monthly_budget' => 'required|numeric|min:0'
        ]);
        $user = auth()->user();
        $user->update([
            'monthly_budget' => $request->monthly_budget
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Budget updated!',
            'new_budget' => $user->monthly_budget
        ]);
    }
}
