$(document).ready(function () {
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        },
    });

    // ====================== Chart Data based on User selection ======================

    $(document).on("change", ".select-category", function () {
        let selectedCategory = $(this).val();
        const year = $(".select-year").val();
        $(".table-data").fadeOut();
        $("#toggle-view").text("📒 Table View");

        setTimeout(function () {
            if (selectedCategory === "All") {
                pieChart(year);
                $("#pie-chart").fadeIn();

                $("#dashboard-amount").text(
                    loadExpenses(selectedCategory, 1, "", "", "", year),
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
                loadExpenses(selectedCategory, 1, "", "", "", year),
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
            Swal.fire({
                title: "Your monthly budget has been saved!",
                icon: "success",
                background: $("html").hasClass("dark-mode")
                    ? "#13171f"
                    : "#fff",
                color: $("html").hasClass("dark-mode") ? "#fff" : "#000",
            });

            fetchBudgetStats();
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
});

// function to show table
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
        beforeSend: function () {
            showTableLoader();
        },
        success: function (response) {
            $("#lineChart").fadeOut();
            $("#toggle-view").text("📉 Chart View");
            let rows = "";

            if (response.data && response.data.length > 0) {
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
                        </tr>
                    `;
                });
                rows += ` 
                    <tr>
                        <td colspan="6" style="text-align:center; font-weight: 600">
                            To view full data, visit the history page 
                                <a href="/history" style="color: #6aa0f7; text-decoration: none">
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

            setTimeout(function () {
                $(".category-data").html(rows);
                $(".table-data").show();
            }, 500);
        },
        error: function (xhr) {
            showToast("Error displaying data! Check console", "error");
            console.log(xhr.response);
        },
    });
}

function showTableLoader() {
    let loaderRows = "";
    for (let i = 0; i < 5; i++) {
        loaderRows += `
            <tr>
                <td><div class="skeleton-text skeleton-effect-wave">Date</div></td>
                <td><div class="skeleton-text skeleton-effect-wave">Description goes here</div></td>
                <td><div class="skeleton-block skeleton-effect-wave" style="width:60px; height:24px; border-radius:20px;"></div></td>
                <td><div class="skeleton-text skeleton-effect-wave">000.00</div></td>
            </tr>
        `;
    }
    $("#expense-list").html(loaderRows);
    $(".category-data").html(loaderRows);
}
