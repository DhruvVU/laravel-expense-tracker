<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\StoreExpenseRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // Fetch all categories
    public function index(): View 
    {      
        $categories = auth()->user()->categories()
                            ->withCount('expenses')
                            ->orderBy('created_at', 'desc')
                            ->get();
        return view('categories.index', compact('categories'));
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
