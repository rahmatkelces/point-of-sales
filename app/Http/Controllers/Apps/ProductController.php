<?php

namespace App\Http\Controllers\Apps;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $perPageOptions = [25, 50, 100, 150, 200, 500, 1000];
        $perPage = request()->per_page ?? 15;

        if (!in_array((int) $perPage, $perPageOptions)) {
            $perPage = 15;
        }

        $search = request()->search;
        $categoryId = request()->category_id;
        $stockFilter = request()->stock_filter;

        $products = Product::query()
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', '%' . $search . '%')
                        ->orWhere('barcode', 'like', '%' . $search . '%');
                });
            })
            ->when($categoryId, function ($query) use ($categoryId) {
                $query->where('category_id', $categoryId);
            })
            ->when($stockFilter, function ($query) use ($stockFilter) {
                if ($stockFilter == 'lt3') {
                    $query->where('stock', '<', 3);
                } elseif ($stockFilter == 'lt5') {
                    $query->where('stock', '<', 5);
                } elseif ($stockFilter == 'lt10') {
                    $query->where('stock', '<', 10);
                }
            })
            ->with('category')
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        $categories = Category::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Dashboard/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'search' => $search,
                'category_id' => $categoryId ? (int) $categoryId : '',
                'stock_filter' => $stockFilter ?? '',
                'per_page' => (int) $perPage,
            ],
            'perPageOptions' => $perPageOptions,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::all();

        return Inertia::render('Dashboard/Products/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'image'       => 'required|image|mimes:jpg,jpeg,png,webp|max:2048',
            'barcode'     => 'required|unique:products,barcode',
            'title'       => 'required',
            'description' => 'required',
            'category_id' => 'required',
            'buy_price'   => 'required',
            'sell_price'  => 'required',
            'stock'       => 'required',
        ]);

        $image = $request->file('image');
        $image->storeAs('public/products', $image->hashName());

        Product::create([
            'image'       => $image->hashName(),
            'barcode'     => $request->barcode,
            'title'       => $request->title,
            'description' => $request->description,
            'category_id' => $request->category_id,
            'buy_price'   => $request->buy_price,
            'sell_price'  => $request->sell_price,
            'stock'       => $request->stock,
        ]);

        return to_route('products.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $categories = Category::all();

        return Inertia::render('Dashboard/Products/Edit', [
            'product'    => $product,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $request->validate([
            'image'       => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'barcode'     => 'required|unique:products,barcode,' . $product->id,
            'title'       => 'required',
            'description' => 'required',
            'category_id' => 'required',
            'buy_price'   => 'required',
            'sell_price'  => 'required',
            'stock'       => 'required',
        ]);

        $data = [
            'barcode'     => $request->barcode,
            'title'       => $request->title,
            'description' => $request->description,
            'category_id' => $request->category_id,
            'buy_price'   => $request->buy_price,
            'sell_price'  => $request->sell_price,
            'stock'       => $request->stock,
        ];

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('local')->delete('public/products/' . basename($product->image));
            }

            $image = $request->file('image');
            $image->storeAs('public/products', $image->hashName());

            $data['image'] = $image->hashName();
        }

        $product->update($data);

        return to_route('products.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $product = Product::findOrFail($id);

        if ($product->image) {
            Storage::disk('local')->delete('public/products/' . basename($product->image));
        }

        $product->delete();

        return back();
    }
}