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

    <nav class="sidebar-links" style="display: flex; flex-direction: column; gap: 15px; flex-grow: 1;">
        <a href="{{ route('dashboard') }}" class="nav-link {{ request()->routeIs('dashboard') ? 'active' : '' }}">🏠
            Dashboard</a>
        <a href="{{ route('history')  }}" class="nav-link {{ request()->routeIs('history') ? 'active' : '' }}">📜
            History</a>
    </nav>

    <div class="sidebar-footer">

        <form action="{{ route('logout') }}" method="POST" id="logout-form">
            @csrf
            <button id="logout-btn" type="submit" class="logout-link">Logout</button>
        </form>

    </div>

</aside>