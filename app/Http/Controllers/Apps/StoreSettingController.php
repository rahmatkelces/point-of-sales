<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class StoreSettingController extends Controller
{
    /**
     * Halaman konfigurasi toko.
     */
    public function edit()
    {
        $setting = StoreSetting::current();

        return Inertia::render(
            'Dashboard/Settings/Store',
            [
                'setting' => [
                    'id' => $setting->id,

                    'name' => $setting->name,

                    'logo' => $setting->logo,

                    'logo_url' => $setting->logo_url,

                    'address' => $setting->address,

                    'phone' => $setting->phone,

                    'footer' => $setting->footer,
                ],
            ]
        );
    }

    /**
     * Update konfigurasi toko.
     */
    public function update(Request $request)
    {
        $validated = $request->validate(
            [
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'logo' => [
                    'nullable',
                    'image',
                    'mimes:jpg,jpeg,png,webp,svg',
                    'max:2048',
                ],

                'address' => [
                    'nullable',
                    'string',
                    'max:2000',
                ],

                'phone' => [
                    'nullable',
                    'string',
                    'max:50',
                ],

                'footer' => [
                    'nullable',
                    'string',
                    'max:2000',
                ],
            ],
            [
                'name.required' =>
                    'Nama toko wajib diisi.',

                'name.max' =>
                    'Nama toko maksimal 255 karakter.',

                'logo.image' =>
                    'File logo harus berupa gambar.',

                'logo.mimes' =>
                    'Logo harus berformat JPG, JPEG, PNG, WEBP, atau SVG.',

                'logo.max' =>
                    'Ukuran logo maksimal 2 MB.',

                'address.max' =>
                    'Alamat maksimal 2000 karakter.',

                'phone.max' =>
                    'Nomor telepon maksimal 50 karakter.',

                'footer.max' =>
                    'Footer maksimal 2000 karakter.',
            ]
        );

        $setting = StoreSetting::current();

        /*
        |--------------------------------------------------------------------------
        | UPLOAD LOGO BARU
        |--------------------------------------------------------------------------
        */

        if ($request->hasFile('logo')) {

            /*
            | Hapus logo lama
            */

            if (
                $setting->logo &&
                Storage::disk('public')->exists(
                    $setting->logo
                )
            ) {
                Storage::disk('public')->delete(
                    $setting->logo
                );
            }

            /*
            | Simpan logo baru
            */

            $validated['logo'] = $request
                ->file('logo')
                ->store(
                    'store',
                    'public'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | UPDATE STORE SETTING
        |--------------------------------------------------------------------------
        */

        $setting->update(
            $validated
        );

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        return back()->with(
            'success',
            'Konfigurasi toko berhasil diperbarui.'
        );
    }

    /**
     * Hapus logo toko.
     */
    public function destroyLogo()
    {
        $setting = StoreSetting::current();

        /*
        |--------------------------------------------------------------------------
        | HAPUS FILE LOGO
        |--------------------------------------------------------------------------
        */

        if (
            $setting->logo &&
            Storage::disk('public')->exists(
                $setting->logo
            )
        ) {
            Storage::disk('public')->delete(
                $setting->logo
            );
        }

        /*
        |--------------------------------------------------------------------------
        | RESET LOGO
        |--------------------------------------------------------------------------
        */

        $setting->update([
            'logo' => null,
        ]);

        return back()->with(
            'success',
            'Logo toko berhasil dihapus.'
        );
    }
}