<?php

namespace App\Providers;

use App\Models\User;
use App\Observers\UserObserver;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        View::composer([
                'components.main',
                'components.form',
                'layouts.dashboard',
                'layouts.history'
            ], 
        function($view) {
            if (Auth::check()) {
                $user = Auth::user();

                $years = $user->expenses()
                        ->selectRaw('YEAR(expense_date) as year')
                        ->distinct()
                        ->orderBy('year', 'desc')
                        ->pluck('year');

                if ($years->isEmpty()) {
                    $years = collect([now()->year]);
                }

                $categories = $user->categories()
                                   ->orderBy('name', 'asc')
                                   ->get();

                $view->with([
                    'years' => $years,
                    'categories' => $categories
                ]);
            } else {
                $view->with([
                    'years' => collect([now()->year]),
                    'categories' => collect()
                ]);
            }
        });

        User::observe(UserObserver::class);
    }
}
