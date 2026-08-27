<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::query()
            ->when(
                request()->search,
                function ($categories) {
                    $categories->where(
                        'name',
                        'like',
                        '%' . request()->search . '%'
                    );
                }
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render(
            'Dashboard/Categories/Index',
            [
                'categories' => $categories,
            ]
        );
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render(
            'Dashboard/Categories/Create'
        );
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate(
            [
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'description' => [
                    'nullable',
                    'string',
                ],

                'image' => [
                    'nullable',
                    'image',
                    'mimes:jpeg,jpg,png,webp',
                    'max:2048',
                ],
            ],
            [
                'name.required' =>
                    'Nama kategori wajib diisi.',

                'name.max' =>
                    'Nama kategori maksimal 255 karakter.',

                'description.string' =>
                    'Deskripsi kategori harus berupa teks.',

                'image.image' =>
                    'File harus berupa gambar.',

                'image.mimes' =>
                    'Gambar harus berformat JPG, JPEG, PNG, atau WEBP.',

                'image.max' =>
                    'Ukuran gambar maksimal 2 MB.',
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | IMAGE
        |--------------------------------------------------------------------------
        |
        | Gambar boleh kosong.
        |
        */

        $imageName = null;

        if ($request->hasFile('image')) {

            $image = $request->file('image');

            $imageName = $image->hashName();

            $image->storeAs(
                'public/category',
                $imageName
            );
        }


        /*
        |--------------------------------------------------------------------------
        | CREATE CATEGORY
        |--------------------------------------------------------------------------
        */

        Category::create([
            'name' =>
                $validated['name'],

            'description' =>
                $validated['description'] ?? null,

            'image' =>
                $imageName,
        ]);


        /*
        |--------------------------------------------------------------------------
        | REDIRECT
        |--------------------------------------------------------------------------
        */

        return to_route(
            'categories.index'
        )->with(
            'success',
            'Kategori berhasil ditambahkan.'
        );
    }


    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        return Inertia::render(
            'Dashboard/Categories/Edit',
            [
                'category' => $category,
            ]
        );
    }


    /**
     * Update the specified resource in storage.
     *
     * Perubahan gambar HANYA dilakukan ketika form
     * benar-benar disubmit dengan tombol Simpan.
     */
    public function update(
        Request $request,
        Category $category
    ) {
        /*
        |--------------------------------------------------------------------------
        | VALIDATION
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate(
            [
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'description' => [
                    'nullable',
                    'string',
                ],

                'image' => [
                    'nullable',
                    'image',
                    'mimes:jpeg,jpg,png,webp',
                    'max:2048',
                ],

                /*
                |--------------------------------------------------------------------------
                | REMOVE IMAGE
                |--------------------------------------------------------------------------
                |
                | Flag ini hanya memberitahu backend bahwa
                | gambar lama harus dihapus ketika SAVE.
                |
                */

                'remove_image' => [
                    'nullable',
                    'boolean',
                ],
            ],
            [
                'name.required' =>
                    'Nama kategori wajib diisi.',

                'name.max' =>
                    'Nama kategori maksimal 255 karakter.',

                'description.string' =>
                    'Deskripsi kategori harus berupa teks.',

                'image.image' =>
                    'File harus berupa gambar.',

                'image.mimes' =>
                    'Gambar harus berformat JPG, JPEG, PNG, atau WEBP.',

                'image.max' =>
                    'Ukuran gambar maksimal 2 MB.',
            ]
        );


        /*
        |--------------------------------------------------------------------------
        | DATA DASAR
        |--------------------------------------------------------------------------
        */

        $updateData = [
            'name' =>
                $validated['name'],

            'description' =>
                $validated['description'] ?? null,
        ];


        /*
        |--------------------------------------------------------------------------
        | KONDISI GAMBAR
        |--------------------------------------------------------------------------
        |
        | Ada 3 kondisi:
        |
        | 1. Tidak menyentuh gambar
        |    -> gambar lama tetap.
        |
        | 2. remove_image = true
        |    -> gambar lama dihapus ketika SAVE.
        |
        | 3. Ada upload gambar baru
        |    -> gambar lama diganti ketika SAVE.
        |
        |--------------------------------------------------------------------------
        */

        $hasNewImage =
            $request->hasFile('image');

        $removeOldImage =
            $request->boolean('remove_image');


        /*
        |--------------------------------------------------------------------------
        | SIMPAN NAMA GAMBAR LAMA
        |--------------------------------------------------------------------------
        |
        | Jangan langsung hapus dulu.
        | Kita baru menghapus setelah proses update berhasil.
        |
        */

        $oldImage =
            $category->image;


        /*
        |--------------------------------------------------------------------------
        | UPLOAD GAMBAR BARU
        |--------------------------------------------------------------------------
        |
        | Kalau user memilih gambar baru:
        |
        | - upload gambar baru
        | - set nama gambar baru
        | - gambar lama nanti dihapus setelah database berhasil diupdate
        |
        */

        $newImageName = null;

        if ($hasNewImage) {

            $image =
                $request->file('image');

            $newImageName =
                $image->hashName();

            /*
            |--------------------------------------------------------------------------
            | Upload gambar baru
            |--------------------------------------------------------------------------
            */

            $image->storeAs(
                'public/category',
                $newImageName
            );

            /*
            |--------------------------------------------------------------------------
            | Update database dengan gambar baru
            |--------------------------------------------------------------------------
            */

            $updateData['image'] =
                $newImageName;
        }


        /*
        |--------------------------------------------------------------------------
        | HAPUS GAMBAR
        |--------------------------------------------------------------------------
        |
        | Hanya dilakukan ketika:
        |
        | - remove_image = true
        | AND
        | - tidak ada gambar baru
        |
        | Kalau ada gambar baru, gambar lama juga akan dihapus
        | karena sedang diganti.
        |
        */

        if (
            $removeOldImage
            && !$hasNewImage
        ) {
            $updateData['image'] = null;
        }


        /*
        |--------------------------------------------------------------------------
        | UPDATE DATABASE
        |--------------------------------------------------------------------------
        */

        $category->update(
            $updateData
        );


        /*
        |--------------------------------------------------------------------------
        | HAPUS GAMBAR LAMA SETELAH DATABASE BERHASIL DIUPDATE
        |--------------------------------------------------------------------------
        |
        | Ini penting.
        |
        | Kita tidak menghapus gambar lama sebelum database
        | berhasil diperbarui.
        |
        */

        if (
            $oldImage
            && (
                $hasNewImage
                || (
                    $removeOldImage
                    && !$hasNewImage
                )
            )
        ) {
            $this->deleteImageFile(
                $oldImage
            );
        }


        /*
        |--------------------------------------------------------------------------
        | REDIRECT
        |--------------------------------------------------------------------------
        */

        return to_route(
            'categories.index'
        )->with(
            'success',
            'Kategori berhasil diperbarui.'
        );
    }


    /**
     * Remove the specified resource from storage.
     */
    public function destroy(
        Category $category
    ) {
        /*
        |--------------------------------------------------------------------------
        | DELETE IMAGE
        |--------------------------------------------------------------------------
        */

        $this->deleteImageFile(
            $category->image
        );


        /*
        |--------------------------------------------------------------------------
        | DELETE CATEGORY
        |--------------------------------------------------------------------------
        */

        $category->delete();


        /*
        |--------------------------------------------------------------------------
        | REDIRECT
        |--------------------------------------------------------------------------
        */

        return to_route(
            'categories.index'
        )->with(
            'success',
            'Kategori berhasil dihapus.'
        );
    }


    /**
     * Delete category image file.
     *
     * Tidak ada route/action terpisah untuk menghapus gambar.
     *
     * Penghapusan gambar dilakukan oleh update()
     * setelah tombol "Simpan Perubahan" ditekan.
     */
    private function deleteImageFile(
        ?string $image
    ): void {
        if (!$image) {
            return;
        }


        /*
        |--------------------------------------------------------------------------
        | BERSIHKAN NAMA FILE
        |--------------------------------------------------------------------------
        |
        | Database bisa saja menyimpan:
        |
        | abc.jpg
        | category/abc.jpg
        | public/category/abc.jpg
        |
        | Kita hanya ambil nama file terakhir.
        |
        */

        $fileName = basename(
            str_replace(
                '\\',
                '/',
                $image
            )
        );


        if (!$fileName) {
            return;
        }


        /*
        |--------------------------------------------------------------------------
        | PATH
        |--------------------------------------------------------------------------
        |
        | storage/app/public/category
        |
        */

        $path =
            'public/category/' .
            $fileName;


        /*
        |--------------------------------------------------------------------------
        | DELETE FILE
        |--------------------------------------------------------------------------
        */

        if (
            Storage::disk('local')
                ->exists($path)
        ) {
            Storage::disk('local')
                ->delete($path);
        }
    }
}