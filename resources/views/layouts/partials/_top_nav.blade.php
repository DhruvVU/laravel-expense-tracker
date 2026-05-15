<div class="navbar">
    {{-- User details --}}
    <div class="user-info">
        <p class="welcome-text">Welcome,</p>
        <p class="user-name">{{ auth()->user()->name ?? 'User' }}</p>
    </div>


    <div class="nav-controls">
        {{-- button to show add expense form --}}
        <button id="show-btn">
            <span style="font-size: 1.1rem; font-weight: 700;"><i class="fa-solid fa-plus"></i></span> Add Expense
        </button>

        {{-- Year selection --}}
        <select class="select-year custom-select">
            <option value="" disabled selected>Year</option>
            @foreach ($years as $year)
                <option value="{{ $year }}" {{ $year == now()->year ? 'selected' : '' }}>
                    {{ $year }}
                </option>
            @endforeach
        </select>

        <div class="settings-section">
            {{-- Dark/Light mode switch --}}
            <div class="theme-switch-wrapper">
                <label class="theme-switch" for="checkbox">
                    <button id="change-theme" class="theme-button">
                        <span class="theme-icon"><i class="fa-solid"></i></span>
                    </button>
                </label>
            </div>

            {{-- Profile Section button --}}
            <div class="profile-section">
                <a href="{{ route('profile') }}" class="nav-profile-link" title="My Profile"
                    style="color: var(--text-main)">
                    <span class="profile-icon">
                        <i class="fa-solid {{ Request::routeIs('profile') ? 'fa-house' : 'fa-user' }}"></i>
                    </span>
                </a>
            </div>
        </div>
    </div>
</div>