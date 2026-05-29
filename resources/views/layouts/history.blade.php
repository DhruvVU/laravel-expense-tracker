<x-main>
    @section('title', 'History - Tracker.io')

    <div class="container">

        <div class="show-container">

            <!-- Total Amount spent(based on category) and the value is dynamically filled using JQuery -->
            <div class="total-display">
                <strong>Total Amount spent on <span id="selected-category">All</span> : &#8377<span
                        id="total-amount">0.00</span></strong>
                
                <div class="expenses-btn-container">
                            
                    {{-- button to show add expense form --}}
                    <button id="show-btn">
                        <span style="font-size: 1.1rem; font-weight: 700;">
                            <i class="fa-solid fa-plus"></i>
                        </span> Add Expense
                    </button>

                    <!-- Part for handling download button -->
                    <button id="download-csv">Export to csv</button>
                </div>
            </div>

            {{-- Filters section  --}}
            <div class="controls-section">

                {{-- Category Filter --}}
                <div class="filter-wrapper">
                    <label>Category:</label>
                    <select id="filter-category">
                        @if ($categories->isEmpty()) 
                            <option value="" selected>No Categories Available</option>
                        @endif
                        <option value="All">All Categories</option>
                        @foreach ($categories as $category)
                            <option value="{{ $category->name }}">{{ $category->name }}</option>
                        @endforeach
                    </select>
                </div>

                {{-- Date Range Filter --}}
                <div class="date-range-wrapper">
                    <label>Select Date: </label>
                    <input type="date" name="start-date" id="start-date" class="select-date">
                    <span> To </span>
                    <input type="date" name="end-date" id="end-date" class="select-date">
                </div>

                <div class="reset-btn-container">
                    <button id="reset-filters" class="btn-reset">
                        <i class="fas fa-undo"></i> Reset
                    </button>
                </div>
            </div>

            {{-- DataTable container --}}
            <div class="table-container">
                <table class="history-table" id="expense-list">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th style="text-align: center">Action</th>
                        </tr>
                    </thead>

                    <!-- This part will be auto filled when data is entered and fetched -->
                    <tbody></tbody>
                </table>
            </div>
        </div>
    </div>

    {{-- Hidden cards will be only shown when user clicks edit/add button --}}
    <x-form mode="add" title="Add Expense"></x-form>
    <x-form mode="edit" title="Edit Expense"></x-form>

    @push('scripts')
        <script src="{{ asset('js/expenses.js') }}"></script>
    @endpush
    
    <script>
        $(document).ready(function () {
            initExpenseTable();
        })
    </script>
</x-main>