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

    <nav class="sidebar-links">
        <a href="{{ route('dashboard') }}" class="nav-link {{ request()->routeIs('dashboard') ? 'active' : '' }}">Dashboard</a>
        <a href="{{ route('history')  }}" class="nav-link {{ request()->routeIs('history') ? 'active' : '' }}">
            History</a>
        <a href="{{ route('categories.index')  }}" class="nav-link {{ request()->routeIs('categories.index') ? 'active' : '' }}">
            Categories</a>
    </nav>

    <div class="sidebar-footer">

        <form action="{{ route('logout') }}" method="POST" id="logout-form">
            @csrf
            <button id="logout-btn" type="submit" class="logout-link">
                <i class="fa-solid fa-right-from-bracket"></i> Logout
            </button>
        </form>

    </div>

</aside>