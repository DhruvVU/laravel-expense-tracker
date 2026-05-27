<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add category-id column to the user table
        Schema::table('expenses', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('user_id')->constrained()->onDelete('restrict');
        });

        DB::beginTransaction();

        // Migrate old categories into this new format where each expense will have a category_id which will 
        // have a cateogry_id which corresponds to a particular category in the category table
        try {
            $userIds = DB::table('expenses')->distinct()->pluck('user_id');

            foreach ($userIds as $userId) {
                
                // Check if the category table has mapped our old users
                $categoryCount = DB::table('categories')->where('user_id', $userId)->count();
                if ($categoryCount == 0) {
                    $defaultCategories = [
                        ['user_id' => $userId , 'name' => 'Food', 'color' => '#ffcd39', 'created_at' => now(), 'updated_at' => now()],
                        ['user_id' => $userId, 'name' => 'Transport', 'color' => '#d35400', 'created_at' => now(), 'updated_at' => now()],
                        ['user_id' => $userId, 'name' => 'Bills', 'color' => '#0c5460', 'created_at' => now(), 'updated_at' => now()],
                        ['user_id' => $userId, 'name' => 'Entertainment', 'color' => '#6a1b9a', 'created_at' => now(), 'updated_at' => now()],
                        ['user_id' => $userId, 'name' => 'Other', 'color' => '#383d41', 'created_at' => now(), 'updated_at' => now()]
                    ];

                    DB::table('categories')->insert($defaultCategories);
                }
                
                $userCategories = DB::table('categories')
                                    ->where('user_id', $userId)
                                    ->select('id', 'name')
                                    ->get();

                foreach ($userCategories as $category) {
                    DB::table('expenses')
                        ->where('user_id', $userId)
                        ->where('category', $category->name)
                        ->update(['category_id' => $category->id]);
                }
    
                // Fallback for categories which dont match 
                $otherCategoryId = DB::table('categories')
                                    ->where('user_id', $userId)
                                    ->where('name', 'Other')
                                    ->value('id');
    
                if ($otherCategoryId) {
                    DB::table('expenses')
                        ->where('user_id', $userId)
                        ->whereNull('category_id')
                        ->update(['category_id' => $otherCategoryId]);
                }
            }
            // Commit if no issues faced
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();

            // Clean up columns and rollback the DB to its original state
            Schema::table('expenses', function (Blueprint $table) {
                $table->dropForeign(['category_id']);
                $table->dropColumn('category_id');
            });

            throw $e;
        }
        

        Schema::table('expenses', function(Blueprint $table) {
            $table->foreignId('category_id')->nullable(false)->change();
            $table->dropColumn('category');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('expenses', function (Blueprint $table) {
            // Reverse logic: put back the text category column and drop the relation
            $table->string('category')->after('user_id')->nullable();
        });

        // Copy back the names before dropping the constraint
        DB::table('expenses')
            ->join('categories', 'expenses.category_id', '=', 'categories.id')
            ->update(['expenses.category' => DB::raw('categories.name')]);

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
    }
};
