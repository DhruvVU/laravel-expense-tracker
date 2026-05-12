$(document).ready(function() {

    // ============================================ User Registration ===========================================
    
    $(document).on("submit", "#register-form", function (e) {
        e.preventDefault();
    
        const username = $("#reg-username").val();
        const password = $("#reg-password").val();
        const confirmPass = $("#reg-confirm").val();
    
        if (username === "" || password === "" || confirmPass === "") {
            showToast("Please fill in all the details", "error");
            return;
        }
    
        if (confirmPass !== password) {
            showToast("Passwords do not match", "error");
            return;
        }
    
        $.ajax({
            url: "/register",
            type: "POST",
            data: {
                username: username,
                password: password,
            },
            dataType: "json",
            success: function (response) {
                if (response.status === "success") {
                    showToast("User Registration Successful", "success");
    
                    setTimeout(function () {
                        window.location.href = "/login";
                    }, 2000);
                } else {
                    showToast(response.message || "Registration Failed", "error");
                }
            },
            error: function (xhr) {
                if (xhr.status === 422) {
                    let errors = xhr.responseJSON.errors;
    
                    if (errors.username) {
                        showToast("Username already exists!", "error");
                    } else {
                        showToast(
                            "Validation errors! Please check your inputs",
                            "error",
                        );
                    }
                } else {
                    showToast("Server error! Please try again later..", "error");
                }
            },
        });
    });
    
    // ============================================== User Login ===============================================
    
    $(document).on("submit", "#login-form", function (e) {
        e.preventDefault();
    
        const username = $("#login-username").val();
        const password = $("#login-password").val();
    
        $.ajax({
            url: "/login",
            type: "POST",
            data: {
                username: username,
                password: password,
            },
            dataType: "json",
            success: function (response) {
                if (response.status === "success") {
                    showToast("Login Success! Welcome " + username, "success");
    
                    setTimeout(function () {
                        window.location.replace("/dashboard");
                    }, 1000);
                } else {
                    showToast(response.message || "Login Failed", "error");
                }
            },
        });
    });
})
