<x-main>
    @section('title', 'Categories - Tracker.io')
    <div class="category-page-container">

        <div class="category-card-form">
            <div class="category-card-title">
                <h3>Create new category</h3>
            </div>

            <form id="categoryForm">
                <div class="category-form">
                    <div class="form-input-group">
                        <label for="category_name">Category Name</label>
                        <input type="text" id="category_name" class="custom-input-field"
                            placeholder="e.g., Subscriptions, Medical" required>
    
                        <span class="custom-error-text" id="name-error-msg" style="display: none;"></span>
                    </div>
    
                    <div class="form-input-group">
                        <label for="category_color">Choose Badge Color</label>
                        <div class="color-picker-row">
                            <input 
                                type="color" 
                                id="category_color" 
                                class="custom-color-circle" 
                                value="#3498db"
                            >
                            <span class="color-picker-hint">Click the circle to pick a custom color pill</span>
                        </div>
                        <span class="custom-error-text" id="color-error-msg" style="display: none;"></span>
                    </div>
                </div>
                <button type="submit" class="save-btn" id="save-category-btn">
                    Save Category
                </button>
            </form>
        </div>

            <div class="category-card-title" style="margin-bottom: 5px">
                <h3 style="margin-top: 30px">Current Active Categories</h3>
            </div>

        <div class="categories-show" id="categories-list-container">
            <table class="custom-data" id="category-data">
                <thead>
                    <tr>
                        <th style="padding: 12px; text-align: left;">NAME</th>
                        <th style="padding: 12px; text-align: left;">COLOR</th>
                        <th style="padding: 12px; text-align: left;">EXPENSES</th>
                        <th style="padding: 12px; text-align: left;">CREATED</th>                        
                        <th style="padding: 12px; text-align: left;">UPDATED</th>                        
                        <th colspan="2" style="padding: 12px; text-align: center;">ACTION</th>
                    </tr>
                </thead>
                {{-- This will be autofilled by DataTables  --}}
                <tbody id="categories-table-body">
                </tbody>
            </table>
        </div>
    </div>
</x-main>