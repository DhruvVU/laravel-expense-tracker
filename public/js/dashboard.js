// ==============================================================================================================
// ********************************* All the dashboard page related functions are here **************************
// ==============================================================================================================

// Year selector for dashboard stats

$(document).on('change', '.select-year', function() {
    const date = new Date();
    const year = $('.select-year').val();

    const set_date = (year == date.getFullYear()) ? new Date() : new Date(year);
    set_date.setMonth(set_date.getMonth() - 1);
    const prev_month = set_date.toLocaleString('default', {month: 'short'});
    $('#prev-month').text(' (' + prev_month + ')');

    $.ajax({
        url: "/dashboard/budget-stats",
        type: "GET",
        data: { year: year, month: prev_month},
        success: function (response) {
            if (response.status === "success") {
                const data = response.data.original;

                $('#dashboard-amount').text(data.total_spent);
                $("#previous-amount").text(data.last_month);
                $('#expenses-count').text(data.total_expenses);
                $("#last-active").text(data.latest_category);
                
                // Either of line chart or table will be displayed depending on which 
                // view is currently visible to the user.
                if ($('#lineChart').is(':visible')) {
                    $('.table-data').fadeOut();
                    lineChart('', '', year);
                } 

                if ($('.table-data').is(':visible')) {
                    $('#lineChart').fadeOut();
                    showTable('', '', year);
                } 
 
                $("#curr-category").text(data.latest_category);
                barChart(data.latest_category, year);
                pieChart(year);
            }
        },
    });
});

// =============================================================================================================
// ************************************ Monthly filter ****************************************
// =============================================================================================================

$(document).on("change", ".select-month", function () {
    const month = $(".select-month").val();
    const category = $(".select-category").val() ?? "All";
        
    fetchBudgetStats(category, year);

    if ($(".table-data").is(":visible")) {
        showTable(category, month, year);
    } else {
        $(".table-data").fadeOut();
        $("#toggle-view").text("📒 View Table");
        lineChart(category, month, year);
    }

    if (category === "All") {
        pieChart(year);
    } else {
        barChart(category, year);
    }
});

// ============================================================================================================
// ***************************** Main function to fetch the statistics ************************************
// ============================================================================================================

function fetchBudgetStats(category, year) {
    $.ajax({
        url: "/dashboard/budget-stats",
        type: "GET",
        data: { 
            category: category,
            year: year
        },
        success: function (response) {
            if (response.status === "success") {
                const data = response.data.original;

                // Update the stat cards 
                $('#dashboard-amount').text(data.total_spent);
                $('#expenses-count').text(data.total_expenses);
                $("#previous-amount").text(data.last_month);
                $("#last-active").text(data.latest_category);

                $("#curr-category").text(data.latest_category);
                barChart(data.latest_category, $(".select-year").val());

                const spent = parseFloat(data.spent || 0);
                const budget = parseFloat(data.budget || 0);
                const percentage = parseFloat(data.percentage || 0);

                let ratio = budget > 0 ? spent / budget : 0;
                progressBar.animate(ratio > 1 ? 1 : ratio);

                $("#budget-spent").text("₹" + spent.toLocaleString());
                $("#budget-total").text("₹" + budget.toLocaleString());
                $("#budget-percent").text(Math.round(percentage) + "%");
            }
        },
    });
}

// ===========================================================================================================
// ************************* Toggle between chart and table views *************************
// ===========================================================================================================

$(document).on("click", "#toggle-view", function () {
    const month = $(".select-month").val();
    const category = $(".select-category").val() ?? "All";
    const year = $(".select-year").val();

    // Scroll to third row container when clicked on toggle button
    const scroll = document.querySelector('.third-row');
    scroll.scrollIntoView({
        behavior: 'smooth'
    });

    if ($(".table-data").is(":visible")) {
        $(".table-data").fadeOut();

        setTimeout(function () {
            lineChart(category, month, year);
            $("#lineChart").fadeIn();
            $("#toggle-view").text("📒 View Table");
        }, 500);
    } else {
        $("#lineChart").fadeOut();

        setTimeout(function () {
            showTable(category, month, year);
            $(".table-data").fadeIn();
            $("#toggle-view").text("📉 View Chart");
        }, 500);
    }
});

// =============================================================================================================
// ************************ Chart functions for rendering charts ****************************
// =============================================================================================================

// ======================= Pie chart for viewing entire dataset =======================

let expensesPieChart;
function pieChart(year = "") {
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
            const bgColors = response.data.map((item) => item.color);

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
                            hoverOffset: 15,
                        },
                    ],
                },
                options: {
                    onClick: (events, elements) => {
                        const curr = elements[0].index;
                        const category = expensesPieChart.data.labels[curr];

                        // Scroll down towards the table
                        showTable(category, "", $(".select-year").val());
                        const tableData = document.querySelector('.third-row');
                        tableData.scrollIntoView({
                            behavior: 'smooth'
                        });
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
                    borderWidth: 0,
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


// ======================= Bar Chart for categorical data =======================

let categoryBarChart = null;
function barChart(category, year) {
    if (categoryBarChart instanceof Chart) {
        categoryBarChart.destroy();
        categoryBarChart = null;
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
            const activeColor = response.color;

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
                            hoverBorderWidth: 1,
                        },
                    ],
                },
                options: {
                    onClick: (events, elements) => {
                        if (elements.length > 0) {
                            const curr = elements[0].index;
                            const label = categoryBarChart.data.labels[curr];

                            // Show data for current bar and scroll down toawrds it
                            showTable(category, label, $(".select-year").val());    
                            const tableData = document.querySelector('.third-row');
                            tableData.scrollIntoView({
                                behavior: 'smooth'
                            });
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

// ======================= Line Chart for displaying overall data =======================

let expenseLineChart;
function lineChart(category = "All", month = "", year = "") {
    const activeColor = "#4e73df";

    $.ajax({
        url: "/expenses/fetch-expense",
        type: "GET",
        data: {
            for_chart: 1,
            category: category,
            month: month,
            year: year,
        },
        dataType: "json",
        success: function (response) {
            const canvas = document.getElementById("lineChart");
            if (!canvas) return;

            const context = canvas.getContext("2d");

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
                type: "line",
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: `Expenses for ${category}`,
                            data: data,
                            borderColor: activeColor,
                            backgroundColor: "rgba(78, 115, 223, 0.05)",
                            pointBackgroundColor: "red",
                            tension: 0.4,
                            fill: true,
                        },
                    ],
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
                                callback: function (value) {
                                    return "₹" + value.toLocaleString("en-IN");
                                },
                            },
                        },
                    },
                    plugins: {
                        legend: {
                            position: "bottom",
                        },
                        tooltip: {
                            callbacks: {
                                label: (context) =>
                                    "Amount: ₹" +
                                    context.parsed.y.toLocaleString("en-IN"),
                            },
                        },
                    },
                    elements: {
                        point: {
                            radius: 4,
                            hitRadius: 10,
                            hoverRadius: 6,
                        },
                    },
                },
            });
        },
        error: function (xhr) {
            showToast("Error loading Line Chart! Check console.");
            console.log(xhr.response);
        },
    });
}

// ======================= Progress Bar for monthly budget =======================

let progressBar;
function expenseProgressBar() {
    progressBar = new ProgressBar.SemiCircle("#budget-gauge", {
        strokeWidth: 8,
        trailWidth: 8,
        color: "#00ff99",
        trailColor: 'rgba(202, 196, 196, 0.2)',
        easing: "easeInOut",
        duration: 2000,
        svgStyle: {
            width: "100%",
            height: "100%",
        },
        from: { color: '#00e676' },
        to:   { color: '#00ffcc' },
        step: (state, bar) => {
            bar.path.setAttribute('stroke-linecap', 'round');
            const value = Math.round(bar.value() * 100);
            $("#budget-percent").text(value + "%");
            let glowColor;
            if (value >= 90) {
                bar.path.setAttribute("stroke", "#ff4d6d");
                glowColor = "rgba(255,77,109,0.3)";

            } else if (value >= 70) {
                bar.path.setAttribute("stroke", "#ffd166");
                glowColor = "rgba(255,209,102,0.3)";

            } else {
                // USE interpolated color here
                bar.path.setAttribute("stroke", state.color);
                glowColor = "rgba(0,255,153,0.3)";
            }
            bar.path.style.filter = `drop-shadow(0 0 4px ${glowColor})`;
        },
    });
}
