<script>
    // Create the reusable Toast configuration  
    function setToast(isDark) {
        return Swal.mixin({
            toast: true,
            position: "top",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: isDark ? "#13171f" : "#fcfdfd",
            color: isDark ? "#fff" : "#000",
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
    }

    function showToast(message, type) {
        const isDark = $("html").hasClass("dark-mode");

        // Use the configuration to fire the specific message
        setToast(isDark).fire({
            icon: type,
            title: message
        });
    }
</script>