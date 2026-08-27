<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TransactionDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_id',
        'product_id',
        'qty',
        'price',
    ];

    protected $casts = [
        'qty' => 'integer',
        'price' => 'decimal:2',
    ];

    /**
     * Transaction.
     */
    public function transaction()
    {
        return $this->belongsTo(
            Transaction::class
        );
    }

    /**
     * Product.
     */
    public function product()
    {
        return $this->belongsTo(
            Product::class
        );
    }

    /**
     * Extras pada detail transaksi.
     */
    public function extras(): HasMany
    {
        return $this->hasMany(
            TransactionDetailExtra::class
        );
    }

    /**
     * Total harga extra.
     */
    public function getExtrasTotalAttribute()
    {
        return $this->extras->sum(
            function ($extra) {
                return (
                    (float) $extra->price
                ) * (
                    (int) $extra->qty
                );
            }
        );
    }

    /**
     * Total satu unit produk
     * termasuk extra.
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
     * Total detail.
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