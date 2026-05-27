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
            <table class="custom-data">
                <thead>
                    <tr>
                        <th style="padding: 12px; text-align: left;">NAME</th>
                        <th style="padding: 12px; text-align: left;">COLOR</th>
                        <th style="padding: 12px; text-align: left;">EXPENSES</th>
                        <th style="padding: 12px; text-align: left;">CREATED</th>
                        <th colspan="2" style="padding: 12px; text-align: center;">ACTION</th>
                    </tr>
                </thead>
                <tbody id="categories-table-body">
                    @if($categories->isEmpty())
                        <tr id="empty-state-row">
                            <td colspan="4" style="padding: 24px; text-align: center;" class="color-picker-hint">
                                No custom tracking categories found.
                            </td>
                        </tr>
                    @else
                        @foreach($categories as $category)
                            <tr style="border-bottom: 1px solid var(--border-color);" data-category-id="{{   $category->id }}">
                                <td class="editable-name" style="padding: 14px 12px;" data-name="{{ $category->name }}">
                                    {{ $category->name }}
                                </td>
                                <td class="editable-color" style="padding: 14px 12px;" data-color="{{ $category->color }}">
                                    <div style="display: flex; align-items: center; gap: 8px;">
                                        <span
                                            style="width: 12px; height: 12px; border-radius: 50%;background-color: {{ $category->color }}; display: inline-block;">
                                        </span>
                                        <code>{{ $category->color }}</code>
                                    </div>
                                </td>
                                <td style="padding: 14px 12px;">{{ $category->expenses_count ?? 0 }}</td>
                                <td style="padding: 14px 12px;" class="color-picker-hint">
                                    {{ $category->created_at->format('Y-m-d') }}</td>
                                <td style="text-align: center">
                                    <button 
                                        id="edit-category" 
                                        class="show-edit"
                                        data-id="{{ $category->id }}"
                                    >
                                    <i class="fa-solid fa-pen-to-square"></i>Edit</button>
                                </td>
                                <td style="text-align: center">
                                    <button 
                                        id="delete-category" 
                                        class="delete-btn" 
                                        data-id="{{ $category->id }}"
                                    >
                                    <i class="fa-solid fa-trash"></i> Delete</button>
                                </td>
                            </tr>
                        @endforeach
                    @endif
                </tbody>
            </table>
        </div>
    </div>
    <x-form mode="add" title="Add Expense"></x-form>
</x-main>