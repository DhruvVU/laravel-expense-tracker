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
            <label for="category-{{ $mode }}">Category</label>
            <select id="category-{{ $mode }}" class="custom-category" style="width: 100%;">
                <option value="">Choose a Category...</option>
                @foreach ($categories as $category)
                    <option value="{{ $category->id }}">{{ $category->name }}</option>                
                @endforeach
            </select>
        </div>

        {{-- This area is hidden and will pop up when user wants to add a new category --}}
        <div id="category-wrapper-{{ $mode }}" class="category-creator" style="display: none">
            <div class="inline-header">
                <span>Create New Category</span>
            </div>

            <div class="inline-body">
                <input type="hidden" id="category-name-{{ $mode }}">

                <div class="color-row">
                    <input type="color" id="category-color-{{ $mode }}" class="custom-color-picker" value="#3b82f6">
                    <span class="color-picker-hint">Pick a color for this category</span>
                </div>

                <div class="action-buttons">
                    <button type="button" class="save-btn confirm-category-btn" data-mode="{{ $mode }}" id="save-category-btn-${{ $mode }}">
                        Confirm
                    </button>
                    <button type="button" 
                        id="close-category-btn" 
                        class="cancel-btn" 
                        data-mode="{{ $mode }}"
                        style="width: auto;"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    
        <div class="input-group">
            <label>Date</label>
            <input type="date" id="exp_date-{{ $mode }}" value="{{ date('Y-m-d') }}">
        </div>
    
        <div class="form-btn-container">
            <button id="{{ $mode }}-btn">Save</button>
            <button id="cancel-btn" class="cancel-btn">Cancel</button>
        </div>
    </form>
</div>