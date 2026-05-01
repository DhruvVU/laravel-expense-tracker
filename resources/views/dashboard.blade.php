@extends('layouts.main')

@section('title', 'Dashboard - Tracker.io')

@section('content')
    <div class="dashboard-container">
        <div class="dashboard-left">
            <div class="stat-card">
                <span class="stat-label">Total Spent</span>
                <h2 id="dashboard-amount">₹0.00</h2>
            </div>

            <div class="stat-card">
                <span class="stat-label">Active Category</span>
                <select class="select-category" disabled>
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
                    <canvas id="expenseChart"></canvas>
                    <canvas id="categoryChart" style="display: none"></canvas>
                </div>
            </div>
        </div>

        <div class="dashboard-right">
            <div class="data-display">
                <select class="select-month" >
                    <option value="">All time stats</option>
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
    <div class="add-card">
        <h2>Add New Expense</h2>

        <div class="input-group">
            <label>Description</label>
            <input type="text" id="description" placeholder="e.g., Grocery Shopping">
        </div>

        <div class="input-group">
            <label>Amount (₹)</label>
            <input type="number" id="amount" placeholder="0.00" step="0.01">
        </div>

        <div class="input-group">
            <label>Category</label>
            <select id="category">
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Bills">Bills</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Other">Other</option>
            </select>
        </div>

        <div class="input-group">
            <label>Date</label>
            <input type="date" id="exp_date" value="{{ date('Y-m-d') }}">
        </div>

        <div class="add-form-btn">
            <button id="add-btn">Save</button>
            <button id="close-form">Cancel</button>
        </div>
    </div>

    <!-- This container holds toast element -->
    <div id="toast-container"></div>
    <script>
        $(document).ready(function () {
            loadExpenses('All', 1, '');
            pieChart();
            lineChart('All', '');
        });
    </script>
@endsection