<?php

namespace App\Http\Middleware;

use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),

            /*
            |--------------------------------------------------------------------------
            | AUTH
            |--------------------------------------------------------------------------
            */

            'auth' => [
                'user' => $request->user(),

                'permissions' => $request->user()
                    ? $request
                        ->user()
                        ->getPermissions()
                    : [],

                'super' => $request->user()
                    ? $request
                        ->user()
                        ->isSuperAdmin()
                    : false,
            ],

            /*
            |--------------------------------------------------------------------------
            | STORE SETTINGS
            |--------------------------------------------------------------------------
            |
            | Data toko dibagikan ke seluruh halaman Inertia.
            |
            | Digunakan oleh:
            |
            | - Dashboard
            | - Invoice
            | - Struk 80mm
            | - Struk 58mm
            | - Halaman transaksi
            | - Komponen lainnya
            |
            */

            'store' => function () {

                $setting =
                    StoreSetting::current();

                return [
                    /*
                    |--------------------------------------------------------------------------
                    | ID
                    |--------------------------------------------------------------------------
                    */

                    'id' =>
                        $setting->id,

                    /*
                    |--------------------------------------------------------------------------
                    | NAMA TOKO
                    |--------------------------------------------------------------------------
                    */

                    'name' =>
                        $setting->name,

                    /*
                    |--------------------------------------------------------------------------
                    | ALAMAT
                    |--------------------------------------------------------------------------
                    */

                    'address' =>
                        $setting->address,

                    /*
                    |--------------------------------------------------------------------------
                    | NOMOR TELEPON
                    |--------------------------------------------------------------------------
                    */

                    'phone' =>
                        $setting->phone,

                    /*
                    |--------------------------------------------------------------------------
                    | FOOTER STRUK
                    |--------------------------------------------------------------------------
                    */

                    'footer' =>
                        $setting->footer,

                    /*
                    |--------------------------------------------------------------------------
                    | LOGO
                    |--------------------------------------------------------------------------
                    */

                    'logo' =>
                        $setting->logo,

                    'logo_url' => $setting->logo
                                ? asset('storage/' . $setting->logo)
                                : null,
                ];
            },
        ];
    }
}