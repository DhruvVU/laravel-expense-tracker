$(document).ready(function () {
    $.ajaxSetup({
        headers: {
            "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
        },
    });

    setTimeout(() => {
        $("body").addClass("theme-initialized");
    }, 100);

    // default page numberis set to 1 for loading data
    let defaultPageNo = 1;

    // timer for keeping a small delay when searching the database
    let searchTimer;

    // Get current theme from localstorage
    const currTheme = localStorage.getItem("theme");

    // Check the theme user selected last time
    if (currTheme === "dark") {
        $("html").addClass("dark-mode");
        $("#checkbox").prop("checked", true);
    }

    // Dark mode toggle
    $("#checkbox").on("change", function () {
        if ($(this).is(":checked")) {
            $("html").addClass("dark-mode");
            localStorage.setItem("theme", "dark");
        } else {
            $("html").removeClass("dark-mode");
            localStorage.setItem("theme", "light");
        }

        if (typeof pieChart === "function") {
            pieChart();
        }

        if (typeof barChart === "function") {
            barChart($(".select-category").val());
        }

        if (typeof lineChart === "function") {
            lineChart($(".select-category").val(), $(".select-month").val());
        }
    });

// ============================================= Add Expense(CREATE) ===========================================

    $(document).on("click", "#show-btn", function() {
        $(".dashboard-container").addClass('blurred');
        $(".add-card").fadeIn();
    })

    $(document).on("click keydown", function(e) {
        if ($(e.target).is("#close-form") || e.key === "Escape") {
            $(".add-card").fadeOut();
            $(".dashboard-container").removeClass('blurred'); 
            $(document).off("keydown");           
        }
    })

    $(document).on("click", "#add-btn", function () {
        //console.log("Button clicks");
        let description = $("#description").val();
        let amount = $("#amount").val();
        let category = $("#category").val();
        let exp_date = $("#exp_date").val();
        let check_date = new Date(exp_date);

        let curr_Date = new Date();
        check_date.setHours(0, 0, 0, 0);
        curr_Date.setHours(0, 0, 0, 0);

        if (check_date > curr_Date) {
            showToast("You cannot select a future date!");
            return;
        }

        $("#dashboard-category").text(category);

        // console.log(description);
        // console.log(amount);
        // console.log(category);
        // console.log(exp_date);

        let expenseData = {
            description: description,
            amount: amount,
            category: category,
            expense_date: exp_date,
        };

        if (expenseData.description === "" || expenseData.amount === "") {
            showToast("Please fill in Description and Amount", "error");
            return;
        }

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
                        defaultPageNo,
                        $("#search-input").val(),
                    );

                    $(".add-card").fadeOut();
                    $(".dashboard-container").removeClass('blurred');

                    $("#description").val("");
                    $("#amount").val("");
                    $("#exp_date").val(new Date().toISOString().split("T")[0]);

                    $(".select-category").val(category);

                    $("#expenseChart").fadeOut(200);
                    setTimeout(function() {
                        $('#categoryChart').show();
                        barChart(category);
                        $('#categoryChart').hide().fadeIn(200);
                    }, 50);
                } else {
                    showToast(response.message || "Failed to add expense", "error");
                }
                pieChart();
            },
            error: function (xhr, status, error) {
                showToast("Server error. Please try again", "error");
                console.log("Status:", status);
                console.log("Error:", error);
                console.log("Raw Server Response:", xhr.responseText);
            },
        });
    });

// ============================================ Search Expense(READ) ===========================================

    $(document).on("input", "#search-input", function () {
        let searchVal = $(this).val();
        clearTimeout(searchTimer);

        // send request after a small 300ms delay
        searchTimer = setTimeout(function () {
            loadExpenses($("#filter-category").val(), defaultPageNo, searchVal);
        }, 300);
    });

    // ===================== Filter Expense =====================

    $(document).on("change", "#filter-category", function () {
        defaultPageNo = 1;
        loadExpenses($(this).val(), defaultPageNo, $("#search-input").val());
        $('#selected-category').text($(this).val());
    });

    // ================= Fetch Current Page Data =================

    $(document).on("click", ".page-btn", function () {
        defaultPageNo = $(this).data("page");
        loadExpenses(
            $('#filter-category').val(),
            defaultPageNo,
            $("#search-input").val(),
        );
    });

    // ===================== Fetch Monthly Line Chart data =====================
    $(document).on("change", ".select-month", function() {
        const selectedMonth = $('.select-month').val();
        const selectedCategory = $(".select-category").val() ?? 'All';
        $('.table-data').fadeOut();
        lineChart(selectedCategory, selectedMonth);        
    })  
    
    // Go back to chart from table 
    $(document).on("click", "#back-to-chart", function() {
        $(".table-data").fadeOut();
        setTimeout(function() {
            $("#lineChart").fadeIn();
            $(".back-button").fadeOut();
        }, 500);
    }); 

    // ====================== Chart Data based on User selection ======================

    $(document).on("change", ".select-category", function () {
        let selectedCategory = $(this).val();
        $(".table-data").fadeOut();

        setTimeout(function() {
            if (selectedCategory === "All") {
                pieChart();
                
                $("#categoryChart").fadeOut()
                setTimeout(function() {
                    $("#expenseChart").fadeIn();
                },500);

                $("#dashboard-amount").text(loadExpenses(selectedCategory, 1, ""));
                lineChart(selectedCategory, '');
                $("#lineChart").fadeIn();
                $(".select-month").val("");
                return;
            }

            barChart(selectedCategory);
            lineChart(selectedCategory, '');
            $("#lineChart").fadeIn();
            $("#expenseChart").fadeOut(100, function() {
                $("#categoryChart").fadeIn();
            });
            $("#dashboard-amount").text(loadExpenses(selectedCategory, 1, ""));
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

    $(document).on("click keydown", function (e) {
        if ($(e.target).is("#cancel-btn") || e.key === "Escape") {
            $(".container").removeClass("blurred");
            $(".edit-card").fadeOut();
            $(document).off("keydown");
        }
    });

    // Update expense data
    $(document).on("click", "#edit-btn", function () {
        let id = $("#data_id").val();
        let description = $("#description").val();
        let amount = $("#amount").val();
        let category = $("#category").val();
        let exp_date = $("#exp_date").val();
        let check_date = new Date(exp_date);

        let curr_Date = new Date();
        check_date.setHours(0, 0, 0, 0);
        curr_Date.setHours(0, 0, 0, 0);

        if (check_date > curr_Date) {
            showToast("You cannot select a future date!");
            return;
        }

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

        swalButtons.fire({
            title: "Download File",
            text: "Do you want to download the csv file?",
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
                window.location.href = "/expenses/export-csv";
                $(".container").removeClass("blurred");
                showToast("File download in progress!", "success");
            } else {
                $(".container").removeClass("blurred");
            }
        });
    });
});

// =============================================== Toast Function ==============================================

function showToast(message, type) {
    // Set Toast class based on type of message
    let toastClass = type === "success" ? "toast-success" : "toast-error";
    let toast = $(`<div class="toast ${toastClass}">${message}</div>`);

    $("#toast-container").append(toast);

    // Hide toast after 3 seconds
    setTimeout(function () {
        toast.addClass("hide");

        // Slide out animation
        setTimeout(function () {
            toast.remove();
        }, 500);
    }, 3000);
}

// ======================================== Main Function to load data =========================================

function loadExpenses(category = "All", page_no = 1, search = "") {
    $.ajax({
        url: "/expenses/fetch-expense",
        type: "GET",
        data: {
            category: category,
            page: page_no,
            search: search,
        },
        dataType: "json",
        success: function (response) {
            let rows = "";

            if (response.status === "success") {
                // Total Amount calculation and Value printing
                $("#total-amount").text(parseFloat(response.total).toFixed(2));
                $("#dashboard-amount").text(
                    parseFloat(response.total).toFixed(2),
                );

                // Handled empty response (if no data is present)
                if (response.data.length === 0) {
                    $(".select-category").prop("disabled", true);
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
                    $(".select-category").prop("disabled", false);
                    $(".select-category option:first")
                        .text("-- Select a category --")
                        .prop('disabled', 'true');
                }

                response.data.forEach(function (item) {
                    $(".select-category option:first").text(
                        "-- Select a category --",
                    );
                    $(".select-category").prop("disabled", false);

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
function pieChart() {
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
        dataType: "json",
        success: function (response) {
            const canvas = document.getElementById("expenseChart");
            if (!response.data || response.data.length === 0) {
                showEmptyChartState(canvas);
                return;
            }
            if (!canvas) return;

            const labels = response.data.map((item) => item.category);
            const totals = response.data.map((item) => parseFloat(item.total));
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
                        showTable('', category);
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
function barChart(category) {
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
        data: { category: category },
        dataType: "json",
        success: function (response) {
            const canvas = document.getElementById("categoryChart");
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
                            borderWidth: 0,
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
                            showTable(label, category);
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
function lineChart(category = 'All', month = '') {
    const activeColor = '#4e73df';
    let textColor = 'black';

    if ($("html").hasClass("dark-mode")) {
        textColor = 'white';
    }   

    $.ajax({
        url: '/expenses/fetch-expense',
        type: 'GET',
        data: {
            for_chart: 1,
            category: category,
            month: month
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
                data = response.data.map((item) => parseFloat(item.total));
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
                        pointRadius: 4,
                        pointHoverRadius: 6
                    }]
                },
                options: {
                    onClick: (events, elements) => {
                        if (elements.length > 0) {
                            const curr = elements[0].index;
                            const label = expenseLineChart.data.labels[curr];

                            // Show data for current bar
                            showTable(label, category);
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: textColor,
                                callback: function(value) {
                                    return "₹" + value.toLocaleString("en-IN");
                                }
                            }
                        },
                        x: {
                            ticks: {
                                color: textColor
                            }
                        } 
                    },
                    plugins: {
                        legend: { 
                            position: "bottom",
                            labels: {
                                color: textColor
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) => "Amount: ₹" + context.parsed.y.toLocaleString("en-IN")
                            },
                        },
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
function showTable(label, category) {
    $.ajax({
        url: "expenses/fetch-expense",
        type: "GET",
        data: {
            table_data : 1,
            label: label,
            category: category,
        },
        dataType: "json",
        success: function (response) {
            $("#lineChart").fadeOut();
            $(".back-button").fadeIn();
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
                            <td data-field="amount">${item.amount}</td>
                        </tr>
                    `;
                });
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
            $(".table-data").fadeIn();
        },
        error: function (xhr) {
            showToast("Error displaying data! Check console", "error");
            console.log(xhr.response);
        },
    });
}