<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExpenseResource;
use App\Http\Requests\StoreExpenseRequest;
use App\Http\Requests\UpdateExpenseRequest;
use App\Models\Expense;
use Gate;
use Illuminate\Http\Request;
class ExpenseController extends Controller
{
    // Using expense service to make the controller thinner
    protected $expenseService;
    public function __construct(\App\Services\ExpenseService $expenseService) {
        $this->expenseService = $expenseService;
    }
// ============================================ Add Expense(CREATE) ============================================

    public function store(StoreExpenseRequest $request)
    {
        $expense = $request->user()->expenses()->create($request->validated());

        return (new ExpenseResource($expense))
                ->additional([
                    'status' => 'success',
                    'message' => 'Data added successfully'
                ]);
    }

// =========================================== Fetch Expense(READ) =============================================

    // Fetch Years 
    public function fetchYear(Request $request) {
        $years = $request->user()->expenses()
                ->selectRaw('YEAR(expense_date) as year')
                ->distinct()
                ->orderBy('year', 'desc')
                ->pluck('year');
        
        if ($years->isEmpty()) {
            $years = collect([date('Y')]);
        }

        return view('dashboard', compact('years'));
    }

    public function fetch(Request $request)
    {
        $query = $this->expenseService->getFilteredQuery($request);

        // Filter for table data
        if ($request->boolean('table_data')) {
            
            // Fetch the data for a specific day
            if ($request->filled('label')) {
                $this->expenseService->applyLabelFilters($query, $request->label);
            }

            $expenses = $query->orderBy('expense_date', 'desc')->limit(6)->get();
            $totalAmount = $expenses->sum('amount');

            return ExpenseResource::collection($expenses)->additional([
                'status' => 'success',
                'message' => 'Table data fetched successfully',
                'total' => $totalAmount
            ]);
        }

        // Filter for line chart 
        if ($request->boolean('for_chart')) {
            $year = $request->year ?? date('Y');

            if ($request->has('month') && $request->month > 0) {
                $query->whereMonth('expense_date', $request->month)
                      ->whereYear('expense_date', $year)
                      ->selectRaw("DATE_FORMAT(expense_date, '%d %b') as label, SUM(amount) as total")
                      ->groupBy('label')
                      ->orderByRaw('MIN(expense_date) ASC');
            } else {
                $query->selectRaw("DATE_FORMAT(expense_date, '%b') as label, SUM(amount) as total")
                      ->groupBy('label')
                      ->orderByRaw('MIN(expense_date) ASC');
            }

            $expenses = $query->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Line Chart data fetched',
                'data' => $expenses
            ]);
        }

        $totalAmount = $query->sum('amount');
        // Pagination 
        $expenses = $query->orderBy('expense_date', 'desc')->paginate(5);

        return ExpenseResource::collection($expenses)->additional([
            'status' => 'success',
            'message' => 'Data fetch successful',
            'total' => $totalAmount,
            'pages' => $expenses->lastPage(),
            'curr_page' => $expenses->currentPage()
        ]);
    }
    
    // ============================= Fetch Chart Data =============================
    public function getChartData(Request $request)
    {
        $query = $request->user()->expenses();
        $category = $request->category;
        
        if ($request->filled('year')) {
            $query->whereYear('expense_date', $request->year);
        }

        if (!$category || $category === 'All') {
            $data = $query->selectRaw('category, SUM(amount) as total')
                          ->groupBy('category')
                          ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Data fetch for pie chart successful',
                'data' => $data
            ]);
        }

        $stats = $query->where('category', $category)
            ->selectRaw('DAYOFWEEK(expense_date) as day, SUM(amount) as total')
            ->groupBy('day')
            ->pluck('total', 'day')->toArray();

        $data = [];
        $daysMap = [2, 3, 4, 5, 6, 7, 1];

        foreach ($daysMap as $day) {
            $data[] = (float)($stats[$day] ?? 0);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data fetch for bar chart successful',
            'data' => $data
        ]);
    }

// ============================================ Edit Expense(UPDATE) ===========================================

    public function edit(UpdateExpenseRequest $request, Expense $expense)
    {
        // Using policy to check if logged in user is authorized for performing the operation
        Gate::authorize('update', $expense);

        $expense->update($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Update successful'
        ]);
    }

// ============================================ Delete Expense(DELETE) =========================================

    public function delete(Expense $expense)
    {

        // Using policy to check if logged in user is authorized for performing the operation
        Gate::authorize('delete', $expense);

        $expense->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Expense Deleted'
        ]);
    }

// ============================================ Download CSV File ==============================================

    public function exportCsv(Request $request)
    {
        $query = $this->expenseService->getFilteredQuery($request);

        $expenses = $query->select('expense_date', 'description', 'category', 'amount')
                          ->orderBy('expense_date', 'desc')
                          ->get();

        $fileName = 'expenses_' . now()->format('Y-m-d') . '.csv';

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$fileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function () use ($expenses) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Date', 'Description', 'Category', 'Amount']);

            foreach ($expenses as $expense) {
                fputcsv($file, [
                    $expense->expense_date,
                    $expense->description,
                    $expense->category,
                    $expense->amount
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}