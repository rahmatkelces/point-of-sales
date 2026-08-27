<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    use HasFactory;

    /**
     * Fillable
     *
     * @var array
     */
    protected $fillable = [
        'cashier_id',
        'product_id',
        'qty',
        'price',
        'extras',
        'hold_id',
        'hold_label',
        'held_at',
    ];

    /**
     * Casts
     *
     * @var array
     */
    protected $casts = [
        'extras' => 'array',
        'held_at' => 'datetime',
    ];

    /**
     * Product
     */
    public function product()
    {
        return $this->belongsTo(
            Product::class
        );
    }

    /**
     * Active cart.
     *
     * Cart yang belum di-hold.
     */
    public function scopeActive($query)
    {
        return $query->whereNull(
            'hold_id'
        );
    }

    /**
     * Held cart.
     */
    public function scopeHeld($query)
    {
        return $query->whereNotNull(
            'hold_id'
        );
    }

    /**
     * Cart berdasarkan hold group.
     */
    public function scopeForHold(
        $query,
        $holdId
    ) {
        return $query->where(
            'hold_id',
            $holdId
        );
    }

    /**
     * Total harga extra satu item.
     */
    public function getExtrasTotalAttribute()
    {
        return collect(
            $this->extras ?? []
        )->sum(function ($extra) {
            return (
                (float) ($extra['price'] ?? 0)
            ) * (
                (int) ($extra['qty'] ?? 1)
            );
        });
    }

    /**
     * Harga item termasuk extra.
     */
    public function getUnitTotalAttribute()
    {
        return (
            (float) $this->price
        ) + (
            (float) $this->extras_total
        );
    }

    /**
     * Total item termasuk quantity.
     */
    public function getTotalAttribute()
    {
        return (
            $this->unit_total
        ) * (
            (int) $this->qty
        );
    }
}