<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', 'Tracker.io')</title>

    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('css/dashboard.css') }}">
    <link rel="stylesheet" href="{{ asset('css/history.css') }}">

    <!-- Icons  -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
      
    <!-- JQuery link  -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

    <!-- Main javascript file -->
    <script src="{{ asset('js/script.js') }}"></script>

    <!-- Chart.js link -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <!-- Sweet Alert JavaScript -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>

<body>
    <div class="app-shell">

        <aside class="sidebar">
        
            <div class="brand-section">
        
                <!-- Button for opening and closing menu when viewing on mobile screen -->
                <button id="mobile-toggle" class="mobile-toggle">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <div class="logo-group">
                    <span class="logo-icon">📊</span>
                    <span class="logo-text">Tracker.io</span>
                </div>

            </div>
            
            <div class="user-info"> 
                <p class="welcome-text">Welcome,</p>
                <p class="user-name">{{ auth()->user()->username ?? 'User' }}</p>
            </div>
            
            <nav class="sidebar-links" style="display: flex; flex-direction: column; gap: 15px; flex-grow: 1;">
                <a href="{{ route('dashboard') }}" class="nav-link {{ request()->routeIs('dashboard') ? 'active' : '' }}">🏠 Dashboard</a>
                <a href="{{ route('history')  }}" class="nav-link {{ request()->routeIs('history') ? 'active' : '' }}">📜 History</a>
            </nav>

            <div class="sidebar-footer">

                <div class="theme-switch-wrapper">
                    <span class="icon sun-icon">☀️</span>
                    <label class="theme-switch" for="checkbox">
                        <input type="checkbox" id="checkbox" />
                        <div class="slider round"></div>
                    </label>
                    <span class="icon moon-icon">🌙</span>
                </div>

                <form action="{{ route('logout') }}" method="POST" id="logout-form">
                    @csrf
                    <button id="logout-btn" type="submit" class="logout-link">Logout</button>
                </form> 
                 
            </div>

        </aside>

        <main id="main-content" class="content-area">
            @yield('content')
        </main>
    </div>
</body>