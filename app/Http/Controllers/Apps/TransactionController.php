<?php

namespace App\Http\Controllers\Apps;

use App\Exceptions\PaymentGatewayException;
use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\Customer;
use App\Models\PaymentSetting;
use App\Models\Product;
use App\Models\Extra;
use App\Models\TransactionDetailExtra;
use App\Models\Promotion;
use App\Models\Transaction;
use App\Services\Payments\PaymentGatewayManager;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TransactionController extends Controller
{
    /**
     * ============================================================
     * DISPLAY POS TRANSACTION PAGE
     * ============================================================
     */
    public function index()
    {
        $userId = auth()->user()->id;

        $carts = Cart::with('product')
            ->where('cashier_id', $userId)
            ->active()
            ->latest()
            ->get();

        $heldCarts = Cart::with('product:id,title,sell_price,image')
            ->where('cashier_id', $userId)
            ->held()
            ->get()
            ->groupBy('hold_id')
            ->map(function ($items, $holdId) {
                $first = $items->first();

                return [
                    'hold_id' => $holdId,
                    'pay_later_code' => $this->makePayLaterCode($holdId),
                    'label' => $first->hold_label ?: 'Pay Later',
                    'held_at' => $first->held_at?->toISOString(),
                    'items_count' => $items->sum('qty'),
                    'total' => $items->sum(fn ($item) => (float) $item->total),
                    'items' => $items->map(fn ($item) => [
                        'id' => $item->id,
                        'product' => $item->product,
                        'qty' => $item->qty,
                        'price' => $item->price,
                        'extras' => $item->extras ?? [],
                        'extras_total' => $item->extras_total,
                        'total' => $item->total,
                    ])->values(),
                ];
            })
            ->values();

        $customers = Customer::latest()->get();

        $products = Product::with([
                'category:id,name',
                'extras:id,name,price,is_active',
            ])
            ->select([
                'id', 'barcode', 'title', 'description', 'image',
                'buy_price', 'sell_price', 'stock', 'category_id',
            ])
            ->where('stock', '>', 0)
            ->orderBy('title')
            ->get();

        $categories = \App\Models\Category::select('id', 'name', 'image')
            ->orderBy('name')
            ->get();

        $paymentSetting = PaymentSetting::first();
        $promotions = $this->getAvailablePromotions();
        $cartsTotal = (float) $carts->sum(fn ($cart) => (float) $cart->total);

        $defaultGateway = $paymentSetting?->default_gateway
            ?? PaymentSetting::GATEWAY_CASH;

        if (
            ! in_array($defaultGateway, [
                PaymentSetting::GATEWAY_CASH,
                PaymentSetting::GATEWAY_DEBIT,
            ], true)
            && (! $paymentSetting || ! $paymentSetting->isGatewayReady($defaultGateway))
        ) {
            $defaultGateway = PaymentSetting::GATEWAY_CASH;
        }

        return Inertia::render('Dashboard/Transactions/Index', [
            'carts' => $carts,
            'carts_total' => $cartsTotal,
            'heldCarts' => $heldCarts,
            'customers' => $customers,
            'products' => $products,
            'categories' => $categories,
            'promotions' => $promotions,
            'paymentGateways' => $paymentSetting?->enabledGateways() ?? [],
            'defaultPaymentGateway' => $defaultGateway,
        ]);
    }

    /**
     * ============================================================
     * GENERATE PAY LATER CODE
     * ============================================================
     */

    /**
     * ============================================================
     * PROMOTION HELPERS
     * ============================================================
     */

    protected function getAvailablePromotions()
    {
        /*
        |--------------------------------------------------------------------------
        | Ambil promotion yang benar-benar aktif.
        |--------------------------------------------------------------------------
        |
        | Jangan menggunakan DB::table() + pengecekan nama kolom secara dinamis
        | untuk promotion. Struktur tabel promotion sudah jelas:
        |
        | promotions
        | promotion_products
        | products
        |
        | Model Promotion juga sudah mempunyai scopeActive(), sehingga aturan
        | is_active + start_at + end_at konsisten dengan halaman Promotion.
        |
        */

        return Promotion::query()
            ->active()
            ->with([
                'promotionProducts.product:id,barcode,title,sell_price,stock,image',
            ])
            ->orderBy('name')
            ->get()
            ->map(function (Promotion $promotion) {
                return $this->serializePromotionForPos($promotion);
            })
            ->values();
    }

    protected function findPromotionForPos($promotionId)
    {
        if (! $promotionId) {
            return null;
        }

        /*
        |--------------------------------------------------------------------------
        | Ambil hanya promotion aktif.
        |--------------------------------------------------------------------------
        |
        | Ini penting supaya promotion yang sudah expired / nonaktif tidak bisa
        | dipaksa masuk melalui request manual dari browser.
        |
        */

        $promotion = Promotion::query()
            ->active()
            ->with([
                'promotionProducts.product:id,barcode,title,sell_price,stock,image',
            ])
            ->find($promotionId);

        if (! $promotion) {
            return null;
        }

        return $this->serializePromotionForPos($promotion);
    }

    protected function serializePromotionForPos(Promotion $promotion): array
    {
        /*
        |--------------------------------------------------------------------------
        | Bentuk data yang dikirim ke React.
        |--------------------------------------------------------------------------
        |
        | Frontend POS menggunakan promotion_products. Kita sengaja membuat
        | format tersebut secara eksplisit supaya tidak tergantung pada nama
        | relasi camelCase Laravel.
        |
        */

        $data = $promotion->toArray();

        $data['promotion_products'] = $promotion->promotionProducts
            ->map(function ($promotionProduct) {
                return [
                    'id' => $promotionProduct->id,
                    'promotion_id' => $promotionProduct->promotion_id,
                    'product_id' => $promotionProduct->product_id,
                    'role' => $promotionProduct->role,
                    'product' => $promotionProduct->product,
                ];
            })
            ->values()
            ->all();

        return $data;
    }

    protected function promotionProductIds(
        array $promotion,
        ?string $role = null
    ): array {
        $items =
            $promotion['promotion_products']
            ?? $promotion['promotionProducts']
            ?? [];

        if (! is_array($items)) {
            return [];
        }

        return collect($items)
            ->filter(function ($item) use ($role) {
                if (! $role) {
                    return true;
                }

                return ($item['role'] ?? null) === $role
                    || ($item['pivot']['role'] ?? null) === $role;
            })
            ->map(fn ($item) => (int) (
                $item['product_id']
                ?? $item['pivot']['product_id']
                ?? $item['id']
                ?? 0
            ))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    protected function calculatePromotionDiscount(
        array $promotion,
        $carts,
        string $promotionCode = ''
    ): array {
        $subtotal = (float) $carts->sum(fn ($cart) => (float) $cart->total);

        if ($subtotal <= 0) {
            return [
                'discount' => 0,
                'error' => '',
                'message' => '',
            ];
        }

        $type = strtolower((string) (
            $promotion['type']
            ?? $promotion['promotion_type']
            ?? ''
        ));

        $minPurchase = (float) (
            $promotion['min_purchase']
            ?? $promotion['minimum_purchase']
            ?? 0
        );

        if (
            $minPurchase > 0
            && $subtotal < $minPurchase
        ) {
            return [
                'discount' => 0,
                'error' =>
                    'Minimum pembelian Rp '
                    . number_format(
                        $minPurchase,
                        0,
                        ',',
                        '.'
                    ) . '.',
                'message' => '',
            ];
        }

        foreach ([
            'start_at' => 'Promotion belum berlaku.',
            'valid_from' => 'Promotion belum berlaku.',
        ] as $field => $message) {
            if (
                ! empty($promotion[$field])
                && now()->lt(
                    \Carbon\Carbon::parse(
                        $promotion[$field]
                    )
                )
            ) {
                return [
                    'discount' => 0,
                    'error' => $message,
                    'message' => '',
                ];
            }
        }

        foreach ([
            'end_at' => 'Promotion sudah berakhir.',
            'valid_until' => 'Promotion sudah berakhir.',
        ] as $field => $message) {
            if (
                ! empty($promotion[$field])
                && now()->gt(
                    \Carbon\Carbon::parse(
                        $promotion[$field]
                    )
                )
            ) {
                return [
                    'discount' => 0,
                    'error' => $message,
                    'message' => '',
                ];
            }
        }

        $targetIds =
            $this->promotionProductIds(
                $promotion,
                'target'
            );

        $buyIds =
            $this->promotionProductIds(
                $promotion,
                'buy'
            );

        $getIds =
            $this->promotionProductIds(
                $promotion,
                'get'
            );

        $selectedIds =
            $this->promotionProductIds(
                $promotion
            );

        $inList = fn ($cart, $ids) =>
            in_array(
                (int) $cart->product_id,
                $ids,
                true
            );

        if (
            in_array(
                $type,
                [
                    'price_discount',
                    'percentage',
                    'percent',
                ],
                true
            )
        ) {
            $percentage = max(
                0,
                (float) (
                    $promotion['discount_percentage']
                    ?? $promotion['discount_percent']
                    ?? $promotion['percentage']
                    ?? $promotion['discount_value']
                    ?? 0
                )
            );

            $nominal = (float) (
                $promotion['discount_nominal']
                ?? $promotion['discount_amount']
                ?? 0
            );

            $eligible = $carts;

            if (
                ! empty($targetIds)
                || ! empty($selectedIds)
            ) {
                $ids = ! empty($targetIds)
                    ? $targetIds
                    : $selectedIds;

                $eligible = $carts->filter(
                    fn ($cart) =>
                        $inList($cart, $ids)
                );
            }

            $eligibleSubtotal = (float) $eligible->sum(fn ($cart) => (float) $cart->total);

            if ($percentage > 0) {
                $discount =
                    $eligibleSubtotal
                    * ($percentage / 100);

                $maxDiscount = (float) (
                    $promotion['max_discount']
                    ?? $promotion['maximum_discount']
                    ?? 0
                );

                if ($maxDiscount > 0) {
                    $discount =
                        min(
                            $discount,
                            $maxDiscount
                        );
                }
            } else {
                $discount =
                    min(
                        $eligibleSubtotal,
                        $nominal
                    );
            }

            return [
                'discount' => min(
                    $subtotal,
                    max(0, round($discount))
                ),
                'error' => '',
                'message' =>
                    'Promotion berhasil digunakan.',
            ];
        }

        if (
            in_array(
                $type,
                [
                    'voucher_nominal',
                    'voucher',
                ],
                true
            )
        ) {
            $requiredCode = strtoupper(
                trim((string) (
                    $promotion['code']
                    ?? $promotion['voucher_code']
                    ?? ''
                ))
            );

            if (
                $requiredCode
                && strtoupper(
                    trim($promotionCode)
                ) !== $requiredCode
            ) {
                return [
                    'discount' => 0,
                    'error' =>
                        'Kode voucher tidak sesuai.',
                    'message' => '',
                ];
            }

            $nominal = (float) (
                $promotion['discount_nominal']
                ?? $promotion['discount_amount']
                ?? $promotion['nominal']
                ?? 0
            );

            if ($nominal <= 0) {
                return [
                    'discount' => 0,
                    'error' =>
                        'Nominal voucher belum dikonfigurasi.',
                    'message' => '',
                ];
            }

            return [
                'discount' =>
                    min($subtotal, $nominal),
                'error' => '',
                'message' =>
                    'Voucher berhasil digunakan.',
            ];
        }

        if (
            in_array(
                $type,
                [
                    'buy_x_get_y_same',
                    'buyxgety_same',
                    'buy_x_get_y',
                ],
                true
            )
        ) {
            $buyQty = max(
                1,
                (int) (
                    $promotion['buy_qty']
                    ?? $promotion['buy_quantity']
                    ?? $promotion['x']
                    ?? 1
                )
            );

            $getQty = max(
                1,
                (int) (
                    $promotion['get_qty']
                    ?? $promotion['get_quantity']
                    ?? $promotion['y']
                    ?? 1
                )
            );

            $eligibleIds =
                ! empty($buyIds)
                    ? $buyIds
                    : (
                        ! empty($targetIds)
                            ? $targetIds
                            : $selectedIds
                    );

            $eligible =
                ! empty($eligibleIds)
                    ? $carts->filter(
                        fn ($cart) =>
                            $inList(
                                $cart,
                                $eligibleIds
                            )
                    )
                    : $carts;

            $totalQty =
                (int) $eligible->sum('qty');

            $freeQty =
                intdiv(
                    $totalQty,
                    $buyQty
                ) * $getQty;

            if ($freeQty <= 0) {
                return [
                    'discount' => 0,
                    'error' =>
                        "Minimal beli {$buyQty} item.",
                    'message' => '',
                ];
            }

            $freeCandidates =
                ! empty($getIds)
                    ? $eligible->filter(
                        fn ($cart) =>
                            $inList(
                                $cart,
                                $getIds
                            )
                    )
                    : $eligible;

            if (
                (int) $freeCandidates->sum('qty')
                < $freeQty
            ) {
                return [
                    'discount' => 0,
                    'error' =>
                        "Tambahkan {$freeQty} item promo ke keranjang.",
                    'message' => '',
                ];
            }

            $discount = 0;
            $remaining = $freeQty;

            $freeCandidates
                ->sortBy(
                    fn ($cart) =>
                        (float) (
                            $cart->product?->sell_price
                            ?? 0
                        )
                )
                ->each(function ($cart) use (
                    &$remaining,
                    &$discount
                ) {
                    if ($remaining <= 0) {
                        return;
                    }

                    $take = min(
                        $remaining,
                        (int) $cart->qty
                    );

                    $discount +=
                        $take
                        * (float) (
                            $cart->product?->sell_price
                            ?? 0
                        );

                    $remaining -= $take;
                });

            return [
                'discount' => min(
                    $subtotal,
                    max(0, round($discount))
                ),
                'error' => '',
                'message' =>
                    'Buy X Get Y berhasil digunakan.',
            ];
        }

        if (
            in_array(
                $type,
                [
                    'buy_x_get_y_diff',
                    'buyxgety_diff',
                ],
                true
            )
        ) {
            $buyQty = max(
                1,
                (int) (
                    $promotion['buy_qty']
                    ?? $promotion['buy_quantity']
                    ?? $promotion['x']
                    ?? 1
                )
            );

            $getQty = max(
                1,
                (int) (
                    $promotion['get_qty']
                    ?? $promotion['get_quantity']
                    ?? $promotion['y']
                    ?? 1
                )
            );

            $buyCandidates =
                ! empty($buyIds)
                    ? $carts->filter(
                        fn ($cart) =>
                            $inList(
                                $cart,
                                $buyIds
                            )
                    )
                    : $carts;

            $freeQty =
                intdiv(
                    (int) $buyCandidates->sum('qty'),
                    $buyQty
                ) * $getQty;

            if ($freeQty <= 0) {
                return [
                    'discount' => 0,
                    'error' =>
                        "Minimal beli {$buyQty} item produk promo.",
                    'message' => '',
                ];
            }

            $freeCandidates =
                ! empty($getIds)
                    ? $carts->filter(
                        fn ($cart) =>
                            $inList(
                                $cart,
                                $getIds
                            )
                    )
                    : $carts->filter(
                        fn ($cart) =>
                            ! in_array(
                                (int) $cart->product_id,
                                $buyIds,
                                true
                            )
                    );

            if (
                (int) $freeCandidates->sum('qty')
                < $freeQty
            ) {
                return [
                    'discount' => 0,
                    'error' =>
                        "Tambahkan {$freeQty} item produk gratis ke keranjang.",
                    'message' => '',
                ];
            }

            $discount = 0;
            $remaining = $freeQty;

            $freeCandidates
                ->sortBy(
                    fn ($cart) =>
                        (float) (
                            $cart->product?->sell_price
                            ?? 0
                        )
                )
                ->each(function ($cart) use (
                    &$remaining,
                    &$discount
                ) {
                    if ($remaining <= 0) {
                        return;
                    }

                    $take = min(
                        $remaining,
                        (int) $cart->qty
                    );

                    $discount +=
                        $take
                        * (float) (
                            $cart->product?->sell_price
                            ?? 0
                        );

                    $remaining -= $take;
                });

            return [
                'discount' => min(
                    $subtotal,
                    max(0, round($discount))
                ),
                'error' => '',
                'message' =>
                    'Buy X Get Y berhasil digunakan.',
            ];
        }

        return [
            'discount' => 0,
            'error' =>
                'Jenis promotion tidak dikenali.',
            'message' => '',
        ];
    }

    /**
     * ============================================================
     * APPLY PROMOTION
     * ============================================================
     */
    public function applyPromotion(Request $request)
    {
        $request->validate([
            'promotion_id' =>
                'required|integer',
            'promotion_code' =>
                'nullable|string|max:100',
        ]);

        $promotion =
            $this->findPromotionForPos(
                $request->promotion_id
            );

        if (! $promotion) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Promotion tidak ditemukan atau tidak aktif.',
                'discount' => 0,
            ], 404);
        }

        $carts = Cart::with('product')
            ->where(
                'cashier_id',
                auth()->id()
            )
            ->active()
            ->get();

        if ($carts->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Keranjang kosong.',
                'discount' => 0,
            ], 422);
        }

        $result =
            $this->calculatePromotionDiscount(
                $promotion,
                $carts,
                (string) $request->input(
                    'promotion_code',
                    ''
                )
            );

        if ($result['error']) {
            return response()->json([
                'success' => false,
                'message' => $result['error'],
                'discount' => 0,
            ], 422);
        }

        $subtotal = (float) $carts->sum(fn ($cart) => (float) $cart->total);

        return response()->json([
            'success' => true,
            'message' => $result['message'],
            'discount' => $result['discount'],
            'subtotal' => $subtotal,
            'grand_total' =>
                max(
                    0,
                    $subtotal - $result['discount']
                ),
            'promotion' => $promotion,
        ]);
    }

    protected function makePayLaterCode(
        ?string $holdId
    ): string {
        if (! $holdId) {
            return 'PL';
        }

        $holdId = (string) $holdId;

        if (
            str_starts_with(
                $holdId,
                'PAYLATER-'
            )
        ) {
            return 'PL-' . substr(
                $holdId,
                strlen('PAYLATER-')
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Support old HOLD data
        |--------------------------------------------------------------------------
        */

        if (
            str_starts_with(
                $holdId,
                'HOLD-'
            )
        ) {
            return 'PL-' . substr(
                $holdId,
                strlen('HOLD-')
            );
        }

        return $holdId;
    }

    /**
     * ============================================================
     * SEARCH PRODUCT BY BARCODE
     * ============================================================
     */
    public function searchProduct(Request $request)
    {
        $product = Product::with([
            'extras' => function ($query) {
                $query->where('is_active', true)
                    ->select('extras.id', 'extras.name', 'extras.price', 'extras.is_active');
            },
        ])->where('barcode', $request->barcode)->first();

        if ($product) {
            return response()->json([
                'success' => true,
                'data' => $product,
            ]);
        }

        return response()->json([
            'success' => false,
            'data' => null,
        ]);
    }

    /**
     * ============================================================
     * ADD PRODUCT TO ACTIVE CART
     * ============================================================
     */
    public function addToCart(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'qty' => 'required|integer|min:1',
            'sell_price' => 'nullable|numeric|min:0',
            'extras' => 'nullable|array',
            'extras.*.id' => 'required|integer|exists:extras,id',
            'extras.*.qty' => 'nullable|integer|min:1',
        ]);

        $userId = auth()->id();

        $product = Product::find($request->product_id);

        if (! $product) {
            return back()->with('error', 'Product not found.');
        }

        $qty = (int) $request->qty;

        $activeQty = (int) Cart::where('cashier_id', $userId)
            ->where('product_id', $product->id)
            ->active()
            ->sum('qty');

        if ($product->stock < ($activeQty + $qty)) {
            return back()->with(
                'error',
                'Stok tidak mencukupi. Tersedia: ' . $product->stock
            );
        }

        $requestedExtras = collect($request->input('extras', []))
            ->map(fn ($extra) => [
                'id' => (int) ($extra['id'] ?? 0),
                'qty' => max(1, (int) ($extra['qty'] ?? 1)),
            ])
            ->filter(fn ($extra) => $extra['id'] > 0)
            ->groupBy('id')
            ->map(fn ($items) => [
                'id' => $items->first()['id'],
                'qty' => $items->sum('qty'),
            ])
            ->values();

        $allowedExtras = $product->extras()
            ->where('extras.is_active', true)
            ->whereIn('extras.id', $requestedExtras->pluck('id')->all())
            ->get(['extras.id', 'extras.name', 'extras.price', 'extras.is_active'])
            ->keyBy('id');

        if ($requestedExtras->count() !== $allowedExtras->count()) {
            return back()->with(
                'error',
                'Extra yang dipilih tidak tersedia untuk produk ini.'
            );
        }

        $extras = $requestedExtras->map(function ($item) use ($allowedExtras) {
            $extra = $allowedExtras->get($item['id']);

            return [
                'id' => (int) $extra->id,
                'name' => $extra->name,
                'price' => (float) $extra->price,
                'qty' => (int) $item['qty'],
            ];
        })->values()->all();

        $normalizedExtras = collect($extras)
            ->sortBy('id')
            ->values()
            ->all();

        $extrasKey = json_encode($normalizedExtras, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

        $cart = Cart::where('product_id', $product->id)
            ->where('cashier_id', $userId)
            ->active()
            ->get()
            ->first(function ($cart) use ($extrasKey) {
                $current = collect($cart->extras ?? [])
                    ->map(fn ($extra) => [
                        'id' => (int) ($extra['id'] ?? 0),
                        'name' => $extra['name'] ?? '',
                        'price' => (float) ($extra['price'] ?? 0),
                        'qty' => (int) ($extra['qty'] ?? 1),
                    ])
                    ->sortBy('id')
                    ->values()
                    ->all();

                return json_encode($current, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) === $extrasKey;
            });

        if ($cart) {
            $newQty = (int) $cart->qty + $qty;

            if ($product->stock < ($activeQty + $qty)) {
                return back()->with(
                    'error',
                    'Stok tidak mencukupi. Tersedia: ' . $product->stock
                );
            }

            $cart->update([
                'qty' => $newQty,
                'price' => (float) $product->sell_price * $newQty,
                'extras' => $normalizedExtras,
            ]);
        } else {
            Cart::create([
                'cashier_id' => $userId,
                'product_id' => $product->id,
                'qty' => $qty,
                'price' => (float) $product->sell_price * $qty,
                'extras' => $normalizedExtras,
                'hold_id' => null,
                'hold_label' => null,
                'held_at' => null,
            ]);
        }

        return back()->with('success', 'Product Added Successfully!.');
    }

    /**
     * ============================================================
     * DELETE ACTIVE CART ITEM
     * ============================================================
     */
    public function destroyCart(
        $cart_id
    ) {
        $cart = Cart::with('product')
            ->whereId($cart_id)
            ->where(
                'cashier_id',
                auth()->user()->id
            )
            ->active()
            ->first();

        if ($cart) {
            $cart->delete();

            return back();
        }

        return back()
            ->withErrors([
                'message' =>
                    'Cart not found',
            ]);
    }

    /**
     * ============================================================
     * UPDATE ACTIVE CART QUANTITY
     * ============================================================
     */
    public function updateCart(Request $request, $cart_id)
    {
        $request->validate([
            'qty' => 'required|integer|min:1',
        ]);

        $cart = Cart::with('product')
            ->whereId($cart_id)
            ->where('cashier_id', auth()->id())
            ->active()
            ->first();

        if (! $cart) {
            return response()->json([
                'success' => false,
                'message' => 'Cart item not found',
            ], 404);
        }

        if (! $cart->product) {
            return response()->json([
                'success' => false,
                'message' => 'Produk tidak ditemukan.',
            ], 404);
        }

        $otherQty = (int) Cart::where('cashier_id', auth()->id())
            ->where('product_id', $cart->product_id)
            ->where('id', '!=', $cart->id)
            ->active()
            ->sum('qty');

        if ($cart->product->stock < ($otherQty + (int) $request->qty)) {
            return response()->json([
                'success' => false,
                'message' => 'Stok tidak mencukupi. Tersedia: ' . $cart->product->stock,
            ], 422);
        }

        $cart->update([
            'qty' => (int) $request->qty,
            'price' => (float) $cart->product->sell_price * (int) $request->qty,
        ]);

        return back()->with('success', 'Quantity updated successfully');
    }

    /**
     * ============================================================
     * PAY LATER
     * ============================================================
     *
     * Menyimpan cart aktif sebagai Pay Later.
     *
     * BELUM membuat Transaction.
     * BELUM mengurangi stock.
     * BELUM dianggap paid.
     */
    public function holdCart(
        Request $request
    ) {
        $request->validate([
            'label' =>
                'nullable|string|max:50',
        ]);

        $userId =
            auth()->user()->id;

        /*
        |--------------------------------------------------------------------------
        | Ambil active cart
        |--------------------------------------------------------------------------
        */

        $activeCarts = Cart::where(
            'cashier_id',
            $userId
        )
            ->active()
            ->get();

        if (
            $activeCarts->isEmpty()
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Keranjang kosong, tidak ada transaksi yang bisa disimpan sebagai Pay Later.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Generate Pay Later ID
        |--------------------------------------------------------------------------
        */

        $holdId =
            'PAYLATER-'
            . strtoupper(
                Str::random(8)
            );

        /*
        |--------------------------------------------------------------------------
        | Label
        |--------------------------------------------------------------------------
        */

        $label = trim(
            (string) $request->input(
                'label',
                ''
            )
        );

        if ($label === '') {
            $label =
                'Pay Later '
                . now()->format('H:i');
        }

        /*
        |--------------------------------------------------------------------------
        | Simpan
        |--------------------------------------------------------------------------
        */

        Cart::where(
            'cashier_id',
            $userId
        )
            ->active()
            ->update([
                'hold_id' =>
                    $holdId,

                'hold_label' =>
                    $label,

                'held_at' =>
                    now(),
            ]);

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return back()
            ->with(
                'success',
                'Pay Later berhasil disimpan: '
                . $label
            );
    }

    /**
     * ============================================================
     * RESUME / BUKA PAY LATER
     * ============================================================
     */
    public function resumeCart(
        $holdId
    ) {
        $userId =
            auth()->user()->id;

        /*
        |--------------------------------------------------------------------------
        | Jangan buka kalau masih ada active cart
        |--------------------------------------------------------------------------
        */

        $activeCarts = Cart::where(
            'cashier_id',
            $userId
        )
            ->active()
            ->count();

        if (
            $activeCarts > 0
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Selesaikan atau simpan transaksi aktif sebagai Pay Later terlebih dahulu.',
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | Cari Pay Later
        |--------------------------------------------------------------------------
        */

        $heldCarts = Cart::where(
            'cashier_id',
            $userId
        )
            ->forHold($holdId)
            ->get();

        if (
            $heldCarts->isEmpty()
        ) {
            return response()->json([
                'success' => false,
                'message' =>
                    'Transaksi Pay Later tidak ditemukan.',
            ], 404);
        }

        /*
        |--------------------------------------------------------------------------
        | Buka Pay Later menjadi active cart
        |--------------------------------------------------------------------------
        */

        Cart::where(
            'cashier_id',
            $userId
        )
            ->forHold($holdId)
            ->update([
                'hold_id' =>
                    null,

                'hold_label' =>
                    null,

                'held_at' =>
                    null,
            ]);

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return back()
            ->with(
                'success',
                'Pay Later berhasil dibuka. Silakan lakukan pembayaran.'
            );
    }

    /**
     * ============================================================
     * DELETE PAY LATER
     * ============================================================
     *
     * Pay Later disimpan di tabel carts.
     *
     * Karena itu jangan menggunakan session('held_carts').
     *
     * Hapus seluruh cart yang mempunyai hold_id tersebut.
     */
    public function clearHold(
        $holdId
    ) {
        $userId = auth()->user()->id;

        /*
        |--------------------------------------------------------------------------
        | Cari Pay Later milik cashier yang login
        |--------------------------------------------------------------------------
        */

        $heldCarts = Cart::where(
            'cashier_id',
            $userId
        )
            ->where(
                'hold_id',
                $holdId
            )
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Tidak ditemukan
        |--------------------------------------------------------------------------
        */

        if ($heldCarts->isEmpty()) {
            return back()
                ->withErrors([
                    'message' =>
                        'Pay Later tidak ditemukan.',
                ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Hapus semua item Pay Later
        |--------------------------------------------------------------------------
        */

        Cart::where(
            'cashier_id',
            $userId
        )
            ->where(
                'hold_id',
                $holdId
            )
            ->delete();

        /*
        |--------------------------------------------------------------------------
        | Log
        |--------------------------------------------------------------------------
        */

        Log::info(
            'PAY LATER DELETED',
            [
                'cashier_id' =>
                    $userId,

                'hold_id' =>
                    $holdId,

                'items_deleted' =>
                    $heldCarts->count(),
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Redirect ke halaman transaksi
        |--------------------------------------------------------------------------
        |
        | Jangan return JSON karena request delete berasal dari Inertia.
        |
        */

        return redirect()
            ->route(
                'transactions.index'
            )
            ->with(
                'success',
                'Pay Later berhasil dihapus.'
            );
    }

    /**
     * ============================================================
     * GET PAY LATER
     * ============================================================
     */
    public function getHeldCarts()
    {
        $userId =
            auth()->user()->id;

        $heldCarts = Cart::with(
            'product:id,title,sell_price,image'
        )
            ->where(
                'cashier_id',
                $userId
            )
            ->held()
            ->get()
            ->groupBy('hold_id')
            ->map(function (
                $items,
                $holdId
            ) {
                $first =
                    $items->first();

                return [
                    'hold_id' =>
                        $holdId,

                    'pay_later_code' =>
                        $this->makePayLaterCode(
                            $holdId
                        ),

                    'label' =>
                        $first->hold_label
                        ?: 'Pay Later',

                    'held_at' =>
                        $first->held_at,

                    'items_count' =>
                        $items->sum('qty'),

                    'total' =>
                        $items->sum(fn ($item) => (float) $item->total),

                    'items' =>
                        $items->map(
                            fn ($item) => [
                                'id' =>
                                    $item->id,

                                'product' =>
                                    $item->product,

                                'qty' =>
                                    $item->qty,

                                'price' =>
                                    $item->price,
                                'extras' =>
                                    $item->extras ?? [],
                                'extras_total' =>
                                    $item->extras_total,
                                'total' =>
                                    $item->total,
                            ]
                        )->values(),
                ];
            })
            ->values();

        return response()->json([
            'success' =>
                true,

            'held_carts' =>
                $heldCarts,
        ]);
    }

    /**
     * ============================================================
     * STORE TRANSACTION
     * ============================================================
     *
     * CASH
     * - paid
     * - stock berkurang
     *
     * DEBIT
     * - paid
     * - stock berkurang
     *
     * INSTANTPAY
     * - pending
     * - stock belum berkurang
     * - browser melakukan polling
     */
    public function store(
        Request $request,
        PaymentGatewayManager $paymentGatewayManager
    ) {
        $paymentMethod = strtolower(
            $request->input(
                'payment_gateway'
            ) ?: PaymentSetting::GATEWAY_CASH
        );

        /*
        |--------------------------------------------------------------------------
        | Local payment
        |--------------------------------------------------------------------------
        */

        $localPaymentMethods = [
            PaymentSetting::GATEWAY_CASH,
            PaymentSetting::GATEWAY_DEBIT,
        ];

        $isLocalPayment =
            in_array(
                $paymentMethod,
                $localPaymentMethods,
                true
            );

        $isCashPayment =
            $paymentMethod
            === PaymentSetting::GATEWAY_CASH;

        /*
        |--------------------------------------------------------------------------
        | Online gateway
        |--------------------------------------------------------------------------
        */

        $paymentGateway =
            $isLocalPayment
                ? null
                : $paymentMethod;

        $paymentSetting = null;

        if (
            $paymentGateway
        ) {
            $paymentSetting =
                PaymentSetting::first();

            if (
                ! $paymentSetting
                || ! $paymentSetting->isGatewayReady(
                    $paymentGateway
                )
            ) {
                return redirect()
                    ->route(
                        'transactions.index'
                    )
                    ->with(
                        'error',
                        'Gateway pembayaran belum dikonfigurasi.'
                    );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Generate invoice
        |--------------------------------------------------------------------------
        */

        $length = 10;

        $random = '';

        for (
            $i = 0;
            $i < $length;
            $i++
        ) {
            $random .= rand(0, 1)
                ? rand(0, 9)
                : chr(
                    rand(
                        ord('a'),
                        ord('z')
                    )
                );
        }

        $invoice =
            'TRX-'
            . Str::upper($random);

        /*
        |--------------------------------------------------------------------------
        | Payment amount
        |--------------------------------------------------------------------------
        */

        $cashAmount =
            $isLocalPayment
                ? $request->cash
                : $request->grand_total;

        $changeAmount =
            $isCashPayment
                ? $request->change
                : 0;

        /*
        |--------------------------------------------------------------------------
        | Create transaction
        |--------------------------------------------------------------------------
        */

        try {
        $transaction = DB::transaction(
            function () use (
                $request,
                $invoice,
                $cashAmount,
                $changeAmount,
                $paymentMethod,
                $isLocalPayment,
                $isCashPayment
            ) {
                $userId =
                    auth()->user()->id;

                /*
                |--------------------------------------------------------------------------
                | Ambil ACTIVE cart saja
                |--------------------------------------------------------------------------
                */

                $carts = Cart::with(
                    'product'
                )
                    ->where(
                        'cashier_id',
                        $userId
                    )
                    ->active()
                    ->get();

                if (
                    $carts->isEmpty()
                ) {
                    throw new \RuntimeException(
                        'Keranjang kosong.'
                    );
                }

                /*
                 |--------------------------------------------------------------------------
                 | Promotion - server side validation
                 |--------------------------------------------------------------------------
                 */
                $promotion = null;
                $promotionDiscount = 0;

                if (
                    $request->filled('promotion_id')
                ) {
                    $promotion =
                        $this->findPromotionForPos(
                            $request->promotion_id
                        );

                    if (! $promotion) {
                        throw new \RuntimeException(
                            'Promotion tidak ditemukan atau sudah tidak aktif.'
                        );
                    }

                    $promotionResult =
                        $this->calculatePromotionDiscount(
                            $promotion,
                            $carts,
                            (string) $request->input(
                                'promotion_code',
                                ''
                            )
                        );

                    if ($promotionResult['error']) {
                        throw new \RuntimeException(
                            $promotionResult['error']
                        );
                    }

                    $promotionDiscount =
                        (float) $promotionResult['discount'];
                }

                $subtotal =
                    (float) $carts->sum(fn ($cart) => (float) $cart->total);

                /*
                 |--------------------------------------------------------------------------
                 | Frontend mengirim discount gabungan:
                 | manual discount + promotion discount.
                 |
                 | Promotion dihitung ulang di server.
                 | Manual discount tetap dipertahankan.
                 |--------------------------------------------------------------------------
                 */
                $requestedDiscount =
                    max(
                        0,
                        (float) $request->input(
                            'discount',
                            0
                        )
                    );

                $manualDiscount =
                    max(
                        0,
                        $requestedDiscount
                        - $promotionDiscount
                    );

                $manualDiscount =
                    min(
                        $manualDiscount,
                        max(
                            0,
                            $subtotal
                            - $promotionDiscount
                        )
                    );

                $totalDiscount =
                    min(
                        $subtotal,
                        $promotionDiscount
                        + $manualDiscount
                    );

                $grandTotal =
                    max(
                        0,
                        $subtotal
                        - $totalDiscount
                    );

                if (
                    $grandTotal >= 200000
                    && ! $request->filled(
                        'customer_id'
                    )
                ) {
                    throw new \RuntimeException(
                        'Pilih pelanggan terlebih dahulu untuk transaksi di atas Rp200.000.'
                    );
                }

                if (
                    $isCashPayment
                    && (
                        (float) $request->input(
                            'cash',
                            0
                        ) < $grandTotal
                    )
                ) {
                    throw new \RuntimeException(
                        'Jumlah pembayaran kurang dari total.'
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Check stock
                |--------------------------------------------------------------------------
                */

                foreach (
                    $carts as $cart
                ) {
                    if (
                        ! $cart->product
                        || $cart->product->stock
                            < $cart->qty
                    ) {
                        throw new \RuntimeException(
                            'Stok produk '
                            . (
                                $cart->product?->title
                                ?? '-'
                            )
                            . ' tidak mencukupi.'
                        );
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | Create transaction
                |--------------------------------------------------------------------------
                */

                $transactionData = [
                    'cashier_id' =>
                        $userId,

                    'customer_id' =>
                        $request->customer_id,

                    'invoice' =>
                        $invoice,

                    'cash' =>
                        $isLocalPayment
                            ? (float) $request->input(
                                'cash',
                                0
                            )
                            : $grandTotal,

                    'change' =>
                        $changeAmount,

                    'discount' =>
                        $totalDiscount,

                    'grand_total' =>
                        $grandTotal,

                    'payment_method' =>
                        $paymentMethod,

                    'payment_status' =>
                        $isLocalPayment
                            ? 'paid'
                            : 'pending',
                ];

                if (
                    Schema::hasColumn(
                        'transactions',
                        'promotion_id'
                    )
                ) {
                    $transactionData['promotion_id'] =
                        $promotion['id'] ?? null;
                }

                if (
                    Schema::hasColumn(
                        'transactions',
                        'promotion_code'
                    )
                ) {
                    $transactionData['promotion_code'] =
                        $request->input(
                            'promotion_code'
                        ) ?: (
                            $promotion['code']
                            ?? null
                        );
                }

                if (
                    Schema::hasColumn(
                        'transactions',
                        'promotion_discount'
                    )
                ) {
                    $transactionData['promotion_discount'] =
                        $promotionDiscount;
                }

                $transaction =
                    Transaction::create(
                        $transactionData
                    );

                $promotionData = [];

                if (
                    Schema::hasColumn(
                        'transactions',
                        'promotion_id'
                    )
                ) {
                    $promotionData['promotion_id'] =
                        $promotion['id'] ?? null;
                }

                if (
                    Schema::hasColumn(
                        'transactions',
                        'promotion_code'
                    )
                ) {
                    $promotionData['promotion_code'] =
                        $request->input(
                            'promotion_code'
                        ) ?: (
                            $promotion['code']
                            ?? null
                        );
                }

                if (
                    Schema::hasColumn(
                        'transactions',
                        'promotion_discount'
                    )
                ) {
                    $promotionData['promotion_discount'] =
                        $promotionDiscount;
                }

                if ($promotionData) {
                    $transaction->forceFill(
                        $promotionData
                    )->save();
                }

/*
                |--------------------------------------------------------------------------
                | Transaction details
                |--------------------------------------------------------------------------
                |
                | Simpan detail dengan harga normal cart. Promotion tidak mengubah
                | harga detail; promotion disimpan di transaction dan diperhitungkan
                | pada revenue/profit aktual di bawah.
                |
                */

                $totalBuyPrice = 0;

                foreach ($carts as $cart) {
                    $detail = $transaction
                        ->details()
                        ->create([
                            'transaction_id' => $transaction->id,
                            'product_id' => $cart->product_id,
                            'qty' => $cart->qty,
                            'price' => $cart->price,
                        ]);

                    foreach (($cart->extras ?? []) as $cartExtra) {
                        $extraId = (int) ($cartExtra['id'] ?? 0);
                        $extraQty = max(1, (int) ($cartExtra['qty'] ?? 1));

                        if ($extraId <= 0) {
                            continue;
                        }

                        $extra = Extra::query()
                            ->where('is_active', true)
                            ->whereHas('products', function ($query) use ($cart) {
                                $query->where('products.id', $cart->product_id);
                            })
                            ->find($extraId);

                        if (! $extra) {
                            throw new \RuntimeException(
                                'Extra tidak valid untuk produk ' . ($cart->product?->title ?? '-') . '.'
                            );
                        }

                        TransactionDetailExtra::create([
                            'transaction_detail_id' => $detail->id,
                            'extra_id' => $extra->id,
                            'qty' => $extraQty,
                            'price' => (float) $extra->price,
                        ]);
                    }

                    $totalBuyPrice +=
                        (float) ($cart->product->buy_price ?? 0)
                        * (int) $cart->qty;
                }

                /*
                |--------------------------------------------------------------------------
                | Profit aktual transaksi
                |--------------------------------------------------------------------------
                |
                | Profit dihitung dari revenue aktual setelah seluruh discount,
                | termasuk promotion, dikurangi total modal semua barang yang
                | keluar dari stock.
                |
                | Contoh:
                |   Harga jual   = Rp38.000
                |   Modal        = Rp30.000
                |   Promotion    = Rp5.000
                |   Revenue      = Rp33.000
                |   Profit       = Rp3.000
                |
                | Untuk Buy X Get Y, item gratis tetap mempunyai modal sehingga
                | profit dapat menjadi negatif. Ini adalah profit aktual.
                |
                */

                $actualRevenue = (float) $grandTotal;

                $actualProfit =
                    $actualRevenue
                    - $totalBuyPrice;

                $transaction
                    ->profits()
                    ->create([
                        'transaction_id' =>
                            $transaction->id,

                        'total' =>
                            $actualProfit,
                    ]);

                /*
                |--------------------------------------------------------------------------
                | Cash / Debit
                |--------------------------------------------------------------------------
                |
                | Stock langsung dikurangi.
                |
                */

                if (
                    $isLocalPayment
                ) {
                    foreach (
                        $carts as $cart
                    ) {
                        $product =
                            Product::lockForUpdate()
                                ->find(
                                    $cart->product_id
                                );

                        if (
                            ! $product
                        ) {
                            throw new \RuntimeException(
                                'Produk tidak ditemukan.'
                            );
                        }

                        if (
                            $product->stock
                            < $cart->qty
                        ) {
                            throw new \RuntimeException(
                                'Stok produk '
                                . $product->title
                                . ' tidak mencukupi.'
                            );
                        }

                        $product->decrement(
                            'stock',
                            $cart->qty
                        );
                    }
                }

                /*
                |--------------------------------------------------------------------------
                | Hapus active cart
                |--------------------------------------------------------------------------
                |
                | Pay Later tidak pernah masuk bagian ini karena
                | Pay Later bukan active().
                |
                */

                Cart::where(
                    'cashier_id',
                    $userId
                )
                    ->active()
                    ->delete();

                return $transaction->fresh([
                    'customer',
                ]);
            }
        );
        } catch (\Throwable $exception) {
            Log::error(
                'TRANSACTION STORE ERROR',
                [
                    'user_id' =>
                        auth()->id(),
                    'payment_method' =>
                        $paymentMethod,
                    'message' =>
                        $exception->getMessage(),
                ]
            );

            if (
                $paymentMethod ===
                PaymentSetting::GATEWAY_INSTANTPAY
            ) {
                return response()->json([
                    'success' => false,
                    'message' =>
                        $exception->getMessage(),
                ], 422);
            }

            return redirect()
                ->route(
                    'transactions.index'
                )
                ->with(
                    'error',
                    $exception->getMessage()
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Online payment
        |--------------------------------------------------------------------------
        */

        $paymentResponse = null;

        if (
            $paymentGateway
        ) {
            try {
                $paymentResponse =
                    $paymentGatewayManager
                        ->createPayment(
                            $transaction,
                            $paymentGateway,
                            $paymentSetting
                        );

                $transaction->update([
                    'payment_reference' =>
                        $paymentResponse['reference']
                        ?? null,

                    'payment_url' =>
                        $paymentResponse['payment_url']
                        ?? null,
                ]);

                $transaction->refresh();
            } catch (
                PaymentGatewayException $exception
            ) {
                if (
                    $paymentMethod
                    === PaymentSetting::GATEWAY_INSTANTPAY
                ) {
                    return response()->json([
                        'success' =>
                            false,

                        'message' =>
                            $exception->getMessage(),
                    ], 422);
                }

                return redirect()
                    ->route(
                        'transactions.print',
                        $transaction->invoice
                    )
                    ->with(
                        'error',
                        $exception->getMessage()
                    );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | INSTANTPAY
        |--------------------------------------------------------------------------
        |
        | Jangan redirect.
        |
        | React membutuhkan transaction_id untuk polling.
        |
        */

        if (
            $paymentGateway
            === PaymentSetting::GATEWAY_INSTANTPAY
        ) {
            return response()->json([
                'success' =>
                    true,

                'transaction_id' =>
                    $transaction->id,

                'invoice' =>
                    $transaction->invoice,

                'payment_reference' =>
                    $transaction->payment_reference,

                'payment_url' =>
                    $transaction->payment_url,

                'qris_string' =>
                    $paymentResponse['qris_string']
                    ?? null,

                'unique_amount' =>
                    $paymentResponse['unique_amount']
                    ?? null,

                'status' =>
                    $paymentResponse['status']
                    ?? 'pending',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | CASH / DEBIT
        |--------------------------------------------------------------------------
        */

        if (
            $isLocalPayment
        ) {
            return to_route(
                'transactions.print',
                $transaction->invoice
            );
        }

        return to_route(
            'transactions.print',
            $transaction->invoice
        );
    }

    /**
     * ============================================================
     * POLLING INSTANTPAY PAYMENT STATUS
     * ============================================================
     *
     * Tidak menggunakan webhook.
     *
     * Browser akan memanggil endpoint ini secara berkala.
     */
    public function paymentStatus(
        Transaction $transaction,
        PaymentGatewayManager $paymentGatewayManager
    ) {
        Log::info(
            'INSTANTPAY POLLING HIT',
            [
                'transaction_id' =>
                    $transaction->id,

                'invoice' =>
                    $transaction->invoice,

                'payment_method' =>
                    $transaction->payment_method,

                'payment_status' =>
                    $transaction->payment_status,

                'payment_reference' =>
                    $transaction->payment_reference,

                'cashier_id' =>
                    $transaction->cashier_id,

                'current_user_id' =>
                    auth()->id(),
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Authorization
        |--------------------------------------------------------------------------
        */

        if (
            ! auth()->user()->isSuperAdmin()
            && (
                (int) $transaction->cashier_id
                !== (int) auth()->id()
            )
        ) {
            Log::warning(
                'INSTANTPAY POLLING UNAUTHORIZED',
                [
                    'transaction_id' =>
                        $transaction->id,

                    'cashier_id' =>
                        $transaction->cashier_id,

                    'user_id' =>
                        auth()->id(),
                ]
            );

            return response()->json([
                'success' =>
                    false,

                'status' =>
                    'failed',

                'message' =>
                    'Unauthorized.',
            ], 403);
        }

        /*
        |--------------------------------------------------------------------------
        | Pastikan Instantpay
        |--------------------------------------------------------------------------
        */

        if (
            strtolower(
                (string) $transaction->payment_method
            )
            !== PaymentSetting::GATEWAY_INSTANTPAY
        ) {
            return response()->json([
                'success' =>
                    false,

                'status' =>
                    $transaction->payment_status,

                'message' =>
                    'Bukan transaksi Instantpay.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Sudah paid
        |--------------------------------------------------------------------------
        */

        if (
            strtolower(
                (string) $transaction->payment_status
            ) === 'paid'
        ) {
            return response()->json([
                'success' =>
                    true,

                'status' =>
                    'paid',

                'invoice' =>
                    $transaction->invoice,

                'message' =>
                    'Pembayaran sudah berhasil.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Payment setting
        |--------------------------------------------------------------------------
        */

        $paymentSetting =
            PaymentSetting::first();

        if (
            ! $paymentSetting
            || ! $paymentSetting->isGatewayReady(
                PaymentSetting::GATEWAY_INSTANTPAY
            )
        ) {
            Log::error(
                'INSTANTPAY CONFIG NOT READY'
            );

            return response()->json([
                'success' =>
                    false,

                'status' =>
                    'failed',

                'message' =>
                    'Instantpay belum dikonfigurasi.',
            ], 422);
        }

        try {
            /*
            |--------------------------------------------------------------------------
            | Check gateway
            |--------------------------------------------------------------------------
            */

            Log::info(
                'INSTANTPAY CHECKING GATEWAY',
                [
                    'transaction_id' =>
                        $transaction->id,

                    'invoice' =>
                        $transaction->invoice,

                    'reference' =>
                        $transaction->payment_reference,
                ]
            );

            $result =
                $paymentGatewayManager
                    ->getPaymentStatus(
                        $transaction,
                        PaymentSetting::GATEWAY_INSTANTPAY,
                        $paymentSetting
                    );

            Log::info(
                'INSTANTPAY GATEWAY RESULT',
                [
                    'transaction_id' =>
                        $transaction->id,

                    'result' =>
                        $result,
                ]
            );

            $status =
                strtolower(
                    (string) (
                        $result['status']
                        ?? 'pending'
                    )
                );

            /*
            |--------------------------------------------------------------------------
            | PAID
            |--------------------------------------------------------------------------
            */

            if (
                $status === 'paid'
            ) {
                Log::info(
                    'INSTANTPAY PAYMENT CONFIRMED PAID',
                    [
                        'transaction_id' =>
                            $transaction->id,

                        'invoice' =>
                            $transaction->invoice,

                        'reference' =>
                            $transaction->payment_reference,
                    ]
                );

                $this->completeInstantpayTransaction(
                    $transaction,
                    $result
                );

                return response()->json([
                    'success' =>
                        true,

                    'status' =>
                        'paid',

                    'invoice' =>
                        $transaction->invoice,

                    'message' =>
                        'Pembayaran berhasil.',
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | FAILED
            |--------------------------------------------------------------------------
            */

            if (
                $status === 'failed'
            ) {
                return response()->json([
                    'success' =>
                        true,

                    'status' =>
                        'failed',

                    'message' =>
                        'Pembayaran Instantpay gagal.',
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | EXPIRED
            |--------------------------------------------------------------------------
            */

            if (
                $status === 'expired'
            ) {
                return response()->json([
                    'success' =>
                        true,

                    'status' =>
                        'expired',

                    'message' =>
                        'Pembayaran Instantpay expired.',
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | PENDING
            |--------------------------------------------------------------------------
            */

            return response()->json([
                'success' =>
                    true,

                'status' =>
                    'pending',

                'message' =>
                    'Menunggu pembayaran.',
            ]);
        } catch (
            PaymentGatewayException $e
        ) {
            Log::error(
                'INSTANTPAY PAYMENT STATUS ERROR',
                [
                    'transaction_id' =>
                        $transaction->id,

                    'invoice' =>
                        $transaction->invoice,

                    'reference' =>
                        $transaction->payment_reference,

                    'message' =>
                        $e->getMessage(),
                ]
            );

            return response()->json([
                'success' =>
                    false,

                /*
                |--------------------------------------------------------------------------
                | Jangan anggap gateway error sebagai paid
                |--------------------------------------------------------------------------
                */

                'status' =>
                    'pending',

                'message' =>
                    $e->getMessage(),
            ]);
        } catch (
            \Throwable $e
        ) {
            Log::error(
                'INSTANTPAY PAYMENT STATUS EXCEPTION',
                [
                    'transaction_id' =>
                        $transaction->id,

                    'invoice' =>
                        $transaction->invoice,

                    'message' =>
                        $e->getMessage(),

                    'file' =>
                        $e->getFile(),

                    'line' =>
                        $e->getLine(),
                ]
            );

            return response()->json([
                'success' =>
                    false,

                'status' =>
                    'pending',

                'message' =>
                    'Gagal mengecek status pembayaran.',
            ]);
        }
    }

    /**
     * ============================================================
     * COMPLETE INSTANTPAY TRANSACTION
     * ============================================================
     *
     * Dipanggil hanya ketika Instantpay sudah PAID.
     */
    protected function completeInstantpayTransaction(
        Transaction $transaction,
        array $paymentResponse = []
    ): void {
        DB::transaction(
            function () use (
                $transaction,
                $paymentResponse
            ) {
                /*
                |--------------------------------------------------------------------------
                | Lock transaction
                |--------------------------------------------------------------------------
                */

                $transaction =
                    Transaction::with('details')
                        ->lockForUpdate()
                        ->findOrFail(
                            $transaction->id
                        );

                /*
                |--------------------------------------------------------------------------
                | Idempotency
                |--------------------------------------------------------------------------
                |
                | Polling bisa dipanggil berkali-kali.
                |
                | Jangan sampai stock berkurang dua kali.
                |
                */

                if (
                    strtolower(
                        (string)
                            $transaction->payment_status
                    )
                    === 'paid'
                ) {
                    return;
                }

                /*
                |--------------------------------------------------------------------------
                | Update payment
                |--------------------------------------------------------------------------
                */

                $transaction->payment_status =
                    'paid';

                if (
                    ! empty(
                        $paymentResponse['reference']
                    )
                ) {
                    $transaction->payment_reference =
                        $paymentResponse['reference'];
                }

                $transaction->save();

                /*
                |--------------------------------------------------------------------------
                | Kurangi stock SEKALI
                |--------------------------------------------------------------------------
                */

                foreach (
                    $transaction->details
                    as $detail
                ) {
                    $product =
                        Product::lockForUpdate()
                            ->find(
                                $detail->product_id
                            );

                    if (
                        ! $product
                    ) {
                        throw new \RuntimeException(
                            'Produk transaksi tidak ditemukan.'
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Jangan sampai stock negatif
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $product->stock
                        < $detail->qty
                    ) {
                        throw new \RuntimeException(
                            'Stok produk '
                            . $product->title
                            . ' tidak mencukupi untuk menyelesaikan transaksi.'
                        );
                    }

                    $product->decrement(
                        'stock',
                        $detail->qty
                    );
                }
            }
        );
    }

    /**
     * ============================================================
     * PRINT TRANSACTION
     * ============================================================
     */
    public function print($invoice)
    {
        /*
        |--------------------------------------------------------------------------
        | Ambil transaksi beserta detail produk
        |--------------------------------------------------------------------------
        */
        $transaction = Transaction::with([
            'details.product',
            'cashier',
            'customer',
        ])
            ->where('invoice', $invoice)
            ->firstOrFail();

        /*
        |--------------------------------------------------------------------------
        | LOAD EXTRA TRANSAKSI
        |--------------------------------------------------------------------------
        |
        | Extra pada cart disimpan ke tabel transaction_detail_extras
        | ketika transaksi selesai.
        |
        | Sebelumnya method print hanya melakukan:
        |
        |     details.product
        |
        | sehingga data Extra tidak pernah dikirim ke React.
        |
        | Di sini kita ambil langsung berdasarkan transaction_detail_id
        | lalu menempelkan hasilnya sebagai attribute "extras" pada
        | masing-masing transaction detail.
        |
        */

        $details = $transaction->details;

        if ($details->isNotEmpty()) {
            $detailIds = $details
                ->pluck('id')
                ->filter()
                ->values();

            if ($detailIds->isNotEmpty()) {
                $detailExtras = TransactionDetailExtra::query()
                    ->with('extra')
                    ->whereIn(
                        'transaction_detail_id',
                        $detailIds
                    )
                    ->get()
                    ->groupBy('transaction_detail_id');

                $details->each(function ($detail) use ($detailExtras) {
                    $extras = $detailExtras
                        ->get($detail->id, collect())
                        ->map(function ($detailExtra) {
                            $extra = $detailExtra->extra;

                            return [
                                'id' => (int) (
                                    $detailExtra->extra_id
                                    ?? $extra?->id
                                    ?? 0
                                ),

                                'name' => $extra?->name
                                    ?? $extra?->title
                                    ?? 'Extra',

                                'price' => (float) (
                                    $detailExtra->price
                                    ?? $extra?->price
                                    ?? 0
                                ),

                                'qty' => max(
                                    1,
                                    (int) (
                                        $detailExtra->qty
                                        ?? 1
                                    )
                                ),
                            ];
                        })
                        ->values()
                        ->all();

                    /*
                     * Attribute ini otomatis ikut dikirim oleh
                     * Inertia/JSON ke Print.jsx.
                     */
                    $detail->setAttribute(
                        'extras',
                        $extras
                    );
                });
            }
        }

        return Inertia::render(
            'Dashboard/Transactions/Print',
            [
                'transaction' => $transaction,
            ]
        );
    }

    /**
     * ============================================================
     * TRANSACTION HISTORY
     * ============================================================
     */
    public function history(
        Request $request
    ) {
        $filters = [
            'invoice' =>
                $request->input(
                    'invoice'
                ),

            'start_date' =>
                $request->input(
                    'start_date'
                ),

            'end_date' =>
                $request->input(
                    'end_date'
                ),
        ];

        $query =
            Transaction::query()
                ->with([
                    'cashier:id,name',
                    'customer:id,name',
                ])
                ->withSum(
                    'details as total_items',
                    'qty'
                )
                ->withSum(
                    'profits as total_profit',
                    'total'
                )
                ->orderByDesc(
                    'created_at'
                );

        /*
        |--------------------------------------------------------------------------
        | Non super admin hanya melihat transaksi sendiri
        |--------------------------------------------------------------------------
        */

        if (
            ! $request
                ->user()
                ->isSuperAdmin()
        ) {
            $query->where(
                'cashier_id',
                $request
                    ->user()
                    ->id
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Invoice filter
        |--------------------------------------------------------------------------
        */

        $query->when(
            $filters['invoice'],
            function (
                Builder $builder,
                $invoice
            ) {
                $builder->where(
                    'invoice',
                    'like',
                    '%' . $invoice . '%'
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Start date
        |--------------------------------------------------------------------------
        */

        $query->when(
            $filters['start_date'],
            function (
                Builder $builder,
                $date
            ) {
                $builder->whereDate(
                    'created_at',
                    '>=',
                    $date
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | End date
        |--------------------------------------------------------------------------
        */

        $query->when(
            $filters['end_date'],
            function (
                Builder $builder,
                $date
            ) {
                $builder->whereDate(
                    'created_at',
                    '<=',
                    $date
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Pagination
        |--------------------------------------------------------------------------
        */

        $transactions =
            $query
                ->paginate(10)
                ->withQueryString();

        return Inertia::render(
            'Dashboard/Transactions/History',
            [
                'transactions' =>
                    $transactions,

                'filters' =>
                    $filters,
            ]
        );
    }
}