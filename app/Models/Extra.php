<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Extra extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'price',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    /**
     * Produk yang bisa menggunakan extra.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_extras'
        )->withTimestamps();
    }

    /**
     * Detail transaksi yang menggunakan extra.
     */
    public function transactionDetailExtras()
    {
        return $this->hasMany(
            TransactionDetailExtra::class
        );
    }
}