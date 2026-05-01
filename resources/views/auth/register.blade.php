@extends('layouts.guest')
@Section('title', 'Register')

@section('content')
        <div class="card card-login" style="padding: 40px;">
                <h2>Create Account</h2>
                
                <form id="register-form">
                    <div class="form-group">
                        <label>Enter Username</label>
                        <input type="text" id="reg-username" placeholder="Enter username">
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
    
    <!-- This container handles the toast element  -->
    <div id="toast-container">
        <!-- <div class="toast toast-success">Success Toast!</div> -->
        <!-- <div class="toast toast-error">Error Toast!</div> -->
    </div>
@endsection