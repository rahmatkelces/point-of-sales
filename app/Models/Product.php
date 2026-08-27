<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'image',
        'barcode',
        'title',
        'description',
        'buy_price',
        'sell_price',
        'category_id',
        'stock',
    ];

    /**
     * Category.
     */
    public function category()
    {
        return $this->belongsTo(
            Category::class
        );
    }

    /**
     * Image.
     */
    protected function image(): Attribute
    {
        return Attribute::make(
            get: fn ($value) =>
                $value
                    ? asset(
                        '/storage/products/' .
                        $value
                    )
                    : null,
        );
    }

    /**
     * Extra yang tersedia
     * untuk produk ini.
     */
    public function extras(): BelongsToMany
    {
        return $this->belongsToMany(
            Extra::class,
            'product_extras'
        )
        ->where(
            'extras.is_active',
            true
        )
        ->withTimestamps();
    }
}