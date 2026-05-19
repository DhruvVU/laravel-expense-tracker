// ==============================================================================================================
// ***************************** All the profile page related code is present here ****************************
// ==============================================================================================================

$(document).ready(function () {
    
    // ====================== User Clicks on the Edit icon ========================
    
    $(document).on("click", ".edit-button", function (e) {
        // Fade in the update button
        $(".btn-update").fadeIn().removeAttr("disabled");

        // Get the current field where the icon is clicked and enable it and mark as active
        const curr_field = $(this)
            .siblings("input")
            .removeAttr("disabled")
            .addClass("active");
    });

    // ======================== User clicks the update button ===========================
    
    $(document).on("submit", "#profile-update", function (e) {
        e.preventDefault();

        let updatedData = {};
        $(".active").each(function () {
            let fieldName = $(this).attr('name');
            let val = $(this).val();

            if (fieldName) {
                updatedData[fieldName] = val;
            }
        });

        updatedData['_token'] = $('input[name="token"]').val();

        if ($.isEmptyObject(updatedData)) {
            showToast("No changes made");
            return;
        }

        $.ajax({
            url: "profile/update",
            type: "PUT",
            data: updatedData,
            dataType: "json",
            success: function (response) {
                showToast(response.message, "success");

                $(".active").attr("disabled", true).removeClass("active");
                $(".btn-update").fadeOut().attr("disabled", true);

                if (updatedData.name) {
                    $(".user-name").text(updatedData.name);
                }
            },
            error: function (xhr) {
                if (xhr.status === 422) {
                    let errors = xhr.responseJSON.errors;
                    Object.keys(errors).forEach((key) => {
                        showToast(errors[key][0], "error");
                    });
                } else {
                    showToast("Server error! Please try again");
                }
            },
        });
    });

    // ============================ User clicks on password change button ===================================
    
    $(document).on("submit", "#change-password", function (e) {
        e.preventDefault();
        let curr_pass = $('input[name="curr_password"]').val();
        let new_pass = $('input[name="password"]').val();
        let password_confirmation = $(
            'input[name="password_confirmation"]',
        ).val();

        $.ajax({
            url: "profile/update-password",
            type: "PUT",
            data: {
                _token: $('input[name="_token"]').val(),
                curr_password: curr_pass,
                password: new_pass,
                password_confirmation: password_confirmation,
            },
            dataType: "json",
            success: function (response) {
                showToast(response.message, "success");
                $('input[name="curr_password"]').val("");
                $('input[name="password"]').val("");
                $('input[name="password_confirmation"]').val("");
            },
            error: function (xhr) {
                if (xhr.status === 422) {
                    let errors = xhr.responseJSON.errors;
                    Object.keys(errors).forEach((key) => {
                        showToast(errors[key][0], "error");
                    });
                } else {
                    showToast("Server error! Please try again");
                }
            },
        });
    });

    // ================================ Danger zone buttons ==============================

    $(document).on("click", ".btn-danger", function () {
        let action = $(this).attr("id");

        // Set config based on which button is clicked by the user
        let config =
            action === "clear"
                ? {
                      title: "Clear Expenses",
                      text: "Do you want to clear all expenses?",
                      btn: "CLEAR",
                      url: "/profile/clear-expenses",
                  }
                : {
                      title: "Delete Account",
                      text: "Do you want to delete your account?",
                      btn: "CONFIRM",
                      url: "/profile/destroy",
                  };

        const swalButtons = Swal.mixin({
            customClass: {
                confirmButton: "swal-confirm",
                cancelButton: "swal-cancel",
            },
            buttonsStyling: false,
        });

        swalButtons
            .fire({
                title: config.title,
                text: config.text,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3b82f6",
                cancelButtonColor: "#ef4444",
                confirmButtonText: config.btn,
                allowEscapeKey: true,
                background: $("html").hasClass("dark-mode")
                    ? "#13171f"
                    : "#fcfdfd",
                color: $("html").hasClass("dark-mode") ? "#fff" : "#000",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: config.url,
                        type: "DELETE",
                        data: {
                            _token: $('input[name="_token"]').val()
                        },
                        dataType: "json",
                        success: function (response) {
                            if (response.status === "success") {
                                showToast(response.message, "success");
                                if (action === 'clear') setTimeout(() => location.reload(), 1500);
                                else setTimeout(() => window.location.href = '/', 2000);
                            }
                        },
                        error: function() {
                            showToast('Action failed. Please try again', 'error');
                        }
                    });
                }
            });
    });
});
