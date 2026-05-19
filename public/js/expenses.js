// ==============================================================================================================
// ************************* Functions related to Expense data(CRUD Operations) *********************************
// ==============================================================================================================

// default page numberis set to 1 for loading data
let defaultPageNo = 1;

// timer for keeping a small delay when searching the database
let searchTimer;

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
            category: category,
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

                    $("#dashboard-category").text(category);
                    if (typeof fetchBudgetStats === "function")
                        fetchBudgetStats();
                    if (typeof barChart === "function")
                        barChart(category, $(".select-year").val());
                    if (typeof pieChart === "function")
                        pieChart($(".select-year").val());
                    loadExpenses(
                        $("#filter-category").val(),
                        1,
                        "",
                        "",
                        "",
                        $(".select-year").val(),
                    );

                    $(".add-card").fadeOut();

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

    // ========================================== Search Expense(READ) =========================================

    // ======================== Search operation filters section ============================

    // Clear all filters
    $(document).on("click", "#reset-filters", function () {
        $("#search-input").val("");
        $("#filter-category").val("All");
        $("#start-date").val("");
        $("#end-date").val("");

        loadExpenses("All", 1, "", "", "");
    });

    //  Filter based on name
    $(document).on("input", "#search-input", function () {
        let searchVal = $(this).val();
        clearTimeout(searchTimer);

        // send request after a small 300ms delay
        searchTimer = setTimeout(function () {
            loadExpenses($("#filter-category").val(), defaultPageNo, searchVal);
        }, 300);
    });

    //  Filter based on category
    $(document).on("change", "#filter-category", function () {
        defaultPageNo = 1;
        loadExpenses($(this).val(), defaultPageNo, $("#search-input").val());
        $("#selected-category").text($(this).val());
    });

    //  Filter based on page number
    $(document).on("click", ".page-btn", function () {
        defaultPageNo = $(this).data("page");
        loadExpenses(
            $("#filter-category").val(),
            defaultPageNo,
            $("#search-input").val(),
            $("#start-date").val(),
            $("#end-date").val(),
        );
    });

    // Filter based on month
    $(document).on("change", ".select-month", function () {
        const month = $(".select-month").val();
        const category = $(".select-category").val() ?? "All";
        const year = $(".select-year").val();

        loadExpenses(category, 1, "", "", "", year);

        if ($(".table-data").is(":visible")) {
            showTable(category, month, year);
        } else {
            $(".table-data").fadeOut();
            $("#toggle-view").text("📒 Table View");
            lineChart(category, month, year);
        }

        if (category === "All") {
            pieChart(year);
        } else {
            barChart(category, year);
        }
    });

    //  Filter Data based on Date range provided
    $(document).on("change", ".select-date", function () {
        let start_date = $("#start-date").val();
        let end_date = $("#end-date").val();
        let current_filter = $("#filter-category").val();
        let search_input = $("#search-input").val();

        if (start_date && end_date) {
            if (new Date(start_date) > new Date(end_date)) {
                showToast("End date cannot be set before start date", "error");
                return;
            }
        }

        loadExpenses(current_filter, 1, search_input, start_date, end_date);
    });
    // ================== End of Filters section =========================

    // ========================================== Edit Expense(UPDATE) =========================================

    // Show edit form
    $(document).on("click", ".show-edit", function () {
        $("#modal-overlay").addClass("active");
        $(".edit-card").fadeIn();

        const id = $(this).data("id");
        const row = $(this).closest("tr");
        const description = row.find('[data-field="description"]').text();
        const amount = row
            .find('[data-field="amount"]')
            .text()
            .trim()
            .replace(/[^\d.-]/g, "");
        const category = row.find('[data-field="category"] span').text().trim();
        const date = row.find('[data-field="expense_date"]').text();

        $("#data_id-edit").val(id);
        $("#description-edit").val(description);
        $("#amount-edit").val(amount);
        $("#category-edit").val(category);
        $("#exp_date-edit").val(date);
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
            category: form.find("#category-edit").val(),
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

                loadExpenses("All", 1, "");
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

    $(document).on("click", ".delete-btn", function () {
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
                                    loadExpenses(
                                        $("#filter-category").val(),
                                        defaultPageNo,
                                        $("#search-input").val(),
                                    );
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

function loadExpenses(
    category = "All",
    page_no = 1,
    search = "",
    start_date = "",
    end_date = "",
    year = "",
) {
    $.ajax({
        url: "/expenses/fetch-expense",
        type: "GET",
        data: {
            category: category,
            page: page_no,
            search: search,
            start_date: start_date,
            end_date: end_date,
            year: year,
        },
        dataType: "json",
        beforeSend: function () {
            showTableLoader();
        },
        success: function (response) {
            if (response.status === "success") {
                // Total Amount calculation and Value printing
                $("#total-amount").text(response.total);
                $("#dashboard-amount").text(response.total);

                // Call functions for table data and page numbers
                tableData(response);
                renderPages(response);

                // Handled empty response (if no data is present)
                if (response.data.length === 0) {
                    $(".select-category option:first").text(
                        "-- No data in table --",
                    );

                    $("#page-numbers").empty();
                    $("#total-amount").text("0.00");
                    $("#dashboard-category").text("No expense!");
                    return;
                } else {
                    $(".select-category option:first")
                        .text("-- Select a category --")
                        .prop("disabled", "true");
                }

                $("#expenses-count").text(response.total_expenses);
                response.data.forEach(function (item) {
                    $(".select-category option:first").text(
                        "-- Select a category --",
                    );
                });
            }
        },
    });
}

// Separate function to populate and display table
function tableData(response) {
    let rows = "";
    if (response.status === "success") {
        // Handled empty response (if no data is present)
        if (response.data.length === 0) {
            $("#expense-list").html(`
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 60px 20px;">
                                <div style="font-size: 50px; margin-bottom: 20px; opacity: 0.5;">🔍</div>
                                <h3 style="color: var(--text-main); margin-bottom: 10px;">No matching expenses</h3>
                                <p style="color: var(--text-main); opacity: 0.7;">Try adjusting your search or filters to find what you're looking for.</p>
                            </td>
                        </tr>
                    `);
            return;
        }

        response.data.forEach(function (item) {
            let categoryColor = item.category
                .toLowerCase()
                .replace(/\s+/g, "-");

            rows += `
                        <tr>
                            <td data-field="expense_date">${item.expense_date}</td>
                            <td data-field="description">${item.description}</td>
                            <td data-field="category">
                                <span class="pill pill-${categoryColor}">${item.category}</span>
                            </td>
                            <td data-field="amount">₹${item.amount}</td>
                            <td><button class="show-edit" data-id="${item.id}">
                                <i class="fa-solid fa-pen-to-square"></i>Edit</button>
                            </td>
                            <td><button class="delete-btn" data-id="${item.id}">
                                <i class="fa-solid fa-trash"></i> Delete</button>
                            </td>
                        </tr>
                    `;
        });
        setTimeout(function () {
            $("#expense-list").html(rows);
        }, 500);
    }
}

function renderPages(response) {
    $("#page-numbers").empty();

    // Previous Button
    let prevButton = response.curr_page <= 1 ? "disabled" : "";
    $("#page-numbers").append(
        `<button class="page-btn nav-btn" data-page="${Number(response.curr_page) - 1}" 
                ${prevButton}>&laquo; Prev</button>`,
    );

    // Range of page numbers to be shown
    let range = 1;
    let total = response.pages;
    let current = Number(response.curr_page);
    for (let i = 1; i <= total; i++) {
        // Deciding which page numbers to display based on range
        if (
            i === 1 ||
            i === total ||
            (i >= current - range && i <= current + range)
        ) {
            let active = i === current ? "active" : "";

            $("#page-numbers").append(
                `<button class="page-btn ${active}" data-page="${i}">${i}</button>`,
            );
        }

        // Adding dots for remaining page numbers
        else if (i === current - range - 1 || i === current + range + 1) {
            $("#page-numbers").append('<span class="dots">...</span>');
        }
    }

    // Next Button
    let nextButton = response.curr_page >= response.pages ? "disabled" : "";
    $("#page-numbers").append(
        `<button class="page-btn nav-btn" data-page="${Number(response.curr_page) + 1}" ${nextButton}>Next &raquo</button>`,
    );
}
