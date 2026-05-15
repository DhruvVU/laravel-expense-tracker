// ==============================================================================================================
// ******************** Functions related to user registration and login and basic authentication *************
// =============================================================================================================
 
$(document).ready(function() {
    // ============================================ User Registration ===========================================
    
    $(document).on("submit", "#register-form", function (e) {
        e.preventDefault();
    
        const name = $("#reg-name").val();
        const email = $("#reg-email").val();
        const password = $("#reg-password").val();
        const confirmPass = $("#reg-confirm").val();
    
        $.ajax({
            url: "/register",
            type: "POST",
            data: {
                name: name,
                email: email,
                password: password,
                password_confirmation: confirmPass
            },
            dataType: "json",
            success: function (response) {
                if (response.status === "success") {
                    showToast("Registration Successful! Redirecting to login....", "success");
    
                    setTimeout(function () {
                        window.location.href = "/login";
                    }, 2000);
                }
            },
            error: function (xhr) {
                if (xhr.status === 422) {
                    let errors = xhr.responseJSON.errors;
    
                    Object.keys(errors).forEach(key => {
                        showToast(errors[key][0], 'error');
                    })
                } else {
                    showToast("Server error! Please try again later..", "error");
                }
            },
        });
    });
    
    // ============================================== User Login ===============================================
    
    $(document).on("submit", "#login-form", function (e) {
        e.preventDefault();
    
        const email = $("#login-email").val();
        const password = $("#login-password").val();
    
        $.ajax({
            url: "/login",
            type: "POST",
            data: {
                email: email,
                password: password,
            },
            dataType: "json",
            success: function (response) {
                if (response.status === "success") {
                    showToast(response.message, "success");

                    setTimeout(function () {
                        window.location.replace("/dashboard");
                    }, 1000);
                }
            },
            error: function(xhr) {
                const msg = xhr.responseJSON ? xhr.responseJSON.message : 'Login Failed';
                showToast(msg, 'error');
            }
        });
    });
})
