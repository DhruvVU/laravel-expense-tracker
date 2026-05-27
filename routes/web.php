<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return Auth::check() ? redirect('/dashboard') : redirect('/login');
});

// Show login form
Route::get('/login', function () {
    return view('auth.login');
})->name('login');

// Show register form
Route::get('/register', function () {
    return view('auth.register');
})->name('register');

// User login 
Route::post('/login', [AuthController::class, 'login']);

// User registration
Route::post('/register', [AuthController::class, 'register']);

Route::middleware('auth')->group(function () {

    // Dashboard page route
    Route::get('/dashboard', function() {
        return view('layouts.dashboard');
    })->name('dashboard');

    // Dashboard controller routes  
    Route::get('/dashboard/budget-stats', [DashboardController::class, 'getBudget'])->name('get_budget');
    Route::patch('/dashboard/set-budget', [DashboardController::class, 'setBudget'])->name('set_budget');

    // History page route 
    Route::get('/history', function () {
        return view('layouts.history');
    })->name('history');

    // User profile controller routes
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::put('/profile/update', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/profile/update-password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    Route::delete('/profile/clear-expenses', [ProfileController::class, 'clearExpenses'])->name('profile.clear-expense');
    Route::delete('/profile/destroy', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Category controller routes
    Route::get('/categories', [CategoryController::class , 'index'])->name('categories.index');
    Route::post('/category/add', [CategoryController::class, 'store'])->name('categories.add');
    Route::put('/category/update/{id}', [CategoryController::class, 'update'])->name('categories.update');
    Route::delete('/category/delete/{id}', [CategoryController::class, 'destroy'])->name('categories.delete');

    // Expense data related routes
    Route::controller(ExpenseController::class)->prefix('expenses')->name('expenses.')->group(function () {

        Route::get('/fetch-expense', 'fetch')->name('fetch');

        Route::get('/chart-data', 'getChartData')->name('pieChart');

        Route::get('/chart-category', 'getChartData')->name('barChart');

        Route::put('/edit-expense/{expense}', 'edit')->name('edit');

        Route::delete('/delete-expense/{expense}', 'delete')->name('delete');

        Route::post('/add-expense', 'store')->name('store');

        Route::get('/export-csv', 'exportCsv')->name('exportCsv');
    });

    Route::post('/logout', function () {
        Auth::logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();

        return redirect('/login');
    })->name('logout');

});