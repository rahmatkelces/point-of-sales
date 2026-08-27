<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StoreSetting extends Model
{
    protected $fillable = [
        'name',
        'logo',
        'address',
        'phone',
        'footer',
    ];

    protected $appends = [
        'logo_url',
    ];

    public static function current(): self
    {
        return static::firstOrCreate(
            [],
            [
                'name' => 'Gemilang Mart',
                'logo' => null,
                'address' => null,
                'phone' => null,
                'footer' => 'Terima kasih telah berbelanja',
            ]
        );
    }

    public function getLogoUrlAttribute(): ?string
    {
        if (!$this->logo) {
            return null;
        }

        /*
        |--------------------------------------------------------------------------
        | Jika database sudah menyimpan URL penuh
        |--------------------------------------------------------------------------
        */

        if (
            str_starts_with($this->logo, 'http://') ||
            str_starts_with($this->logo, 'https://')
        ) {
            return $this->logo;
        }

        /*
        |--------------------------------------------------------------------------
        | Database:
        |
        | store/xxxxx.png
        |
        | Menjadi:
        |
        | http://localhost:8000/storage/store/xxxxx.png
        |--------------------------------------------------------------------------
        */

        return asset(
            'storage/' . ltrim($this->logo, '/')
        );
    }
}