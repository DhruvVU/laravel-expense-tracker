@props(['mode' => 'add', 'title' => 'Add Expense'])

<div class="{{ $mode }}-card">
    <form class="expense-form" data-mode="{{ $mode }}">

        <h2>{{ $title  }}</h2>
    
        <span id="data_id-{{ $mode }}" style="display: none"></span>
    
        <div class="input-group">
            <label>Description</label>
            <input type="text" id="description-{{ $mode }}">
        </div>
    
        <div class="input-group">
            <label>Amount (₹)</label>
            <input type="number" id="amount-{{ $mode }}" step="0.01">
        </div>
    
        <div class="input-group">
            <label>Category</label>
            <select id="category-{{ $mode }}">
                @foreach ($categories as $category)
                    <option value="{{ $category->id }}">{{ $category->name }}</option>                
                @endforeach
            </select>
        </div>
    
        <div class="input-group">
            <label>Date</label>
            <input type="date" id="exp_date-{{ $mode }}" value="{{ date('Y-m-d') }}">
        </div>
    
        <div class="form-btn-container">
            <button id="{{ $mode }}-btn">Save</button>
            <button id="cancel-btn">Cancel</button>
        </div>
    </form>
</div>