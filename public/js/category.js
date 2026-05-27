$(document).ready(function() {

    // =======================================================================================================
    // ******************** Add a new category ********************
    // =======================================================================================================

    $('#categoryForm').on('submit', function(e) {
        e.preventDefault();

        // Hide any previous validation errors
        $('.custom-errors-text').hide();
        $('.custom-input-field').removeClass('input-has-error');

        const name = $('#category_name').val();
        const color = $('#category_color').val();

        $.ajax({
            url: '/category/add',
            type: 'POST',
            data: {
                name: name,
                color: color,
            },
            dataType: 'json',
            beforeSend: function() {
                $('#save-category-button').prop('disabled', true).text('Saving...');
                showTableLoader();
            },
            success: function(response) {
                if (response.status === 'success') {
                    showToast(response.message, 'success');

                    $('#empty-state-msg').remove();

                    const date = new Date().toISOString().split('T')[0];

                    const newRow = `
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 14px 12px; font-weight: 600;">${response.data.name}</td>
                            <td style="padding: 14px 12px;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${response.data.color}; display: inline-block;"></span>
                                    <code>${response.data.color}</code>
                                </div>
                            </td>
                            <td style="padding: 14px 12px;">0</td>
                            <td style="padding: 14px 12px;" class="color-picker-hint">${date}</td>
                        </tr>
                    `;

                    $('#categories-table-body').append(newRow);

                    $('#category_name').val('');
                    $('#category_color').val('#3498db');
                }
            },
            error: function(xhr) {
                if (xhr.status === 422) {
                    const errors = xhr.responseJSON.errors;
                                  
                    if (errors.name) {
                        $('.category_name').addClass('input-has-error');
                        $('#name-error-msg').text(errors.name[0]).show();
                        showToast(errors.name[0], 'error');
                    }
                    if (errors.color) {
                        $('#color-error-msg').text(errors.color[0]).show();
                    }
                } else {
                    // General fallback catch-all message
                    showToast('Something went wrong. Please try again.', 'error');
                }
            },
            complete: function () {
                // Restore button functionality state
                $('#save-category-btn').prop('disabled', false).text('Save Category');
            }
        });
    });

    // ================================= Add category using the expense form ==========================
    
    // Close the form is user clicks on that button
    $(document).on('click', '#close-category-btn', function(e) {
        e.preventDefault();
        const mode = $(this).data('mode');

        $(`#category-wrapper-${mode}`).slideUp(200);
        $(`#category-name-${mode}`).val('');
    });

    // Saving a new category 
    $(document).on('click', '.confirm-category-btn', function(e) {
        e.preventDefault();
        const btn = $(this);
        const mode = btn.data('mode');

        const catName = $(`#category-name-${mode}`).val().trim();
        const catColor = $(`#category-color-${mode}`).val();
        const catSelector = $(`#category-${mode}`);

        $.ajax({
            url: '/category/add',
            type: 'POST',
            data: {
                name: catName,
                color: catColor
            },
            beforeSend: function() {
                btn.prop('disabled', true).text('Saving...');
            },
            success: function(response) {
                if (response.status === 'success') {
                    showToast(response.message, 'success');
                    const catData = response.data || response.category || response;
                    const newOption = new Option(catData.name, catData.id, true, true);
                    
                    catSelector.append(newOption).trigger('change');
                    $(`#category-wrapper-${mode}`).slideUp(200);
                    $(`#category-name-${mode}`).val('');
                }
            },
            error: function(xhr) {
                if (xhr.status === 422) {
                    showToast(xhr.responseJSON.errors.name ? xhr.responseJSON.errors.name[0] : 'Failed to add Category', 'error');
                } else {
                    showToast('Something went wrong. Please try again', 'error');
                }
            },
            complete: function() {
                btn.prop('disabled', false).text('Confirm');
            }
        })
    });

    // =======================================================================================================
    // ******************** Edit category ********************
    // =======================================================================================================

    $(document).on('click', '#edit-category', function(e) {
        e.preventDefault();
        
        const btn = $(this);
        let row = btn.closest('tr');
        const categoryId = btn.data('id');
        const nameRow = row.find('td:nth-child(1)');
        const colorRow = row.find('td:nth-child(2)');

        if (row.hasClass('editing-row')) {
            const name = row.find('.name-input').val().trim();
            const color = row.find('.color-input').val();

            $.ajax({
                url: `/category/update/${categoryId}`,
                type: 'PUT',
                data: {
                    name: name,
                    color: color
                },
                dataType: 'json',
                success: function(response) {
                    if (response.status === 'success') {
                        showToast(response.message, 'success');

                        nameRow.html(response.data.name);
                        colorRow.html(`
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${response.data.color}; display: inline-block;"></span>
                                <code>${response.data.color}</code>
                            </div>
                        `);

                        btn.html('<i class="fa-solid fa-pen-to-square"></i>Edit').removeClass('save-inline-btn');
                        row.find('.cancel-inline-btn').remove();
                        row.removeClass('editing-row');
                    }
                },
                error: function(xhr) {
                    if (xhr.status === 422) {
                        showToast(xhr.responseJSON.errors.name ? xhr.responseJSON.errors.name[0] : 'Validation Failed!', 'error');
                    } else {
                        showToast('Failed to update category', 'error');
                    }
                }
            });
            return;
        }

        row.addClass('editing-row');

        const curr_name = nameRow.text().trim();
        const curr_color = colorRow.text().trim();

        row.data('original-name', curr_name);
        row.data('original-color', curr_color);

        nameRow.html(`
            <input type="text" class="custom-input-field name-input" value="${curr_name}" style="margin: 0; padding: 6px 12px; border-radius: 6px;">
        `);
        colorRow.html(`
            <input type="color" class="custom-color-circle color-input" value="${curr_color}">
        `);

        btn.html('<i class="fa-solid fa-floppy-disk"></i> Save').addClass('save-inline-btn');
        btn.after(`
            <button class="delete-btn cancel-inline-btn" style="margin: 5px auto;">
                <i class="fa-solid fa-xmark"></i> Cancel
            </button>
        `);
    });

    // Button for cancelling the input update
    $(document).on('click', '.cancel-inline-btn', function(e) {
        e.preventDefault();
        const btn = $(this);
        const row = btn.closest('tr');
        const editBtn = row.find('#edit-category');

        const originalName = row.data('original-name');
        const originalColor = row.data('original-color');

        row.find('td:nth-child(1)').html(originalName);
        row.find('td:nth-child(2)').html(`
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ${originalColor}; display: inline-block;"></span>
                <code>${originalColor}</code>
            </div>
        `);

        editBtn.html('<i class="fa-solid fa-pen-to-square"></i>Edit').removeClass('save-inline-btn');
        row.removeClass('editing-row');
        btn.remove();
    });

    // =======================================================================================================
    // ******************** Delete category ********************
    // =======================================================================================================

    $(document).on('click', '#delete-category', function(e) {
        e.preventDefault();

        const btn = $(this);
        let categoryId = btn.data("id");
        let row = btn.closest("tr");

        const swalButtons = Swal.mixin({
            customClass: {
                confirmButton: "swal-confirm",
                cancelButton: "swal-cancel",
            },
            buttonsStyling: false,
        });

        swalButtons
            .fire({
                title: "Are you sure?",
                text: "Do you want to delete the category?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3b82f6",
                cancelButtonColor: "#ef4444",
                confirmButtonText: "CONFIRM",
                allowEscapeKey: true,
                background: $("html").hasClass("dark-mode")
                    ? "#13171f"
                    : "#fcfdfd",
                color: $("html").hasClass("dark-mode") ? "#fff" : "#000",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: `/category/delete/${categoryId}`,
                        type: "DELETE",
                        dataType: "json",
                        success: function (response) {
                            if (response.status === "success") {
                                showToast(response.message, "success");
                                row.fadeOut(500, function () {
                                    $(this).remove();
                                });
                                if ($('#categories-table-body tr').length === 0) {
                                    $('#categories-table-body').html(`
                                        <tr id="empty-state-row">
                                            <td colspan="4" style="padding: 24px; text-align: center;" class="color-picker-hint">
                                                No custom tracking categories found.
                                            </td>
                                        </tr>   
                                    `);
                                }
                            }
                        },
                        error: function (xhr) {
                            if (xhr.status === 422) {
                                showToast("Protected Resource!", xhr.responseJSON.message, "error");
                            } else {
                                showToast('Something went wrong', 'error')
                            }
                        },
                    });
                }
            });
    })
});