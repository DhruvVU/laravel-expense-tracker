<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title') - Tracker.io</title>
    
    <link rel="stylesheet" href="{{ asset('css/login.css') }}">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap" rel="stylesheet">

     <!-- Sweet Alert JavaScript -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    {{-- Jquery CDN --}}
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="{{ asset('js/script.js') }}"></script>
</head>
<body class="@yield('body-class')"> 

    <div class="login-wrapper">
        <div class="login-container" style="max-width: 400px;">
            <h1 class="login-logo">Tracker.io</h1>
            
            @yield('content')
            
        </div>
    </div>

    @include('components.toast')
</body>
</html>