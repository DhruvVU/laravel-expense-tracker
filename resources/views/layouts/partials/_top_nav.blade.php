<div class="navbar">
    {{-- User details --}}
    <div class="user-info">
        <p class="welcome-text">Welcome,</p>
        <p class="user-name">{{ auth()->user()->username ?? 'User' }}</p>
    </div>

    
    <div class="nav-controls">
        {{-- button to show add expense form --}}
        <button id="show-btn"><span style="font-size: 1.1rem; font-weight: 700;">+</span> Add Expense</button>
        
        {{-- Year selection --}}
        <select class="select-year custom-select">
            <option value="" disabled selected>Year</option>
            @foreach ($years as $year)
                <option value="{{ $year }}" {{ $year == now()->year ? 'selected' : '' }}>
                    {{ $year }}
                </option>
            @endforeach
        </select>

        {{-- Dark/Light mode switch --}}
        <label id="change-theme">
            <div class="theme-switch-wrapper">
                <label class="theme-switch" for="checkbox">
                    <input type="checkbox" id="checkbox" aria-label="Toggle Dark Mode" />
                    <span class="icon">☀️</span>
                </label>
            </div>
        </label>
    </div>
</div>