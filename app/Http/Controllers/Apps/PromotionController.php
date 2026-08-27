<?php

namespace App\Http\Controllers\Apps;

use Inertia\Inertia;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Validation\Rule;

class PromotionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $perPageOptions = [15, 25, 50, 100];
        $perPage = request()->per_page ?? 15;

        if (!in_array((int) $perPage, $perPageOptions)) {
            $perPage = 15;
        }

        $search = request()->search;
        $type = request()->type;
        $status = request()->status;

        $promotions = Promotion::query()
            ->with(['promotionProducts.product'])
            ->when($search, function ($query) use ($search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', '%' . $search . '%')
                        ->orWhere('code', 'like', '%' . $search . '%');
                });
            })
            ->when($type, function ($query) use ($type) {
                $query->where('type', $type);
            })
            ->when($status !== null && $status !== '', function ($query) use ($status) {
                $query->where('is_active', (bool) $status);
            })
            ->latest()
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Dashboard/Promotions/Index', [
            'promotions' => $promotions,
            'filters' => [
                'search' => $search ?? '',
                'type' => $type ?? '',
                'status' => $status !== null ? (string) $status : '',
                'per_page' => (int) $perPage,
            ],
            'perPageOptions' => $perPageOptions,
            'types' => [
                ['label' => 'Diskon Harga Product', 'value' => 'price_discount'],
                ['label' => 'Beli X Gratis Y Product Sama', 'value' => 'buy_x_get_y_same'],
                ['label' => 'Beli X Gratis Y Product Berbeda', 'value' => 'buy_x_get_y_diff'],
                ['label' => 'Voucher Nominal', 'value' => 'voucher_nominal'],
            ],
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $products = Product::select('id', 'title', 'barcode', 'sell_price')
            ->orderBy('title')
            ->get();

        return Inertia::render('Dashboard/Promotions/Create', [
            'products' => $products,
            'types' => [
                ['label' => 'Diskon Harga Product', 'value' => 'price_discount'],
                ['label' => 'Beli X Gratis Y Product Sama', 'value' => 'buy_x_get_y_same'],
                ['label' => 'Beli X Gratis Y Product Berbeda', 'value' => 'buy_x_get_y_diff'],
                ['label' => 'Voucher Nominal', 'value' => 'voucher_nominal'],
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $this->validatePromotion($request);

        $promotion = Promotion::create([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'type' => $validated['type'],
            'is_active' => $request->boolean('is_active', true),
            'start_at' => $validated['start_at'] ?? null,
            'end_at' => $validated['end_at'] ?? null,
            'discount_nominal' => $validated['discount_nominal'] ?? null,
            'min_purchase' => $validated['min_purchase'] ?? null,
            'buy_qty' => $validated['buy_qty'] ?? null,
            'get_qty' => $validated['get_qty'] ?? null,
            'description' => $validated['description'] ?? null,
        ]);

        $this->syncPromotionProducts($promotion, $request);

        return to_route('promotions.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Promotion $promotion)
    {
        $promotion->load('promotionProducts');

        $products = Product::select('id', 'title', 'barcode', 'sell_price')
            ->orderBy('title')
            ->get();

        return Inertia::render('Dashboard/Promotions/Edit', [
            'promotion' => [
                ...$promotion->toArray(),
                'start_at' => $promotion->start_at ? $promotion->start_at->format('Y-m-d\TH:i') : '',
                'end_at' => $promotion->end_at ? $promotion->end_at->format('Y-m-d\TH:i') : '',
            ],
            'products' => $products,
            'types' => [
                ['label' => 'Diskon Harga Product', 'value' => 'price_discount'],
                ['label' => 'Beli X Gratis Y Product Sama', 'value' => 'buy_x_get_y_same'],
                ['label' => 'Beli X Gratis Y Product Berbeda', 'value' => 'buy_x_get_y_diff'],
                ['label' => 'Voucher Nominal', 'value' => 'voucher_nominal'],
            ],
            'selectedProducts' => [
                'target_product_ids' => $promotion->promotionProducts
                    ->where('role', 'target')
                    ->pluck('product_id')
                    ->values(),
                'buy_product_ids' => $promotion->promotionProducts
                    ->where('role', 'buy')
                    ->pluck('product_id')
                    ->values(),
                'get_product_ids' => $promotion->promotionProducts
                    ->where('role', 'get')
                    ->pluck('product_id')
                    ->values(),
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Promotion $promotion)
    {
        $validated = $this->validatePromotion($request, $promotion->id);

        $promotion->update([
            'name' => $validated['name'],
            'code' => $validated['code'] ?? null,
            'type' => $validated['type'],
            'is_active' => $request->boolean('is_active', true),
            'start_at' => $validated['start_at'] ?? null,
            'end_at' => $validated['end_at'] ?? null,
            'discount_nominal' => $validated['discount_nominal'] ?? null,
            'min_purchase' => $validated['min_purchase'] ?? null,
            'buy_qty' => $validated['buy_qty'] ?? null,
            'get_qty' => $validated['get_qty'] ?? null,
            'description' => $validated['description'] ?? null,
        ]);

        $promotion->promotionProducts()->delete();
        $this->syncPromotionProducts($promotion, $request);

        return to_route('promotions.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Promotion $promotion)
    {
        $promotion->delete();

        return back();
    }

    protected function validatePromotion(Request $request, $promotionId = null): array
    {
        $baseRules = [
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in([
                'price_discount',
                'buy_x_get_y_same',
                'buy_x_get_y_diff',
                'voucher_nominal',
            ])],
            'is_active' => ['nullable', 'boolean'],
            'start_at' => ['nullable', 'date'],
            'end_at' => ['nullable', 'date', 'after_or_equal:start_at'],
            'description' => ['nullable', 'string'],
        ];

        $typeRules = [];

        switch ($request->type) {
            case 'price_discount':
                $typeRules = [
                    'discount_nominal' => ['required', 'numeric', 'min:1'],
                    'target_product_ids' => ['required', 'array', 'min:1'],
                    'target_product_ids.*' => ['exists:products,id'],
                ];
                break;

            case 'buy_x_get_y_same':
                $typeRules = [
                    'buy_qty' => ['required', 'integer', 'min:1'],
                    'get_qty' => ['required', 'integer', 'min:1'],
                    'target_product_ids' => ['required', 'array', 'min:1'],
                    'target_product_ids.*' => ['exists:products,id'],
                ];
                break;

            case 'buy_x_get_y_diff':
                $typeRules = [
                    'buy_qty' => ['required', 'integer', 'min:1'],
                    'get_qty' => ['required', 'integer', 'min:1'],
                    'buy_product_ids' => ['required', 'array', 'min:1'],
                    'buy_product_ids.*' => ['exists:products,id'],
                    'get_product_ids' => ['required', 'array', 'min:1'],
                    'get_product_ids.*' => ['exists:products,id'],
                ];
                break;

            case 'voucher_nominal':
                $typeRules = [
                    'code' => [
                        'required',
                        'string',
                        'max:100',
                        Rule::unique('promotions', 'code')->ignore($promotionId),
                    ],
                    'discount_nominal' => ['required', 'numeric', 'min:1'],
                    'min_purchase' => ['nullable', 'numeric', 'min:0'],
                ];
                break;
        }

        return $request->validate(array_merge($baseRules, $typeRules));
    }

    protected function syncPromotionProducts(Promotion $promotion, Request $request): void
    {
        if (in_array($request->type, ['price_discount', 'buy_x_get_y_same'])) {
            foreach ($request->target_product_ids ?? [] as $productId) {
                $promotion->promotionProducts()->create([
                    'product_id' => $productId,
                    'role' => 'target',
                ]);
            }
        }

        if ($request->type === 'buy_x_get_y_diff') {
            foreach ($request->buy_product_ids ?? [] as $productId) {
                $promotion->promotionProducts()->create([
                    'product_id' => $productId,
                    'role' => 'buy',
                ]);
            }

            foreach ($request->get_product_ids ?? [] as $productId) {
                $promotion->promotionProducts()->create([
                    'product_id' => $productId,
                    'role' => 'get',
                ]);
            }
        }
    }
}