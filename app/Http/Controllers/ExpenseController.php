<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreExpenseRequest;
use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use Gate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExpenseController extends Controller
{
    // Using expense service to make the controller thinner
    protected $expenseService;
    public function __construct(\App\Services\ExpenseService $expenseService) {
        $this->expenseService = $expenseService;
    }

// ============================================ Add Expense(CREATE) ============================================

    public function store(StoreExpenseRequest $request): ExpenseResource
    {
        $expense = $request->user()->expenses()->create($request->validated());
        return (new ExpenseResource($expense))
                ->additional([
                    'status' => 'success',
                    'message' => 'Expense added successfully'
                ]);
    }

// =========================================== Fetch Expense(READ) =============================================

    public function fetch(Request $request)
    {
        $query = $this->expenseService->getFilteredQuery($request);
        $year = $request->year ?? date('Y');

        // Filter for table data
        if ($request->boolean('table_data')) {
            $tableQuery = clone $query;
            
            // Fetch the data for a specific day
            if ($request->filled('label')) {
                $this->expenseService->applyLabelFilters($tableQuery, $request->label);
            }

            $expenses = $tableQuery->orderBy('expense_date', 'desc')->limit(5)->get();
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
            $chartQuery = clone $query;

            if ($request->has('month') && $request->month > 0) {
                $chartQuery->whereMonth('expense_date', $request->month)
                      ->whereYear('expense_date', $year)
                      ->selectRaw("DATE_FORMAT(expense_date, '%d %b') as label, SUM(amount) as total")
                      ->groupBy('label')
                      ->orderByRaw('MIN(expense_date) ASC');
            } else {
                $chartQuery->selectRaw("DATE_FORMAT(expense_date, '%b') as label, SUM(amount) as total")
                      ->groupBy('label')
                      ->orderByRaw('MIN(expense_date) ASC');
            }

            $expenses = $chartQuery->get();
            return response()->json([
                'status' => 'success',
                'message' => 'Line Chart data fetched',
                'data' => $expenses
            ]);
        }

        $totalAmount = $query->sum('amount');
        // Pagination 
        $expenses = $query->orderBy('expense_date', 'desc')->paginate(5);
        $total_expenses = $query->count();

        return ExpenseResource::collection($expenses)->additional([
            'status' => 'success',
            'message' => 'Data fetch successful',
            'total' => $totalAmount,
            'pages' => $expenses->lastPage(),
            'curr_page' => $expenses->currentPage(),
            'total_expenses' => $total_expenses
        ]);
    }
    
    // ============================= Fetch Chart Data =============================
    public function getChartData(Request $request): JsonResponse
    {
        $query = Expense::where('expenses.user_id', auth()->id());
        $categoryName = $request->category;
        
        if ($request->filled('year')) {
            $query->whereYear('expense_date', $request->year);
        }

        // ==========================================
        // Pie Chart Data Fetching (All Categories)
        // ==========================================
        if (!$categoryName || $categoryName === 'All') {
            $data = (clone $query)->join('categories', 'expenses.category_id', '=', 'categories.id')
                        ->selectRaw('categories.name as category, categories.color as color, SUM(expenses.amount) as total')
                        ->groupBy('categories.name', 'categories.color')
                        ->get();
                   
            return response()->json([
                'status' => 'success',
                'message' => 'Data fetch for pie chart successful',
                'data' => $data
            ]);
        }

        // ==========================================
        // Bar Chart Data Fetching (Selected Category)
        // ==========================================
        $category_record = auth()->user()->categories()->where('name', $categoryName)->first();
        $color = $category_record ? $category_record->color : '#3b82f6';

        $stats = $query->whereHas('category', function ($q) use ($categoryName) {
                            $q->where('name', $categoryName);
                        }) 
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
            'data' => $data,
            'color' => $color
        ]);
    }

// ============================================ Edit Expense(UPDATE) ===========================================

    public function edit(StoreExpenseRequest $request, Expense $expense): JsonResponse
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

    public function delete(Expense $expense): JsonResponse
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

    public function exportCsv(Request $request): StreamedResponse
    {
        $query = $this->expenseService->getFilteredQuery($request);

        $expenses = $query->with('category')
                          ->select('expense_date', 'description', 'amount', 'category_id')
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
                    $expense->category ? $expense->category->name : 'Other',
                    $expense->amount
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}