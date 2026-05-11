<?php

namespace App\Providers;

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
        View::composer('components.main', function($view) {
            if (Auth::check()) {
                $years = Auth::user()->expenses()
                        ->selectRaw('YEAR(expense_date) as year')
                        ->distinct()
                        ->orderBy('year', 'desc')
                        ->pluck('year');
                
                if ($years->isEmpty()) {
                    $years = collect([now()->year]);
                }

                $view->with('years', $years);
            }
        });
    }
}
