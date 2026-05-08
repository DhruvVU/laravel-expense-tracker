$(document).ready(function () {
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        },
    });

    // default page numberis set to 1 for loading data
    let defaultPageNo = 1;

    // timer for keeping a small delay when searching the database
    let searchTimer;

// ============================================= Add Expense(CREATE) ===========================================

    $(document).on("click", "#show-btn", function() {
        $(".dashboard-container").addClass('blurred');
        $(".add-card").fadeIn();
    })

    // This listener works for both add and edit forms
    $(document).on("click keydown", function(e) {
        if ($(e.target).is("#cancel-btn") || e.key === "Escape") {
            // If add form is open
            $(".add-card").fadeOut();
            $(".dashboard-container").removeClass('blurred'); 
            
            // If edit form is open
            $(".edit-card").fadeOut();
            $(".container").removeClass('blurred')     
        }
    })

    $(document).on("click", "#add-btn", function () {
        let description = $("#description").val();
        let amount = $("#amount").val();
        let category = $("#category").val();
        let exp_date = $("#exp_date").val();

        $("#dashboard-category").text(category);

        let expenseData = {
            description: description,
            amount: amount,
            category: category,
            expense_date: exp_date,
        };

        $.ajax({
            url: "/expenses/add-expense",
            type: "POST",
            data: expenseData,
            dataType: "json",
            success: function (response) {
                if (response.status === "success") {
                    showToast(response.message, response.status);
                    loadExpenses(
                        $("#filter-category").val(), 
                        1, 
                        "", "", "",
                        $(".select-year").val()
                    );

                    $(".add-card").fadeOut();
                    $(".dashboard-container").removeClass('blurred');

                    $("#description").val("");
                    $("#amount").val("");
                    $("#exp_date").val(new Date().toISOString().split("T")[0]);

                    $(".select-category").val(category);

                    $("#pie-chart").fadeOut(200);
                    setTimeout(function() {
                        $('#bar-chart').show();
                        barChart(category, $(".select-year").val());
                        $('#bar-chart').hide().fadeIn(200);
                    }, 50);
                    pieChart($(".select-year").val());
                } else {
                    showToast(response.message || "Failed to add expense", "error");
                }
            },
            error: function (xhr) {
                if (xhr.status === 422) {
                    let errors = xhr.responseJSON.errors;

                    Object.keys(errors).forEach(key => {
                        showToast(errors[key][0], 'error');
                    })
                } else {
                    showToast('An unexpected error occured!', 'error');
                }
            },
        });
    });

// ============================================ Search Expense(READ) ===========================================

    // ================================ Search operation filters section ================================
    
    // Clear all filters
    $(document).on("click", "#reset-filters", function() {
        $("#search-input").val('');
        $("#filter-category").val('All');
        $("#start-date").val('');
        $("#end-date").val('');

        loadExpenses('All', 1, '', '', '');
    })

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
        $('#selected-category').text($(this).val());
    });

    //  Filter based on page number 
    $(document).on("click", ".page-btn", function () {
        defaultPageNo = $(this).data("page");
        loadExpenses(
            $('#filter-category').val(),
            defaultPageNo,
            $("#search-input").val(),
            $("#start-date").val(),
            $("#end-date").val()
        );
    });

    // Filter based on month and year
    $(document).on("change", ".select-month, .select-year", function() {
        const month = $('.select-month').val();
        const category = $(".select-category").val() ?? 'All';
        const year = $(".select-year").val();

        loadExpenses(category, 1, '', '', '', year);

        if ($(".table-data").is(":visible")) {
            showTable(category, month, year);
        } else {
            $(".table-data").fadeOut();
            $("#toggle-view").text("📒 Table View");
            lineChart(category, month, year);        
        }

        if (category === 'All') {
            pieChart(year);
        } else {
            barChart(category, year);
        }
    })  

    //  Filter Data based on Date range provided 
    $(document).on("change", ".select-date", function() {
        let start_date = $("#start-date").val();
        let end_date = $("#end-date").val();
        let current_filter = $("#filter-category").val();
        let search_input = $("#search-input").val();

        if (start_date && end_date) {
            if (new Date(start_date) > new Date(end_date)) {
                showToast('End date cannot be set before start date', 'error');
                return;
            }
        }

        loadExpenses(current_filter, 1, search_input, start_date, end_date);
    })
    // ==================================== End of Filters section ====================================

    // Go back to chart from table 
    $(document).on("click", "#toggle-view", function() {
        const month = $('.select-month').val();
        const category = $(".select-category").val() ?? 'All';
        const year = $(".select-year").val();

        if ($(".table-data").is(":visible")) {
            $(".table-data").fadeOut();
    
            setTimeout(function() {
                lineChart(category, month, year);
                $("#lineChart").fadeIn();
                $("#toggle-view").text("📒 Table View");
            }, 500);
        } else {
            $("#lineChart").fadeOut();

            setTimeout(function() {
                showTable(category, month, year);
                $(".table-data").fadeIn();
                $("#toggle-view").text("📉 Chart View");
            }, 500);
        }
    }); 

    // ====================== Chart Data based on User selection ======================

    $(document).on("change", ".select-category", function () {
        let selectedCategory = $(this).val();
        const year = $(".select-year").val();
        $(".table-data").fadeOut();
        $("#toggle-view").text("📒 Table View");

        setTimeout(function() {
            if (selectedCategory === "All") {
                pieChart(year);
                
                $("#bar-chart").fadeOut()
                setTimeout(function() {
                    $("#pie-chart").fadeIn();
                },500);

                $("#dashboard-amount").text(loadExpenses(selectedCategory, 1, "", "", "", year));
                lineChart(selectedCategory, '', year);
                $("#lineChart").fadeIn();
                $(".select-month").val("");
                return;
            }

            barChart(selectedCategory, year);
            lineChart(selectedCategory, '', year);
            $("#lineChart").fadeIn();
            $("#pie-chart").fadeOut(100, function() {
                $("#bar-chart").fadeIn();
            });
            $("#dashboard-amount").text(loadExpenses(selectedCategory, 1, "", "", "", year));
            $(".select-month").val("");
        }, 500);
    });

// ============================================ Edit Expense(UPDATE) ===========================================

    // Show edit form
    $(document).on("click", ".show-edit", function () {
        $(".container").addClass("blurred");
        $(".edit-card").fadeIn();

        const id = $(this).data("id");
        const row = $(this).closest("tr");
        const description = row.find('[data-field="description"]').text();
        const amount = row.find('[data-field="amount"]').text().trim().replace(/[^\d.-]/g, '');
        const category = row.find('[data-field="category"] span').text().trim();
        const date = row.find('[data-field="expense_date"]').text();

        $("#data_id").val(id);
        $("#description").val(description);
        $("#amount").val(amount);
        $("#category").val(category);
        $("#exp_date").val(date);
    });

    // Update expense data
    $(document).on("click", "#edit-btn", function () {
        let id = $("#data_id").val();
        let description = $("#description").val();
        let amount = $("#amount").val();
        let category = $("#category").val();
        let exp_date = $("#exp_date").val();

        let updatedData = {
            id: id,
            description: description,
            amount: amount,
            category: category,
            expense_date: exp_date,
        };

        $.ajax({
            url: "/expenses/edit-expense/" + id,
            type: "PUT",
            data: updatedData,
            dataType: "json",
            success: function (response) {
                loadExpenses("All", 1, "");
                showToast("Expense successfully updated!", "success");
                $(".container").removeClass("blurred");
                $(".edit-card").fadeOut();
            },
            error: function (xhr) {
                if (xhr.status === 403) {
                    showToast("Unauthorized!", "error");
                }

                if (xhr.status === 422) {
                    let errors = xhr.responseJSON.errors;

                    Object.keys(errors).forEach(key => {
                        showToast(errors[key][0], 'error');
                    })
                } else {
                    showToast('An unexpected error occured!', 'error');
                }
            },
        });
    });

// =========================================== Delete Expense(DELETE) ==========================================

    $(document).on("click", ".delete-btn", function () {
        let id = $(this).data("id");
        let row = $(this).closest("tr");

        $(".container").addClass("blurred");
        const swalButtons = Swal.mixin({
            customClass: {
                confirmButton: "swal-confirm",
                cancelButton: "swal-cancel"
            },
            buttonsStyling: false   
        });

        swalButtons.fire({
            title: "Are you sure?",
            text: "Do you want to delete the expenses?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3b82f6",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Yes, delete it!",
            allowEscapeKey: true,
            background: $("html").hasClass("dark-mode") ? "#1e1e1e" : "#fff",
            color: $("html").hasClass("dark-mode") ? "#fff" : "#000",
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: "/expenses/delete-expense/" + id,
                    type: "DELETE",
                    dataType: "json",
                    success: function (response) {
                        if (response.status === "success") {
                            row.fadeOut(500, function () {
                                $(this).remove();
                                $(".container").removeClass("blurred");
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
            } else {
                $(".container").removeClass("blurred");
            }
        });
    });

// ============================================= User Registration =============================================

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
                    showToast(
                        response.message || "Registration Failed",
                        "error",
                    );
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
                    showToast(
                        "Server error! Please try again later..",
                        "error",
                    );
                }
            },
        });
    });

// ================================================ User Login =================================================

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

// ============================================== Responsive Menu ==============================================

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

// ============================================= Download Expense ==============================================

    $(document).on("click", "#download-csv", function (e) {
        e.preventDefault();
        $(".container").addClass("blurred");

        const swalButtons = Swal.mixin({
            customClass: {
                confirmButton: "swal-confirm",
                cancelButton: "swal-cancel"
            },
            buttonsStyling: false   
        });

        const params = {
            category: $("#filter-category").val() || 'All',
            search: $("#search-input").val() || '',
            start_date: $("#start-date").val() || '',
            end_date: $("#end-date").val() || ''
        }

        const urlParams = new URLSearchParams(params).toString();

        swalButtons.fire({
            title: "Download File",
            text: "This file will include your current filtered results.",
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#3b82f6",
            cancelButtonColor: "#ef4444",
            confirmButtonText: "Download",
            allowEscapeKey: true,
            background: $("html").hasClass("dark-mode") ? "#1e1e1e" : "#fff",
            color: $("html").hasClass("dark-mode") ? "#fff" : "#000",
        }).then((result) => {
            if (result.isConfirmed) {
                window.location.href = `/expenses/export-csv?${urlParams}`;
                $(".container").removeClass("blurred");
                showToast("File download in progress!", "success");
            } else {
                $(".container").removeClass("blurred");
            }
        });
    });
});

// ======================================== Main Function to load data =========================================

function loadExpenses(category = "All", page_no = 1, search = "", start_date = "", end_date = "", year = "") {
    $.ajax({
        url: "/expenses/fetch-expense",
        type: "GET",
        data: {
            category: category,
            page: page_no,
            search: search,
            start_date: start_date,
            end_date: end_date,
            year: year
        },
        dataType: "json",
        success: function (response) {
            let rows = "";

            if (response.status === "success") {
                // Total Amount calculation and Value printing
                $("#total-amount").text((response.total));
                $("#dashboard-amount").text(
                    (response.total),
                );

                // Handled empty response (if no data is present)
                if (response.data.length === 0) {
                    $(".select-category option:first").text(
                        "-- No data in table --",
                    );
                    $("#expense-list").html(`
                        <tr>
                            <td colspan="6" style="text-align: center; padding: 60px 20px;">
                                <div style="font-size: 50px; margin-bottom: 20px; opacity: 0.5;">🔍</div>
                                <h3 style="color: var(--text-main); margin-bottom: 10px;">No matching expenses</h3>
                                <p style="color: var(--text-main); opacity: 0.7;">Try adjusting your search or filters to find what you're looking for.</p>
                            </td>
                        </tr>
                    `);

                    $("#page-numbers").empty();
                    $("#total-amount").text("0.00");
                    $("#dashboard-category").text("No expense!");
                    return;
                } else {
                    $(".select-category option:first")
                        .text("-- Select a category --")
                        .prop('disabled', 'true');
                }

                response.data.forEach(function (item) {
                    $(".select-category option:first").text(
                        "-- Select a category --",
                    );

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
                $("#expense-list").html(rows);
            }

            // Page buttons based on number of pages
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
                if (i === 1 || i === total || (i >= current - range && i <= current + range)) {
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
        },
    });
}

// ============================================= Chart Function ================================================

// Variable for holding chart instance
let expensesPieChart;

// Pie chart for viewing entire dataset
function pieChart(year = '') {
    const colorMap = {
        Food: "#ffcc22",
        Transport: "#fb7100",
        Bills: "#abffa0",
        Entertainment: "#661572",
        Other: "#c1d5fd",
    };

    if ($("html").hasClass("dark-mode")) {
        colorMap["Food"] = "#ffc106";
        colorMap["Transport"] = "#4d2600";
        colorMap["Entertainment"] = "#4a148c";
        colorMap["Other"] = "#e7efff";
    }

    $.ajax({
        url: "/expenses/chart-data",
        type: "GET",
        data: { year: year },
        dataType: "json",
        success: function (response) {
            const canvas = document.getElementById("pie-chart");
            if (!response.data || response.data.length === 0) {
                showEmptyChartState(canvas);
                return;
            }
            if (!canvas) return;

            const labels = response.data.map((item) => item.category);
            const totals = response.data.map((item) => item.total);
            const bgColors = labels.map(
                (cat) => colorMap[cat] || colorMap["Other"],
            );

            if (expensesPieChart) {
                expensesPieChart.destroy();
            }
            
            expensesPieChart = new Chart(canvas, {
                type: "doughnut",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            data: totals,
                            backgroundColor: bgColors,
                            borderWidth: 0,
                            hoverBorderWidth: 2,
                            hoverOffset: 15
                        },
                    ],
                },
                options: {
                    onClick: (events, elements) => {
                        const curr = elements[0].index;
                        const category = expensesPieChart.data.labels[curr];
                        showTable(category, '', $(".select-year").val());
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: "bottom" },
                    },
                },
            });
        },
    });
}

// Empty Chart handler
function showEmptyChartState(canvas) {
    const ctx = canvas.getContext("2d");
    const isDark = $("html").hasClass("dark-mode");

    if (expensesPieChart) {
        expensesPieChart.destroy();
    }

    expensesPieChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["No Data Yet!"],
            datasets: [
                {
                    data: [1],
                    backgroundColor: [isDark ? "#2a2a2a" : "#f0f0f0"],
                    borderWidth: 0
                },
            ],
        },
        options: {
            cutout: "70%",
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
            },
        },
    });
}

let categoryBarChart = null;

// Bar Chart for categorical data
function barChart(category, year) {

    if (categoryBarChart instanceof Chart) {
        categoryBarChart.destroy();
        categoryBarChart = null;
    }

    const colorMap = {
        Food: "#ffcc22",
        Transport: "#fb7100",
        Bills: "#9fff8b",
        Entertainment: "#661572",
        Other: "#c1d5fd",
    };

    if ($("html").hasClass("dark-mode")) {
        colorMap["Food"] = "#ffc106";
        colorMap["Transport"] = "#4d2600";
        colorMap["Entertainment"] = "#4a148c";
        colorMap["Other"] = "#e7efff";
    }

    $.ajax({
        url: "/expenses/chart-category",
        type: "GET",
        data: { category: category, year: year },
        dataType: "json",
        success: function (response) {
            const canvas = document.getElementById("bar-chart");
            if (!canvas) return;

            const labels = [
                "Monday",
                "Tuesday",
                "Wednesday",    
                "Thursday",
                "Friday",
                "Saturday",
                "Sunday",
            ];
            const expenseData = response.data;
            const activeColor = colorMap[category] || colorMap["Other"];

            if (categoryBarChart !== null) {
                categoryBarChart.destroy();
            }

            const ctx = canvas.getContext("2d");
            categoryBarChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: `Daily Expenses for ${category}`,
                            data: expenseData,
                            backgroundColor: activeColor,
                            borderRadius: 5,
                            borderWidth: 3,
                            hoverBorderWidth: 1
                        },
                    ],
                },
                options: {
                    onClick: (events, elements) => {
                        if (elements.length > 0) {
                            const curr = elements[0].index;
                            const label = categoryBarChart.data.labels[curr];

                            // Show data for current bar
                            showTable(category, label, $(".select-year").val());
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return "₹" + value.toLocaleString("en-IN");
                                },
                            },
                        },
                    },
                    plugins: {
                        legend: { display: false },
                        toolTip: {
                            callbacks: {
                                label: function (context) {
                                    let val = context.parsed.y || 0;
                                    return (
                                        "Amount: ₹" +
                                        val.toLocaleString("en-IN")
                                    );
                                },
                            },
                        },
                    },
                },
            });
        },
        error: function (xhr) {
            showToast("Error in Bar Chart! Check console");
            console.log(xhr.response);
        },
    });
}

let expenseLineChart;
// Line Chart for displaying overall data 
function lineChart(category = 'All', month = '', year = '') {
    const activeColor = '#4e73df';

    $.ajax({
        url: '/expenses/fetch-expense',
        type: 'GET',
        data: {
            for_chart: 1,
            category: category,
            month: month,
            year: year
        },
        dataType: 'json',
        success: function(response) {
            const canvas = document.getElementById('lineChart');
            if (!canvas) return;

            const context = canvas.getContext('2d');

            if (expenseLineChart instanceof Chart) {
                expenseLineChart.destroy();
            }

            let labels, data;
            if (!response.data || response.data.length === 0) {
                labels = ["No Data"];
                data = [0];
            } else {
                labels = response.data.map((item) => item.label);
                data = response.data.map((item) => item.total);
            }

            expenseLineChart = new Chart(context, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `Expenses for ${category}` ,
                        data: data,
                        borderColor: activeColor,
                        backgroundColor: 'rgba(78, 115, 223, 0.05)',
                        pointBackgroundColor: "red",
                        tension: 0.4,
                        fill: true,
                    }]
                },
                options: {
                    onClick: (events, elements) => {
                        if (elements.length > 0) {
                            const curr = elements[0].index;
                            const label = expenseLineChart.data.labels[curr];

                            // Show data for current bar
                            showTable(category, label, $(".select-year").val());
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return "₹" + value.toLocaleString("en-IN");
                                }
                            }
                        } 
                    },
                    plugins: {
                        legend: { 
                            position: "bottom"
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => "Amount: ₹" + context.parsed.y.toLocaleString("en-IN")
                            },
                        },
                    },
                    elements: {
                        point: {
                            radius: 4,
                            hitRadius: 10,
                            hoverRadius: 6
                        }
                    }
                }
            });
        },
        error: function (xhr) {
            showToast("Error loading Line Chart! Check console.");
            console.log(xhr.response);
        },
    });
} 

// function to show table
function showTable(category, label, year) {
    $.ajax({
        url: "expenses/fetch-expense",
        type: "GET",
        data: {
            table_data : 1,
            category: category,
            label: label,
            year: year,
        },
        dataType: "json",
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
                            No expenses found for this day!
                        </td>
                    </tr>
                `;
            }

            $(".category-data").html(rows);

            setTimeout(function() {
                $(".table-data").fadeIn();
            }, 500);
        },
        error: function (xhr) {
            showToast("Error displaying data! Check console", "error");
            console.log(xhr.response);
        },
    });
}