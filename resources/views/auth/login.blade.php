<x-guest>
    @section('title', 'Login')

    @section('content')
        <div class="card card-login" style="padding: 40px;">
            <h2 style="">Welcome Back</h2>

            <form id="login-form">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="login-username" placeholder="Enter your username">
                </div>

                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="login-password" placeholder="Enter your password">
                </div>

                <div class="btn-container">
                    <button type="submit" id="login-btn">
                        Sign In
                    </button>
                </div>
            </form>

            <p class="transfer-text">
                New here? <a href="/register" class="page-transfer">Create an account</a>
            </p>
        </div>
        </div>
        </div>

    @endsection
    @push('page-scripts')
        <script src="{{ asset('js/auth.js') }}"></script>
    @endpush
</x-guest>