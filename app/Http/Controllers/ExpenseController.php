<?php

namespace App\Http\Controllers;

use App\Http\Resources\ExpenseResource;
use App\Models\Expense;
use DateTime;
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
            'expense_date' => 'required|date|before_or_equal:today'
        ]);

        $expense = $request->user()->expenses()->create($validated);

        return (new ExpenseResource($expense))
                ->additional([
                    'status' => 'success',
                    'message' => 'Data added successfully'
                ]);
    }

// =========================================== Fetch Expense(READ) =============================================

    public function fetch(Request $request)
    {
        $user = $request->user();  
        $query = $user->expenses();

        // Filter for table data
        if ($request->boolean('table_data')) {
            if ($request->has('category') && $request->category !== 'All') {
                $query->where('category', $request->category);
            }

            // Fetch the data for a specific day
            if ($request->filled('label')) {
                $label = $request->label;

                if (preg_match('/^\d{1,2}$/', $label)) {
                    $date = DateTime::createFromFormat('n', $label);
                    $query->whereMonth('expense_date', $date->format('m'));
                } 
                
                elseif (preg_match('/^\d{1,2}\s[A-Za-z]{3}$/', $label)) {
                    $date = DateTime::createFromFormat('d M', $label);
                    $query->whereDay('expense_date', $date->format('d'))
                          ->whereMonth('expense_date', $date->format('m'));
                } 
                
                elseif (preg_match('/^[A-Za-z]{3}\s\d{4}$/', $label)) {
                    $date = DateTime::createFromFormat('M Y', $label);
                    $query->whereMonth('expense_date', $date->format('m'))
                          ->whereYear('expense_date', $date->format('Y'));
                } 
                
                else {
                    $query->whereRaw('DAYNAME(expense_date) = ?', [$label]);
                }
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

            if ($request->has('category') && $request->category !== 'All') {
                $query->where('category', $request->category);
            }

            if ($request->has('month') && $request->month > 0) {
                $year = $request->year ?? date('Y');

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
                'data' => $expenses
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