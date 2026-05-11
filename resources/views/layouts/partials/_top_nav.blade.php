<div class="nav-controls">
    {{-- Year selection --}}
    <select class="select-year custom-select">
        <option value="" disabled selected>Year</option>
        @foreach ($years as $year)
        <option value="{{ $year }}" {{ $year==now()->year ? 'selected' : '' }}>
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