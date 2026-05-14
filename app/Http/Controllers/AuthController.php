<?php

namespace App\Http\Controllers;

use App\Http\Requests\RegisterRequest;
use App\Models\User;
use Hash;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class AuthController extends Controller
{

// =========================================== User Authentication =============================================
    
    public function login(Request $request): JsonResponse {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $request->session()->regenerate();
            $request->session()->save();
            return response()->json([
                'status' => 'success', 
                'message' => 'Login Successful'   
            ]);
        }
    
        return response()->json(['status' => 'error', 'message' => 'Invalid credentials'], 401);
    }

// ============================================== Create User ==================================================
    
    public function register(RegisterRequest $request): JsonResponse {
        // Validation already done by form requests
        User::create($request->validated());

        return response()->json(['status' => 'success', 'message' => 'Registration Successful']);
    }
}
