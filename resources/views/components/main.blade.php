<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <title>@yield('title', 'Tracker.io')</title>

    {{-- Including all style files --}}
    @include('layouts.partials._styles')

    {{-- Including all script files --}}
    @include('layouts.partials._scripts')

</head>

<body>
    <div class="body-main">

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
                <a href="{{ route('dashboard') }}"
                    class="nav-link {{ request()->routeIs('dashboard') ? 'active' : '' }}">🏠 Dashboard</a>
                <a href="{{ route('history')  }}"
                    class="nav-link {{ request()->routeIs('history') ? 'active' : '' }}">📜 History</a>
            </nav>

            <div class="sidebar-footer">

                <div class="theme-switch-wrapper">
                    <span class="icon sun-icon">☀️</span>
                    <label class="theme-switch" for="checkbox">
                        <input type="checkbox" id="checkbox" aria-label="Toggle Dark Mode"/>
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
            {{-- Main content --}}
            {{ $slot }}
        </main>

        {{-- Toast component --}}
        <x-toast></x-toast>
    </div>
</body>