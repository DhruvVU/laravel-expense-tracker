<x-guest>
    @Section('title', 'Register')

    @section('content')
        <div class="card card-login" style="padding: 40px;">
            <h2>Create Account</h2>

            <form id="register-form">
                <div class="form-group">
                    <label>Enter Name</label>
                    <input type="text" id="reg-name" placeholder="Enter name">
                </div>

                <div class="form-group">
                    <label>Enter Email</label>
                    <input type="email" id="reg-email" placeholder="Enter email">
                </div>

                <div class="form-group">
                    <label>Create Password</label>
                    <input type="password" id="reg-password" placeholder="Enter password">
                </div>

                <div class="form-group">
                    <label>Confirm Password</label>
                    <input type="password" id="reg-confirm" placeholder="Confirm password">
                </div>

                <div class="btn-container">
                    <button type="submit" id="register-btn">
                        Register
                    </button>
                </div>
            </form>

            <p class="transfer-text">
                Already have an account? <a href="/login" class="page-transfer">Login here</a>
            </p>
        </div>
        </div>
        </div>
    
    @endsection
    @push('page-scripts')
        <script src="{{ asset('js/auth.js') }}"></script>
    @endpush
</x-guest>