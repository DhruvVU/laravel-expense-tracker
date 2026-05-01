<?php

namespace App\Http\Controllers;

use App\Models\User;
use Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class AuthController extends Controller
{

// =========================================== User Authentication =============================================
    
    public function login(Request $request) {
        $credentials = $request->only('username', 'password');

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            $request->session()->save();
            return response()->json(['status' => 'success', 'message' => 'Login Successful']);
        }
    
        return response()->json(['status' => 'error', 'message' => 'Invalid username or password']);
    }

// ============================================== Create User ==================================================
    
    public function register(Request $request) {

        $request->validate([
            'username' => 'required|unique:users',
            'password' => 'required',
        ]);
    
        User::create([
            'username' => $request->username,
            'password' => Hash::make($request->password)
        ]);

        return response()->json(['status' => 'success', 'message' => 'Registration Successful']);
    }
}
