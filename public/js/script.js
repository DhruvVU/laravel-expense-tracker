// =========================================================================================================
// **********All the general required functions and some basic actions for the website is present here***********
// ==============================================================================================================

$(document).ready(function () {
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        },
    });

    const date = new Date();
    // Set the monthly budget label to the current month
    const month = date.toLocaleString("default", { month: "long" });
    $("#curr-month").text("(" + month + ")");

    // Set the previous month label to previous month based on year
    date.setMonth(date.getMonth() - 1);
    const prev_month = date.toLocaleString("default", { month: "short" });
    $("#prev-month").text(" (" + prev_month + ")");
    
    // Routing between profile and dashboard page and changing the icon accordingly
    $(".nav-profile-link").on("click", function (e) {
        let icon = $(this).find("i");
        
        // Check if the icon is already the house
        if (icon.hasClass("fa-house")) {
            e.preventDefault(); 
            window.location.href = "/dashboard";    
        } else {
            // If it's still the user icon, let the link proceed to profile
            icon.removeClass("fa-user").addClass("fa-house");
        }
    });
    
    // ====================== Chart Data based on User selection ======================
    
    $(document).on("change", ".select-category", function () {
        let selectedCategory = $(this).val();
        const year = $(".select-year").val();
        $(".table-data").fadeOut();
        $("#toggle-view").text("📒 View Table");

        setTimeout(function () {
            if (selectedCategory === "All") {
                pieChart(year);
                $("#pie-chart").fadeIn();

                $("#dashboard-amount").text(
                    fetchBudgetStats(selectedCategory, year),
                );
                lineChart(selectedCategory, "", year);
                $("#lineChart").fadeIn();
                $(".select-month").val("");
                return;
            }

            $("#curr-category").text(selectedCategory);
            barChart(selectedCategory, year);
            lineChart(selectedCategory, "", year);
            $("#lineChart").fadeIn();
            $("#dashboard-amount").text(
                fetchBudgetStats(selectedCategory, year),
            );
            $(".select-month").val("");
        }, 500);
    });

    // Edit budget
    $(document).on("click", "#edit-budget", function () {
        let currentBudget = $("#budget-total")
            .text()
            .replace("₹", "")
            .replace(",", "");
        Swal.fire({
            title: "Set Monthly Budget",
            input: "number",
            inputValue: currentBudget,
            showCancelButton: true,
            allowEscapeKey: true,
            confirmButtonText: "Update Budget",
            confirmButtonColor: "#3b82f6",
            background: $("html").hasClass("dark-mode") ? "#13171f" : "#fff",
            color: $("html").hasClass("dark-mode") ? "#fff" : "#000",
            inputValidator: (value) => {
                if (!value || value < 0) {
                    return "Please enter a valid positive amount!";
                }
            },
            preConfirm: (newBudget) => {
                return $.ajax({
                    url: "/dashboard/set-budget",
                    method: "patch",
                    data: {
                        _token: $('meta[name="csrf-token"]').attr("content"),
                        monthly_budget: newBudget,
                    },
                }).catch((error) => {
                    Swal.showValidationMessage(
                        `Request failed: ${error.responseJSON.message}`,
                    );
                });
            },
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "Your monthly budget has been saved!",
                    icon: "success",
                    background: $("html").hasClass("dark-mode")
                        ? "#13171f"
                        : "#fff",
                    color: $("html").hasClass("dark-mode") ? "#fff" : "#000",
                });

                fetchBudgetStats();
            }
        });
    });

    // ============================================ Responsive Menu ============================================

    $("#mobile-toggle").click(function (e) {
        e.preventDefault();
        $(".sidebar").toggleClass("active");
        $(this).toggleClass("open");
    });

    $(".nav-link").click(function () {
        if ($(window).width() <= 768) {
            $(".sidebar").removeClass("active");
        }
    });

    // ================================= Dynamic Category selector using Select2 ================================
    $('.custom-category').select2({
        placeholder: 'Choose a category...',
        allowClear: true
    });

    $(document).on('keyup', '.select2-search__field', function() {

        // Check which type of form is open (add/edit)
        const formMode = $('#category-add').data('select2') ?? $('#category-add').data('select2').isOpen();
        const mode = formMode ? 'add' : 'edit';

        const searchTerm = $(this).val().trim();
        const searchResults = $('.select2-results__options');

        // Check if Select2 is currently displaying its default "No results found" row
        const noResultsFound = searchResults.find('.select2-results__message').length > 0;
        $('.inline-append').remove();

        if (noResultsFound && searchTerm.length > 0) {
            searchResults.append(`
                <li class="select2-results__option inline-append"
                    style="color: #3b82f6; font-weight: 600; cursor: pointer; border-top: 1px solid var(--border-color); padding: 12px 16px;"
                ><i class="fa-solid fa-plus-circle"></i> Add ${searchTerm} as a new category?
                </li>
            `);

            $('.inline-append').on('click', function() {
                // Save the category name in our hidden field
                $(`#category-name-${mode}`).val(searchTerm);

                // Slide down the color picker for the category smoothly
                $(`#category-wrapper-${mode}`).slideDown(200);

                $(`#category-${mode}`).select2('close');
            });
        }
    });
});

// ======================== Function to show table data on dashboard page ========================

function showTable(category, label, year) {
    $.ajax({
        url: "expenses/fetch-expense",
        type: "GET",
        data: {
            table_data: 1,
            category: category,
            label: label,
            year: year,
        },
        dataType: "json",
        success: function (response) {
            $("#lineChart").fadeOut();
            $("#toggle-view").text("📉 View Chart");
            let rows = "";

            if (response.data && response.data.length > 0) {
                response.data.forEach(function (item) {
                    rows += `
                        <tr>
                            <td data-field="expense_date">${item.expense_date}</td>
                            <td data-field="description">${item.description}</td>
                            <td data-field="category">
                                <span class="pill" style="background-color:${item.category_color}">${item.category}</span>
                            </td>
                            <td data-field="amount">₹${item.amount}</td>
                        </tr>
                    `;
                });
                rows += ` 
                    <tr>
                        <td colspan="6" style="text-align:center; font-weight: 600">
                            To view full data, click here 
                                <a href="/expenses" style="color: #6aa0f7; text-decoration: none">
                                    ➡️History
                                </a>
                        </td>
                    </tr>
                `;
            } else {
                rows = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 60px 20px;">
                            No expenses found!
                        </td>
                    </tr>
                `;
            }

            $(".category-data").html(rows);
            $(".table-data").show();
        },
        error: function (xhr) {
            showToast("Error displaying data! Check console", "error");
            console.log(xhr.response);
        },
    });
}
