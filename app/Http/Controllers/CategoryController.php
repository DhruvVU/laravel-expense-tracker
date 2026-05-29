<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;
use Illuminate\Http\Request;
use Yajra\DataTables\Contracts\DataTable;
use Yajra\DataTables\DataTables;

class CategoryController extends Controller
{
    // Land on categories home page
    public function index(): View 
    {      
        return view('categories.index');
    }

    // Fetch all data and display it using DataTables library
    public function fetch(): JsonResponse
    {
        $query = auth()->user()->categories()
                    ->withCount('expenses')
                    ->orderBy('created_at', 'desc');

        return DataTables::of($query)
            ->addColumn('color_badge', function($category) {
                return '
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="width: 12px; height: 12px; border-radius: 50%; background-color: ' . $category->color . '; display: inline-block;"></span>
                        <code>' . $category->color . '</code>
                    </div>
                ';
            })
            ->addColumn('created_at', function($category) {
                return $category->created_at->format('Y-m-d');
            })
            ->addColumn('updated_at', function($category) {
                return $category->updated_at->format('Y-m-d');
            })
            ->addColumn('action_buttons', function($category) {
                return '
                    <div class="action-buttons">
                        <button class="show-edit" id="edit-category" data-id="' . $category->id . '">
                            <i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="delete-btn" id="delete-category" data-id="' . $category->id . '">
                            <i class="fa-solid fa-trash"></i></button>
                    </div>
                ';
            })
            ->rawColumns(['color_badge', 'action_buttons'])
            ->make(true);
    }

    // Add a new category 
    public function store(StoreCategoryRequest $request): JsonResponse
    {       
        $user = $request->user();
        $category = $user->categories()->create($request->validated());
        return response()->json([
            'status' => 'success',
            'message' => 'Category created successfully!',
            'data' => [
                'id' => $category->id,
                'name' => $category->name,
                'color' => $category->color
            ]
        ]);
    }

    // Edit an existing category
    public function update(StoreCategoryRequest $request, $id): JsonResponse 
    {   
        $category = auth()->user()->categories()->findOrFail($id);
        
        $category->update($request->validated());

        return response()->json([
            'status' => 'success',
            'message' => 'Category successfully updated!',
            'data' => [
                'id' => $category->id,
                'name' => $category->name,
                'color' => $category->color
            ]
        ]);
    }

    // Delete an existing category
    public function destroy($id): JsonResponse
    {
        $category = auth()->user()->categories()->findOrFail($id);

        if ($category->expenses()->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => "Cannot delete! This category contains active transactions"
            ]);
        }
 
        $category->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Category successfully deleted!'
        ]);
    }
} 
