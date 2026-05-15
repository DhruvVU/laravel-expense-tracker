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
                    <table class="input-group-profile">
                        <tr>
                            <td class="input-label">Full Name</td>
                            <td>
                                <div class="edit-group">
                                    <input type="text" name="name" value="{{ auth()->user()->name }}" disabled>
                                    <span class="edit-button"><i class="fa-solid fa-pen"></i></span>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td class="input-label">Email Address</td>
                            <td>
                                <div class="edit-group">
                                    <input type="email" name="email" value="{{ auth()->user()->email }}" disabled>
                                    <span class="edit-button"><i class="fa-solid fa-pen"></i></span>
                                </div>
                            </td>
                        </tr>

                        <tr>
                            <td class="input-label">Monthly Budget (₹)</td>
                            <td>
                                <div class="edit-group">
                                    <input type="text" name="monthly_budget" value="{{ auth()->user()->monthly_budget }}"
                                        disabled>
                                    <span class="edit-button"><i class="fa-solid fa-pen"></i></span>
                                </div>
                            </td>
                        </tr>
                    </table>

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
                        <input type="password" name="curr_password" placeholder="Current password">
                    </div>

                    <div class="input-group-profile">
                        <label>New Password</label>
                        <input type="password" name="password" placeholder="New password">
                    </div>

                    <div class="input-group-profile">
                        <label>Confirm Password</label>
                        <input type="password" name="password_confirmation" placeholder="Confirm password">
                    </div>

                </div>
                <div class="form-btn-container">
                    <button type="submit" class="btn-update-pass">Change Password</button>
                </div>
            </form>
        </div>

        {{-- Danger Zone: Actions performed are not reversible and user should confirm before performing it --}}
        <p class="warning">⚠️ These actions are permanent and cannot be undone.</p>
        <div class="danger-zone">
            <button id="clear" class="btn-danger">CLEAR DATA</button>
            <button id="destroy" class="btn-danger">DELETE ACCOUNT</button>
        </div>

    </div>
    @push('page-scripts')
        <script src="{{ asset('js/profile.js') }}"></script>
    @endpush
</x-main>