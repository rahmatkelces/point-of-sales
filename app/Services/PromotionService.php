<?php

namespace App\Services;

use App\Models\Promotion;

class PromotionService
{
    public function apply(array $cartItems, ?string $voucherCode = null): array
    {
        $items = collect($cartItems)->map(function ($item) {
            $price = (float) ($item['price'] ?? $item['sell_price'] ?? 0);
            $qty = (int) ($item['qty'] ?? 1);

            return [
                'cart_id' => $item['cart_id'] ?? null,
                'product_id' => (int) $item['product_id'],
                'product_title' => $item['product_title'] ?? null,
                'price' => $price,
                'qty' => $qty,
                'subtotal' => $price * $qty,
                'discount' => 0,
                'free_qty' => 0,
                'final_subtotal' => $price * $qty,
                'promotion_notes' => [],
            ];
        })->values()->toArray();

        $items = $this->applyPriceDiscount($items);
        $items = $this->applyBuyXGetYSame($items);
        $items = $this->applyBuyXGetYDiff($items);

        foreach ($items as &$item) {
            $item['final_subtotal'] = max(0, $item['subtotal'] - $item['discount']);
        }

        $subtotal = collect($items)->sum('subtotal');
        $itemDiscount = collect($items)->sum('discount');
        $netAfterItemPromo = max(0, $subtotal - $itemDiscount);

        $voucherResult = $this->applyVoucherNominal($voucherCode, $netAfterItemPromo);

        $voucherDiscount = $voucherResult['discount'];
        $voucherPromotion = $voucherResult['promotion'];

        $grandTotal = max(0, $netAfterItemPromo - $voucherDiscount);

        return [
            'items' => $items,
            'subtotal' => $subtotal,
            'item_discount' => $itemDiscount,
            'net_after_item_discount' => $netAfterItemPromo,
            'voucher_code' => $voucherCode,
            'voucher_discount' => $voucherDiscount,
            'voucher_promotion' => $voucherPromotion,
            'total_discount' => $itemDiscount + $voucherDiscount,
            'grand_total' => $grandTotal,
        ];
    }

    protected function applyPriceDiscount(array $items): array
    {
        $promotions = Promotion::query()
            ->active()
            ->where('type', 'price_discount')
            ->with('promotionProducts')
            ->get();

        foreach ($items as &$item) {
            foreach ($promotions as $promotion) {
                $hasProduct = $promotion->promotionProducts
                    ->where('role', 'target')
                    ->pluck('product_id')
                    ->contains($item['product_id']);

                if (! $hasProduct) {
                    continue;
                }

                $discountNominal = (float) $promotion->discount_nominal;
                $itemDiscount = min($item['subtotal'], $discountNominal * $item['qty']);

                $item['discount'] += $itemDiscount;
                $item['promotion_notes'][] = [
                    'type' => 'price_discount',
                    'promotion_id' => $promotion->id,
                    'promotion_name' => $promotion->name,
                    'amount' => $itemDiscount,
                ];
            }
        }

        return $items;
    }

    protected function applyBuyXGetYSame(array $items): array
    {
        $promotions = Promotion::query()
            ->active()
            ->where('type', 'buy_x_get_y_same')
            ->with('promotionProducts')
            ->get();

        foreach ($items as &$item) {
            foreach ($promotions as $promotion) {
                $hasProduct = $promotion->promotionProducts
                    ->where('role', 'target')
                    ->pluck('product_id')
                    ->contains($item['product_id']);

                if (! $hasProduct) {
                    continue;
                }

                $buyQty = (int) $promotion->buy_qty;
                $getQty = (int) $promotion->get_qty;
                $groupQty = $buyQty + $getQty;

                if ($groupQty <= 0 || $item['qty'] < $groupQty) {
                    continue;
                }

                $freeQty = floor($item['qty'] / $groupQty) * $getQty;
                $discount = $freeQty * $item['price'];

                $item['free_qty'] += $freeQty;
                $item['discount'] += $discount;
                $item['promotion_notes'][] = [
                    'type' => 'buy_x_get_y_same',
                    'promotion_id' => $promotion->id,
                    'promotion_name' => $promotion->name,
                    'free_qty' => $freeQty,
                    'amount' => $discount,
                ];
            }
        }

        return $items;
    }

    protected function applyBuyXGetYDiff(array $items): array
    {
        $promotions = Promotion::query()
            ->active()
            ->where('type', 'buy_x_get_y_diff')
            ->with('promotionProducts')
            ->get();

        foreach ($promotions as $promotion) {
            $buyProductIds = $promotion->promotionProducts
                ->where('role', 'buy')
                ->pluck('product_id')
                ->values()
                ->toArray();

            $getProductIds = $promotion->promotionProducts
                ->where('role', 'get')
                ->pluck('product_id')
                ->values()
                ->toArray();

            $buyQtyRequired = (int) $promotion->buy_qty;
            $getQtyReward = (int) $promotion->get_qty;

            if ($buyQtyRequired <= 0 || $getQtyReward <= 0) {
                continue;
            }

            $totalBuyQty = collect($items)
                ->filter(fn ($item) => in_array($item['product_id'], $buyProductIds))
                ->sum('qty');

            if ($totalBuyQty < $buyQtyRequired) {
                continue;
            }

            $rewardMultiplier = floor($totalBuyQty / $buyQtyRequired);
            $totalFreeQty = $rewardMultiplier * $getQtyReward;

            foreach ($items as &$item) {
                if (! in_array($item['product_id'], $getProductIds)) {
                    continue;
                }

                $eligibleFreeQty = min($item['qty'], $totalFreeQty);

                if ($eligibleFreeQty <= 0) {
                    continue;
                }

                $discount = $eligibleFreeQty * $item['price'];

                $item['free_qty'] += $eligibleFreeQty;
                $item['discount'] += $discount;
                $item['promotion_notes'][] = [
                    'type' => 'buy_x_get_y_diff',
                    'promotion_id' => $promotion->id,
                    'promotion_name' => $promotion->name,
                    'free_qty' => $eligibleFreeQty,
                    'amount' => $discount,
                ];

                $totalFreeQty -= $eligibleFreeQty;

                if ($totalFreeQty <= 0) {
                    break;
                }
            }
        }

        return $items;
    }

    protected function applyVoucherNominal(?string $voucherCode, float $netAmount): array
    {
        if (! $voucherCode) {
            return [
                'discount' => 0,
                'promotion' => null,
            ];
        }

        $promotion = Promotion::query()
            ->active()
            ->where('type', 'voucher_nominal')
            ->where('code', $voucherCode)
            ->first();

        if (! $promotion) {
            return [
                'discount' => 0,
                'promotion' => null,
            ];
        }

        $minPurchase = (float) ($promotion->min_purchase ?? 0);

        if ($netAmount < $minPurchase) {
            return [
                'discount' => 0,
                'promotion' => null,
            ];
        }

        return [
            'discount' => min($netAmount, (float) $promotion->discount_nominal),
            'promotion' => [
                'id' => $promotion->id,
                'name' => $promotion->name,
                'code' => $promotion->code,
                'discount_nominal' => (float) $promotion->discount_nominal,
                'min_purchase' => (float) ($promotion->min_purchase ?? 0),
            ],
        ];
    }
}