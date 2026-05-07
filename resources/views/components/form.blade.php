@props(['mode' => 'add', 'title' => 'Add Expense'])

<div class="{{ $mode }}-card">
    <h2>{{ $title  }}</h2>

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
        <input type="date" id="exp_date" value="{{ date('Y-m-d') }}">
    </div>

    <div class="form-btn-container">
        <button id="{{ $mode }}-btn">Save</button>
        <button id="cancel-btn">Cancel</button>
    </div>
</div>