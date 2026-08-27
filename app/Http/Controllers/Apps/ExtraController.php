<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Extra;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExtraController extends Controller
{
    /**
     * Daftar Extra
     */
    public function index(Request $request)
    {
        $extras = Extra::query()
            ->withCount('products')
            ->when(
                $request->search,
                function ($query, $search) {
                    $query->where(
                        'name',
                        'like',
                        '%' . $search . '%'
                    );
                }
            )
            ->latest()
            ->paginate(
                $request->integer(
                    'per_page',
                    15
                )
            )
            ->withQueryString();

        return Inertia::render(
            'Dashboard/Extras/Index',
            [
                'extras' => $extras,

                'filters' => [
                    'search' =>
                        $request->search ?? '',

                    'per_page' =>
                        $request->integer(
                            'per_page',
                            15
                        ),
                ],

                'perPageOptions' => [
                    10,
                    15,
                    25,
                    50,
                    100,
                ],
            ]
        );
    }

    /**
     * Form tambah Extra
     */
    public function create()
    {
        $products = Product::query()
            ->select([
                'id',
                'title',
                'sell_price',
            ])
            ->orderBy('title')
            ->get();

        return Inertia::render(
            'Dashboard/Extras/Create',
            [
                'products' => $products,
            ]
        );
    }

    /**
     * Simpan Extra
     */
    public function store(Request $request)
    {
        $validated = $request->validate(
            [
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'price' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'is_active' => [
                    'required',
                    'boolean',
                ],

                'product_ids' => [
                    'nullable',
                    'array',
                ],

                'product_ids.*' => [
                    'integer',
                    'exists:products,id',
                ],
            ],
            [
                'name.required' =>
                    'Nama extra wajib diisi.',

                'price.required' =>
                    'Harga extra wajib diisi.',

                'price.numeric' =>
                    'Harga extra harus berupa angka.',

                'price.min' =>
                    'Harga extra tidak boleh kurang dari 0.',

                'product_ids.*.exists' =>
                    'Produk yang dipilih tidak ditemukan.',
            ]
        );

        $extra = Extra::create([
            'name' =>
                $validated['name'],

            'price' =>
                $validated['price'],

            'is_active' =>
                $validated['is_active'],
        ]);

        $extra->products()->sync(
            $validated['product_ids'] ?? []
        );

        return to_route(
            'extras.index'
        )->with(
            'success',
            'Extra berhasil ditambahkan.'
        );
    }

    /**
     * Form edit Extra
     */
    public function edit(Extra $extra)
    {
        $extra->load([
            'products:id',
        ]);

        $products = Product::query()
            ->select([
                'id',
                'title',
                'sell_price',
            ])
            ->orderBy('title')
            ->get();

        return Inertia::render(
            'Dashboard/Extras/Edit',
            [
                'extra' => [
                    'id' =>
                        $extra->id,

                    'name' =>
                        $extra->name,

                    'price' =>
                        $extra->price,

                    'is_active' =>
                        $extra->is_active,

                    'product_ids' =>
                        $extra->products
                            ->pluck('id')
                            ->values()
                            ->toArray(),
                ],

                'products' =>
                    $products,
            ]
        );
    }

    /**
     * Update Extra
     */
    public function update(
        Request $request,
        Extra $extra
    ) {
        $validated = $request->validate(
            [
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'price' => [
                    'required',
                    'numeric',
                    'min:0',
                ],

                'is_active' => [
                    'required',
                    'boolean',
                ],

                'product_ids' => [
                    'nullable',
                    'array',
                ],

                'product_ids.*' => [
                    'integer',
                    'exists:products,id',
                ],
            ],
            [
                'name.required' =>
                    'Nama extra wajib diisi.',

                'price.required' =>
                    'Harga extra wajib diisi.',

                'price.numeric' =>
                    'Harga extra harus berupa angka.',

                'price.min' =>
                    'Harga extra tidak boleh kurang dari 0.',
            ]
        );

        $extra->update([
            'name' =>
                $validated['name'],

            'price' =>
                $validated['price'],

            'is_active' =>
                $validated['is_active'],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Sinkronisasi produk
        |--------------------------------------------------------------------------
        */

        $extra->products()->sync(
            $validated['product_ids'] ?? []
        );

        return to_route(
            'extras.index'
        )->with(
            'success',
            'Extra berhasil diperbarui.'
        );
    }

    /**
     * Hapus Extra
     */
    public function destroy(Extra $extra)
    {
        $extra->delete();

        return to_route(
            'extras.index'
        )->with(
            'success',
            'Extra berhasil dihapus.'
        );
    }
}