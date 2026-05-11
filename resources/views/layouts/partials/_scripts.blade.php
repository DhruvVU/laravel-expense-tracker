<!-- JQuery link  -->
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>

<!-- Chart.js link -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Sweet Alert JavaScript -->
<script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

{{-- DataTables library --}}
<script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>

{{-- Progress bar  --}}
<script src="https://cdn.jsdelivr.net/npm/progressbar.js@1.1.0/dist/progressbar.min.js"></script>

<script>
    function themeToggle() {
        // Get current theme from localstorage
        const currTheme = localStorage.getItem("theme");
        
        // Check the theme user selected last time
        if (currTheme === "dark") {
            $("html").addClass("dark-mode");
            $("#checkbox").prop("checked", true);
            $('.icon').text('🌙');
        }
        
        // Dark mode toggle
        $("#change-theme").on("click", function () {
            const isDark = $('input', this).is(":checked");
            $("html").toggleClass("dark-mode", isDark);
            localStorage.setItem("theme", isDark ? "dark" : "light");
            $('.icon').text(isDark ? '🌙' : '☀️');
            
            setTimeout(() => {
                const category = $(".select-category").val();   
                const year = $(".select-year").val();
                
                if (typeof pieChart === "function") {
                    pieChart(year);
                }
                
                if (typeof barChart === "function") {
                    barChart(category, year);
                }
                
                window.dispatchEvent(new Event('resize'));
            }, 100);
        });
    }
    
    $(document).ready(function() {
        themeToggle();
    })
</script>

{{-- Toast component --}}
@include('components.toast')

<!-- Main javascript file -->
<script src="{{ asset('js/script.js') }}"></script>