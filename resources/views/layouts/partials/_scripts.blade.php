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

{{-- Select2 selector --}}
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

{{-- DataTables library --}}
<script src="https://cdn.datatables.net/2.3.8/js/dataTables.min.js"></script>

<script>
    function themeToggle() {
        // Get current theme from localstorage
        const currTheme = localStorage.getItem("theme");
        const setIcon = $('.theme-icon i');
        
        // Check the theme user selected last time
        if (currTheme === "dark") {
            $("html").addClass("dark-mode");
            setIcon.addClass('fa-sun');
        } else {
            setIcon.addClass('fa-moon')
        }
        
        // Dark mode toggle
        $("#change-theme").on("click", function (e) {
            e.preventDefault();
            setIcon.removeClass();

            const isDark = $('html').toggleClass('dark-mode').hasClass('dark-mode');
            localStorage.setItem("theme", isDark ? "dark" : "light");

            setIcon.toggleClass(isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon');
            
            setTimeout(() => {
                const category = $(".select-category").val();   
                const year = $(".select-year").val();
                
                if (typeof pieChart === "function") {
                    pieChart(year);
                }
                
                if (typeof barChart === "function") {
                    barChart($('#last-active').text(), year);
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

{{-- Javascript file for category handling --}}
<script src="{{ asset('js/category.js') }}"></script>