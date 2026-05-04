<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Gate;
use Illuminate\Http\Request;
class ExpenseController extends Controller
{

// ============================================ Add Expense(CREATE) ============================================

    public function store(Request $request)
    {
        $validated = $request->validate([
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'category' => 'required|in:Food,Transport,Bills,Entertainment,Other',
            'expense_date' => 'required|date'
        ]);

        $expense = $request->user()->expenses()->create($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Expense added successfully!',
            'data' => $expense
        ]);
    }

// =========================================== Fetch Expense(READ) =============================================

    public function fetch(Request $request)
    {
        $user = $request->user();  
        $query = $user->expenses();

        // Filter for table data
        if ($request->has('table_data') && $request->has('table_data') == 1) {
            if ($request->has('category') && $request->category !== 'All') {
                $query->where('category', $request->category);
            }

            // Fetch the data for a specific day
            if ($request->filled('label')) {
                $label = $request->label;

                $query->where(function($q) use ($label) {
                    $q->whereRaw('DATE_FORMAT(expense_date, "%d %b") = ?', [$label])
                      ->orWhereRaw('DAYNAME(expense_date) = ?', [$label])
                      ->orWhereRaw('DAY(expense_date) = ?', [$label])
                      ->orWhereRaw('MONTH(expense_date) = ?', [$label]);
                });                
            }

            $expenses = $query->orderBy('expense_date', 'desc')->get();
            $totalAmount = $query->sum('amount');

            return response()->json([
                'status' => 'success',
                'message' => 'Data fetch for table successful',
                'data' => $expenses,
                'total' => $totalAmount
            ]);
        }

        // Filter for line chart 
        if ($request->has('for_chart') && $request->has('for_chart') == 1) {

            if ($request->has('category') && $request->category !== 'All') {
                $query->where('category', $request->category);
            }

            if ($request->has('month') && $request->month > 0) {
                $year = $request->year ?? date('Y');
                // $query->whereMonth('expense_date', $request->month)->ddRawSql();
                $query->whereMonth('expense_date', $request->month)
                      ->whereYear('expense_date', $year)
                      ->selectRaw("DATE_FORMAT(expense_date, '%d %b') as label, SUM(amount) as total")
                      ->groupBy('label')
                      ->orderByRaw('MIN(expense_date) ASC');
            } else {
                $query->selectRaw("MONTH(expense_date) as label, SUM(amount) as total")
                      ->groupBy('label')
                      ->orderByRaw('MIN(expense_date) ASC');
            }

            $expenses = $query->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Line Chart data fetched',
                'data' => $expenses,
            ]);
        }
     
        // Filter based on category
        if ($request->has('category') && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        // Filter based on description
        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        $totalAmount = $query->sum('amount');
        // Pagination 
        $expenses = $query->orderBy('expense_date', 'desc')->paginate(5);

        return response()->json([
            'status' => 'success',
            'message' => 'Data fetch successful',
            'data' => $expenses->items(),
            'total' => $totalAmount,
            'pages' => $expenses->lastPage(),
            'curr_page' => $expenses->currentPage()
        ]);
    }
    
    // ============================= Fetch Chart Data =============================
    public function getChartData(Request $request)
    {
        $category = $request->category;
        $user = $request->user();

        if (!$category || $category === 'All') {
            $data = $request->user()->expenses()
                ->selectRaw('category, SUM(amount) as total')
                ->groupBy('category')
                ->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Data fetch successful',
                'data' => $data
            ]);
        }

        $stats = $user->expenses()
            ->where('category', $category)
            ->selectRaw('DAYOFWEEK(expense_date) as day, SUM(amount) as total')
            ->groupBy('day')
            ->pluck('total', 'day')->toArray();

        $data = [];
        $daysMap = [2, 3, 4, 5, 6, 7, 1];

        foreach ($daysMap as $day) {
            $data[] = isset($stats[$day]) ? (float)$stats[$day] : 0;
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Data fetch successful',
            'data' => $data
        ]);
    }

// ============================================ Edit Expense(UPDATE) ===========================================

    public function edit(Request $request, Expense $expense)
    {
        // Using policy to check if logged in user is authorized for performing the operation
        Gate::authorize('update', $expense);

        $validated = $request->validate([
            'description' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric',
            'category' => 'sometimes|in:Food,Transport,Bills,Entertainment,Other',
            'expense_date' => 'sometimes|date',
        ]);

        $expense->update($validated);

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
        $expenses = $request->user()->expenses()
            ->select('expense_date', 'description', 'category', 'amount')
            ->get();

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

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="expenses.csv"',
        ];

        return response()->stream($callback, 200, $headers);
    }
}