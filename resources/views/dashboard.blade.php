<x-main>
    @section('title', 'Dashboard - Tracker.io')
    
    <div class="dashboard-container">
        <div class="dashboard-left">
            <div class="stat-card">
                <span class="stat-label">Total Spent</span>
                <h2 id="dashboard-amount">₹0.00</h2>
            </div>

            <div class="stat-card">
                <span class="stat-label">Active Category</span>
                <select class="select-category">
                    <option value="" selected>-- No categories available --</option>
                    <option value="All">All Categories</option>
                    <option value="Food">Food</option>
                    <option value="Transport">Transport</option>
                    <option value="Bills">Bills</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div class="stat-card chart-card">
                <span class="stat-label category-label">Spending Distribution</span>
                <div class="chart-wrapper">
                    <canvas id="pie-chart"></canvas>
                    <canvas id="bar-chart" style="display: none"></canvas>
                </div>
            </div>
        </div>

        <div class="dashboard-right">
            <div class="data-display">
                {{-- Year selection --}}
                <select class="select-year">
                    <option value="" disabled selected> -- Select a year -- </option>
                    @foreach ($years as $year)
                        <option value="{{ $year }}" {{ $year == date('Y') ? 'selected' : '' }}>
                            {{ $year }}
                        </option>
                    @endforeach
                </select>

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
                    <button id="toggle-view">📒 Table View</button>
                </div>

                {{-- chart display for user expenses --}}
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

                {{-- button to show add expense form --}}
                <button id="show-btn">Add Expense</button>
            </div>

        </div>
    </div>

    {{-- Hidden form to add expense --}}
    <x-form mode="add" title="Add Expense"></x-form>

    <script>
        $(document).ready(function () {
            const year = $('.select-year').val();
            loadExpenses('All', 1, '', '', '', year);
            pieChart(year);
            lineChart('All', '', year);
        });
    </script>
</x-main>