@extends('layouts.main')

@section('title', 'History - Tracker.io')

@section('content')
    <div class="container">

        <div class="show-container">
            <!-- Search and filter control -->
            <div class="controls-section">
                <div class="search-wrapper">
                    <label>Search:</label>
                    <input type="text" id="search-input" placeholder="Search description...">
                </div>

                <div class="filter-wrapper">
                    <label>Filter by Category:</label>
                    <select id="filter-category">
                        <option value="All">All Categories</option>
                        <option value="Food">Food</option>
                        <option value="Transport">Transport</option>
                        <option value="Bills">Bills</option>
                        <option value="Entertainment">Entertainment</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </div>

            <!-- Total Amount spent(based on category) and the value is dynamically filled using JQuery -->
            <div class="total-display">
                <strong>Total Amount spent on <span id="selected-category">All</span> : &#8377<span
                        id="total-amount">0.00</span></strong>
            </div>

            <div class="table-container">
                <table class="history-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th colspan="2" style="text-align: center">Action</th>
                        </tr>
                    </thead>

                    <!-- This part will be auto filled when data is entered and fetched -->
                    <tbody id="expense-list">
                        <!-- <tr><td>Values will be auto-filled from database using JQuery</td></tr> -->
                    </tbody>

                </table>
            </div>

            <div class="buttons-container">
                <!-- Part for handling page numbers -->
                <div id="page-numbers"></div>

                <!-- Part for handling download button -->
                <div class="btn-group-csv">
                    <button id="download-csv">Export to csv</button>
                </div>
            </div>
        </div>
    </div>

    {{-- Hidden card will be only shown when user clicks edit button --}}
    <div class="edit-card">
        <h2>Edit Expense</h2>

        <span id="data_id" style="display: none"></span>

        <div class="input-group">
            <label>Description</label>
            <input type="text" id="description">
        </div>

        <div class="input-group">
            <label>Amount (₹)</label>
            <input type="number" id="amount" step="0.01">
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
            <input type="date" id="exp_date">
        </div>

        <div class="edit-form-btn-container">
            <button id="edit-btn">Save</button>
            <button id="cancel-btn">Cancel</button>
        </div>
    </div>


    <!-- This container handles the toast element  -->
    <div id="toast-container"></div>
    <script>
        $(document).ready(function () {
            loadExpenses('All', 1, '');
        })
    </script>
@endsection