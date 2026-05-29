// ==============================================================================================================
// ************************* Functions related to Expense data(CRUD Operations) *********************************
// ==============================================================================================================

// timer for keeping a small delay when searching the database
let searchTimer;

// default value of year to use in function calls
const year = $('.select-year').val() || new Date().getFullYear();

$(document).ready(function () {
    
    // ============================================ Add Expense(CREATE) =========================================

    $(document).on("click", "#show-btn", function () {
        $(".dashboard-container").addClass("blurred");
        $("#modal-overlay").addClass("active");
        $(".add-card").fadeIn();
    });

    // This listener works for both add and edit forms
    $(document).on("click keydown", function (e) {
        if ($(e.target).is("#cancel-btn") || e.key === "Escape") {
            // If add form is open
            $(".add-card").fadeOut();
            $("#modal-overlay").removeClass("active");

            // If edit form is open
            $(".edit-card").fadeOut();
            $("#modal-overlay").removeClass("active");
        }
    });

    $(document).on("click", "#add-btn", function (e) {
        e.preventDefault();
        const form = $(this).closest("form");
        const mode = form.data("mode");
        const category = $("#category-add").val();

        let expenseData = {
            description: form.find("#description-add").val(),
            amount: form.find("#amount-add").val(),
            category_id: category,
            expense_date: form.find("#exp_date-add").val(),
        };

        $.ajax({
            url: "/expenses/add-expense",
            type: "POST",
            data: expenseData,
            dataType: "json",
            success: function (response) {
                if (response.status === "success") {
                    $("#modal-overlay").removeClass("active");
                    showToast(response.message, response.status);

                    // Update dashboard stats and charts(if visible)
                    $("#dashboard-category").text(category);
                    if (typeof fetchBudgetStats === "function")
                        fetchBudgetStats();
                    if (typeof barChart === "function")
                        barChart(category, year);
                    if (typeof pieChart === "function")
                        pieChart(year);

                    // Reload the expense table
                    $('#expense-list').DataTable().ajax.reload(null, false);

                    $(".add-card").fadeOut();
                    
                    // Check which view is visible 
                    if ($('#lineChart').is(':visible')) {
                        $('.table-data').fadeOut();
                        lineChart('', '', year);
                    } 

                    if ($('.table-data').is(':visible')) {
                        $('#lineChart').fadeOut();
                        showTable('', '', year);
                    } 


                    $("#description-add").val("");
                    $("#amount-add").val("");
                    $("#exp_date-add").val(
                        new Date().toISOString().split("T")[0],
                    );

                    $("#bar-chart").fadeIn(200);
                } else {
                    showToast(
                        response.message || "Failed to add expense",
                        "error",
                    );
                }
            },
            error: function (xhr) {
                if (xhr.status === 422) {
                    let errors = xhr.responseJSON.errors;

                    Object.keys(errors).forEach((key) => {
                        showToast(errors[key][0], "error");
                    });
                } else {
                    showToast("An unexpected error occured!", "error");
                }
            },
        });
    });

    // ========================================== Edit Expense(UPDATE) =========================================

    // Show edit form
    $(document).on("click", "#edit-expense", function () {
        $("#modal-overlay").addClass("active");
        $(".edit-card").fadeIn();

        const table = $('#expense-list').DataTable();
        const rowData = table.row($(this).closest('tr')).data();

        if (!rowData) return;

        $("#data_id-edit").val(rowData.id);
        $("#description-edit").val(rowData.description);
        $("#amount-edit").val(rowData.amount);
        $("#exp_date-edit").val(rowData.expense_date);

        // Set category name corresponding to its id
        $('#category-edit option').filter(function() {
            return $(this).text().trim() === rowData.category;
        }).prop('selected', true);
    });

    // Update expense data
    $(document).on("click", "#edit-btn", function (e) {
        e.preventDefault();
        const form = $(this).closest("form");
        const mode = form.data("mode");
        const id = $("#data_id-edit").val();

        let updatedData = {
            id: id,
            description: form.find("#description-edit").val(),
            amount: form.find("#amount-edit").val(),
            category_id: form.find("#category-edit").val(),
            expense_date: form.find("#exp_date-edit").val(),
        };

        $.ajax({
            url: "/expenses/edit-expense/" + id,
            type: "PUT",
            data: updatedData,
            dataType: "json",
            success: function (response) {
                $(".edit-card").fadeOut();
                $("#modal-overlay").removeClass("active");

                $('#expense-list').DataTable().ajax.reload(null, false);
                showToast("Expense successfully updated!", "success");
            },
            error: function (xhr) {
                if (xhr.status === 403) {
                    showToast("Unauthorized!", "error");
                }

                if (xhr.status === 422) {
                    let errors = xhr.responseJSON.errors;

                    Object.keys(errors).forEach((key) => {
                        showToast(errors[key][0], "error");
                    });
                } else {
                    showToast("An unexpected error occured!", "error");
                }
            },
        });
    });

    // ========================================= Delete Expense(DELETE) ========================================

    $(document).on("click", "#delete-expense", function () {
        let id = $(this).data("id");
        let row = $(this).closest("tr");

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
                text: "Do you want to delete the expenses?",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3b82f6",
                cancelButtonColor: "#ef4444",
                confirmButtonText: "Yes, delete it!",
                allowEscapeKey: true,
                background: $("html").hasClass("dark-mode")
                    ? "#13171f"
                    : "#fcfdfd",
                color: $("html").hasClass("dark-mode") ? "#fff" : "#000",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    $.ajax({
                        url: "/expenses/delete-expense/" + id,
                        type: "DELETE",
                        dataType: "json",
                        success: function (response) {
                            if (response.status === "success") {
                                row.fadeOut(500, function () {
                                    $(this).remove();
                                    initExpenseTable();
                                    pieChart();
                                });
                                showToast(
                                    "Your Expense has been deleted",
                                    "success",
                                );
                            }
                        },
                        error: function (xhr) {
                            if (xhr.status === 403) {
                                showToast("Unauthorized!", "error");
                            }
                        },
                    });
                }
            });
    });

    // ============================================ Download Expense ============================================

    $(document).on("click", "#download-csv", function (e) {
        e.preventDefault();
        const swalButtons = Swal.mixin({
            customClass: {
                confirmButton: "swal-confirm",
                cancelButton: "swal-cancel",
            },
            buttonsStyling: false,
        });

        const params = {
            category: $("#filter-category").val() || "All",
            search: $("#search-input").val() || "",
            start_date: $("#start-date").val() || "",
            end_date: $("#end-date").val() || "",
        };

        const urlParams = new URLSearchParams(params).toString();

        swalButtons
            .fire({
                title: "Download File",
                text: "This file will include your current filtered results.",
                icon: "info",
                showCancelButton: true,
                confirmButtonColor: "#3b82f6",
                cancelButtonColor: "#ef4444",
                confirmButtonText: "Download",
                allowEscapeKey: true,
                background: $("html").hasClass("dark-mode")
                    ? "#13171f"
                    : "#fcfdfd",
                color: $("html").hasClass("dark-mode") ? "#fff" : "#000",
            })
            .then((result) => {
                if (result.isConfirmed) {
                    window.location.href = `/expenses/export-csv?${urlParams}`;
                    showToast("File download in progress!", "success");
                }
            });
    });
});

// ======================================== Main Function to load data =========================================

function initExpenseTable() {
    if ($.fn.DataTable.isDataTable('#expense-list')) {
        return $('#expense-list').DataTable();
    }

    const expenseTable = $('#expense-list').DataTable({
        processing: true,
        serverSide: true,
        scrollX: true,
        ajax: {
            url: '/expenses/fetch-expense',
            type: 'GET',
            data: function(d) {
                d.category = $('#filter-category').val() || 'All',
                d.start_date = $('#start-date').val() || '',
                d.end_date = $('#end-date').val() || ''
            }
        },
        columns: [
            { data: 'expense_date', name: 'expense_date' },
            { data: 'description', name: 'description' },
            {
                data: 'category',
                name: 'category',
                render: function(data, type, row) {
                    return `<span class="pill" style="background-color: ${row.category_color}">${data}</span>`
                }
            },
            {
                data: 'amount',
                name: 'amount',
                render: function (data) { return `₹${parseFloat(data).toFixed(2)}`; }
            },
            {
                data: 'id',
                name: 'action_buttons',
                className: 'text-center',
                orderable: false,
                searchable: false,
                render: function (data) {
                    return `
                        <div class="action-buttons">
                            <button class="show-edit" id="edit-expense" data-id="' . $category->id . '">
                                <i class="fa-solid fa-pen-to-square"></i></button>
                            <button class="delete-btn" id="delete-expense" data-id="' . $category->id . '">
                                <i class="fa-solid fa-trash"></i></button>
                        </div>
                    `;
                }
            }
        ],

        layout: {
            topStart: 'search',
            topEnd: 'pageLength'
        },

        drawCallback: function (settings) {
            const json = settings.json;
            if (json) {
                $('#total-amount').text(parseFloat(json.totalAmount).toFixed(2));
                $('#expenses-count').text(json.totalExpenses);
            }
        },
        language: {
            search: "_INPUT_",
            searchPlaceholder: "Search description...",
            paginate: {
                next: '<i class="fa-solid fa-chevron-right"></i>',
                previous: '<i class="fa-solid fa-chevron-left"></i>'
            }
        },
        order: [[0, 'desc']]
    });

    $('#filter-category, #start-date, #end-date').on('change', function () {
        $('#selected-category').text($('#filter-category').val());
        expenseTable.draw(); 
    });

    $('#reset-filters').on('click', function (e) {
        e.preventDefault();
        $('#filter-category').val('All');
        $('#start-date').val('');
        $('#end-date').val('');
        $('#selected-category').text('All');
        
        // Clear out the native search box input string text field too
        expenseTable.search('').draw();
    });

    return expenseTable;
}
