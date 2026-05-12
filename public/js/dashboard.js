$(document).on("click", "#toggle-view", function () {
    const month = $(".select-month").val();
    const category = $(".select-category").val() ?? "All";
    const year = $(".select-year").val();

    if ($(".table-data").is(":visible")) {
        $(".table-data").fadeOut();

        setTimeout(function () {
            lineChart(category, month, year);
            $("#lineChart").fadeIn();
            $("#toggle-view").text("📒 Table View");
        }, 500);
    } else {
        $("#lineChart").fadeOut();

        setTimeout(function () {
            showTable(category, month, year);
            $(".table-data").fadeIn();
            $("#toggle-view").text("📉 Chart View");
        }, 500);
    }
});

// Variable for holding chart instance
let expensesPieChart;

// Pie chart for viewing entire dataset
function pieChart(year = "") {
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
                            hoverOffset: 15,
                        },
                    ],
                },
                options: {
                    onClick: (events, elements) => {
                        const curr = elements[0].index;
                        const category = expensesPieChart.data.labels[curr];
                        showTable(category, "", $(".select-year").val());
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
                            hoverBorderWidth: 1,
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

let progressBar;

function expenseProgressBar() {
    progressBar = new ProgressBar.SemiCircle("#budget-gauge", {
        strokeWidth: 6,
        color: "#2ecc71",
        trailColor: "#747474",
        trailWidth: 6,
        easing: "easeInOut",
        duration: 2000,
        svgStyle: {
            width: "100%",
            height: "100%",
        },
        step: (state, bar) => {
            const value = Math.round(bar.value() * 100);
            $("#budget-percent").text(value + "%");

            if (value >= 90) {
                bar.path.setAttribute("stroke", "#e74c3c"); // Danger Red
            } else if (value >= 70) {
                bar.path.setAttribute("stroke", "#f1c40f"); // Warning Yellow
            } else {
                bar.path.setAttribute("stroke", "#2ecc71"); // Safe Green
            }
        },
    });
}

function fetchBudgetStats() {
    $.ajax({
        url: "/dashboard/budget-stats",
        type: "GET",
        success: function (response) {
            if (response.status === "success") {
                const data = response.data.original;

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
