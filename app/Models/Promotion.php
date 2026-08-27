<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Promotion extends Model
{
    protected $fillable = [
        'name',
        'code',
        'type',
        'is_active',
        'start_at',
        'end_at',
        'discount_nominal',
        'min_purchase',
        'buy_qty',
        'get_qty',
        'description',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'discount_nominal' => 'decimal:2',
        'min_purchase' => 'decimal:2',
    ];

    public function promotionProducts()
    {
        return $this->hasMany(PromotionProduct::class);
    }

    public function targetProducts()
    {
        return $this->belongsToMany(Product::class, 'promotion_products')
            ->withPivot('role')
            ->wherePivot('role', 'target');
    }

    public function buyProducts()
    {
        return $this->belongsToMany(Product::class, 'promotion_products')
            ->withPivot('role')
            ->wherePivot('role', 'buy');
    }

    public function getProducts()
    {
        return $this->belongsToMany(Product::class, 'promotion_products')
            ->withPivot('role')
            ->wherePivot('role', 'get');
    }

    public function scopeActive(Builder $query): Builder
    {
        $now = now();

        return $query
            ->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('start_at')
                    ->orWhere('start_at', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('end_at')
                    ->orWhere('end_at', '>=', $now);
            });
    }
}