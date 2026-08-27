<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransactionDetailExtra extends Model
{
    use HasFactory;

    protected $fillable = [
        'transaction_detail_id',
        'extra_id',
        'qty',
        'price',
    ];

    protected $casts = [
        'qty' => 'integer',
        'price' => 'decimal:2',
    ];

    /**
     * Transaction detail.
     */
    public function transactionDetail()
    {
        return $this->belongsTo(
            TransactionDetail::class
        );
    }

    /**
     * Extra.
     */
    public function extra()
    {
        return $this->belongsTo(
            Extra::class
        );
    }

    /**
     * Total harga extra.
     */
    public function getTotalAttribute()
    {
        return (
            (float) $this->price
        ) * (
            (int) $this->qty
        );
    }
}