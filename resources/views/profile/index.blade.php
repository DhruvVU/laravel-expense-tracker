<x-main>
    @section('title', 'My Profile')

    <div class="profile-container">
        <div class="profile-meta">
            <p><strong>Member Since:</strong> {{ auth()->user()->created_at->format('d M, Y') }}</p>
            <p><strong>Last Updated:</strong> {{ auth()->user()->updated_at->diffForHumans() }}</p>
        </div>

        <div class="main-card">
            <div class="user-stats">
                <h2>User Activity</h2>
                <table class="user-profile-statistics">
                    <tr>
                        <td class="label">Latest Expense: </td>
                        <td>
                            <p class="user-data" id="spent-current">
                                {{ $stats['latest_expense'] }} - {{ $stats['latest_amount'] }}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td class="label">Total Expenses till date: </td>
                        <td>
                            <p class="user-data" id="spent-total">{{ $stats['total_count'] }}</p>
                        </td>
                    </tr>
                    <tr>
                        <td class="label">Last 30 days: </td>
                        <td>
                            <p class="user-data" id="spent-30-days">
                                {{ number_format($stats['last_30_days'], 2) }}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td class="label">Previous year spending: </td>
                        <td>
                            <p class="user-data" id="spent-last-year">
                                {{ number_format($stats['previous_year_spending'], 2) }}
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td class="label">Highest spent till date: </td>
                        <td>
                            <p class="user-data" id="spent-max">
                                {{ $stats['highest_spent_description'] }} - {{ $stats['highest_spent_amount'] }}
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
            
            <div class="profile-card">
                <h2>Profile Settings</h2>
                <p>Update your account information and spending goals.</p>
    
                {{-- Profile update form --}}
                <form id="profile-update">
                    @csrf
                    <div class="input-group-profile">
                        <label>Full Name</label>
                        <div class="edit-group">
                            <input type="text" name="name" style="background: var(--bg-main)" value="{{ auth()->user()->name }}" disabled>
                            <span class="edit-button"><i class="fa-solid fa-pen"></i></span>
                        </div>
                    </div>
    
                    <div class="input-group-profile">
                        <label>Email Address</label>
                        <div class="edit-group">
                            <input type="email" name="email" style="background: var(--bg-main)" value="{{ auth()->user()->email }}" disabled>
                            <span class="edit-button"><i class="fa-solid fa-pen"></i></span>
                        </div>
                    </div>
    
                    <div class="input-group-profile">
                        <label>Monthly Budget (₹)</label>
                        <div class="edit-group">                            
                            <input type="text" name="monthly_budget" style="background: var(--bg-main)" value="{{ auth()->user()->monthly_budget }}" disabled>
                            <span class="edit-button"><i class="fa-solid fa-pen"></i></span>
                        </div>
                    </div>
    
                    <div class="form-btn-container">
                        <button type="submit" class="btn-update" style="display: none" disabled>Update Profile</button>
                    </div>
                </form>
            </div>
        </div>

        <div class="password-container">
            <h2>Change Password</h2>
            {{-- Password change form --}}
            <form id="change-password">
                @csrf
                <div class="password-form">
                    <div class="input-group-profile">
                        <label>Current Password</label>
                        <input type="password" name="password" style="background: var(--bg-main)" placeholder="Current password">
                    </div>

                    <div class="input-group-profile">
                        <label>New Password</label>
                        <input type="password" name="password" style="background: var(--bg-main)" placeholder="New password">
                    </div>

                    <div class="input-group-profile">
                        <label>Confirm Password</label>
                        <input type="password" name="password_cofirmation" style="background: var(--bg-main)" placeholder="Confirm password">
                    </div>

                </div>
                <div class="form-btn-container">
                    <button type="submit" class="btn-update-pass">Change Password</button>
                </div>
            </form>
        </div>

        <p class="warning">These actions are permanent and cannot be undone.</p>
        <div class="danger-zone">
            <button id="clear-expenses-btn" class="btn-danger">Clear Expenses Data</button>
            <button id="delete-account-btn" class="btn-danger">Delete Account</button>
        </div>

    </div>
    @push('page-scripts')
        <script src="{{ asset('js/profile.js') }}"></script>
    @endpush
</x-main>