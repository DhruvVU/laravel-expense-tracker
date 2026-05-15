$(document).ready(function() {

    // ====================== User Clicks on the Edit icon ========================
    $(document).on('click', '.edit-button',function(e) {
        // Fade in the update button
        $('.btn-update').fadeIn().removeAttr('disabled');

        // Get the current field where the icon is clicked and enable it and mark as active
        const curr_field = $(this).siblings('input').removeAttr('disabled').addClass('active');
    });

    // ======================== User clicks the update button ===========================
    $(document).on('submit', '#profile-update', function(e) {
        e.preventDefault();

        let updatedData = {};
        $('.active').each(function() {
            let fieldName = $(this).attr('name');
            let val = $(this).val();

            if (fieldName) {
                updatedData[fieldName] = val;
            }
        });

        if ($.isEmptyObject(updatedData)) {
            showToast('No changes made');
            return;
        }

        $.ajax({
            url: 'profile/update',
            type: 'PUT',
            data: updatedData,
            dataType: 'json',
            success: function(response) {
                showToast(response.message, 'success');

                $('.active').attr('disabled', true).removeClass('active');
                $('.btn-update').fadeOut().attr('disabled', true);

                if (updatedData.name) {
                    $('.user-name').text(updatedData.name);
                }
            },
            error: function(xhr) {
                if (xhr.status === 422) {
                    let error = xhr.responseJson.errors;
                    Object.keys(errors).forEach(key => {
                        showToast(errors[key][0], 'error');
                    });
                } else {
                    showToast('Server error! Please try again');
                }
            }
        })
    })
})