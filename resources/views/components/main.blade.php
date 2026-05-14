<!DOCTYPE html>
<html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        
        <title>@yield('title', 'Tracker.io')</title>
        
        {{-- Including all style files --}}
        @include('layouts.partials._styles')
        {{-- Including all script files --}}
        @include('layouts.partials._scripts')
        
        @stack('page-scripts')
</head>

<body>
    <div class="body-main">
        @include('layouts.partials._side_nav')
        
        <div class="main-wrapper">
            {{-- Top navbar --}}
            <header>
                @include('layouts.partials._top_nav')
            </header>
    
            {{-- Main content --}}
            <main id="main-content" class="content-area">
                {{ $slot }}
            </main>
        </div>

    </div>
    <div id="modal-overlay"></div>
    {{-- Toast component --}}
    <x-toast></x-toast>
</body>