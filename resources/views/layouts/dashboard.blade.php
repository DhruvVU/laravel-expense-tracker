<x-main>
    @section('title', 'Dashboard - Tracker.io')

    <div class="dashboard-container">
        <div class="first-row">
            <div class="stat-card-mini">
                <span class="stat-label">Total Spent</span>
                <h2 class="spending-amount" id="dashboard-amount">₹0.00</h2>
            </div>

            <div class="stat-card-mini">
                <span class="stat-label">Previous Month <span id="prev-month"></span></span>
                <h2 class="spending-amount" id="previous-amount">0</h2>
            </div>

            <div class="stat-card-mini">
                <span class="stat-label">Select Category</span>
                <select class="select-category">
                    <option value="" selected>-- No categories available --</option>
                    <option value="All">All Categories</option>
                    @foreach ($categories as $category) 
                        <option value="{{ $category->name }}">{{ $category->name }}</option>
                    @endforeach
                </select>
            </div>

            <div class="stat-card-mini">
                <span class="stat-label">Total Expenses</span>
                <h2 id="expenses-count" style="margin-top: 10px">0</h2>
            </div>

            <div class="stat-card-mini">
                <span class="stat-label">Last Active Category</span>
                <h2 id="last-active" style="margin-top: 10px">None</h2>
            </div>
        </div>

        <div class="second-row">
            <div class="stat-card">
                <span class="stat-label">Monthly Budget <span id="curr-month"></span></span>
                
                <div class="budget-details">
                    <p><span id="budget-spent">₹0</span> / <span id="budget-total">₹0</span></p>
                    <button id="edit-budget"><i class="fa-solid fa-pen"></i></button>
                </div>

                {{-- Progress bar to show monthly budget --}}
                <div id="gauge-wrapper">
                    <div id="budget-gauge"></div>

                    <div class="gauge-text">
                        <span id="budget-percent">0%</span>
                        <small>Used</small>
                    </div>
                </div>
            </div>

            {{-- Pie Chart to show data distribution across different categories --}}
            <div class="stat-card chart-card">
                <span class="stat-label category-label">Spending Distribution</span>
                <div class="chart-wrapper">
                    <canvas id="pie-chart"></canvas>
                </div>
            </div>

            {{-- Bar Chart to show category wise data distribution across days of the week --}}
            <div class="stat-card chart-card">
                <span class="stat-label category-label">Spending Distribution for <span id="curr-category"></span>
                </span>
                <div class="chart-wrapper">
                    <canvas id="bar-chart"></canvas>
                </div>
            </div>
        </div>

        <div class="third-row">
            <div class="data-display">
                {{-- Month selection --}}
                <select class="select-month">
                    <option value="">Full Year Stats</option>
                    <option value="" disabled selected> -- Select a month -- </option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                </select>

                <div class="back-button">
                    <button id="toggle-view">📒 View Table</button>
                </div>

                {{--Line chart display for user expenses --}}
                <div class="line-chart">
                    <canvas id="lineChart"></canvas>
                </div>

                {{-- Table for displaying data based on category --}}
                <div class="table-data">
                    <table class="category-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Category</th>
                                <th>Amount</th>
                            </tr>
                        </thead>

                        <tbody class="category-data">
                            {{-- This will be dynamically filled --}}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    </div>


    @push('scripts')
        <script src="{{ asset('js/dashboard.js') }}"></script>
    @endpush

    <script>
        $(document).ready(function () {
            const year = $('.select-year').val();
            fetchBudgetStats(year);
            pieChart(year);
            lineChart('All', '', year);
            expenseProgressBar();
        });     
    </script>
</x-main>