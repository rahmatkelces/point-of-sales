import React, { useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, useForm, usePage, Link } from "@inertiajs/react";
import Input from "@/Components/Dashboard/Input";
import Textarea from "@/Components/Dashboard/TextArea";
import toast from "react-hot-toast";

import {
    IconCategory,
    IconDeviceFloppy,
    IconArrowLeft,
    IconPhoto,
    IconTrash,
    IconUpload,
} from "@tabler/icons-react";

export default function Edit({ category }) {
    const { errors = {} } = usePage().props;

    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    const {
        data,
        setData,
        post,
        processing,
    } = useForm({
        id: category.id,

        name: category.name || "",

        description: category.description || "",

        image: null,

        /*
        | true = gambar lama akan dihapus saat SAVE
        | false = gambar lama tetap dipertahankan
        */
        remove_image: false,

        _method: "PUT",
    });


    /*
    |--------------------------------------------------------------------------
    | GET IMAGE URL
    |--------------------------------------------------------------------------
    */

    const getImageUrl = (image) => {
        if (!image) {
            return null;
        }

        const fileName = String(image)
            .replace(/\\/g, "/")
            .split("/")
            .pop();

        if (!fileName) {
            return null;
        }

        return `/storage/category/${fileName}`;
    };


    /*
    |--------------------------------------------------------------------------
    | IMAGE PREVIEW
    |--------------------------------------------------------------------------
    */

    const [imagePreview, setImagePreview] = useState(
        getImageUrl(category.image)
    );


    /*
    |--------------------------------------------------------------------------
    | IMAGE ERROR
    |--------------------------------------------------------------------------
    */

    const [imageError, setImageError] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | CHOOSE IMAGE
    |--------------------------------------------------------------------------
    */

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        /*
        | Validasi frontend
        */

        if (!file.type.startsWith("image/")) {
            toast.error("File harus berupa gambar.");
            e.target.value = "";
            return;
        }

        /*
        | Maksimal 2 MB
        */

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Ukuran gambar maksimal 2 MB.");
            e.target.value = "";
            return;
        }

        /*
        | Simpan file baru ke form.
        */

        setData("image", file);

        /*
        | Karena user memilih gambar baru,
        | gambar lama otomatis dianggap akan diganti
        | ketika SAVE.
        */

        setData("remove_image", false);

        /*
        | Reset error gambar.
        */

        setImageError(false);

        /*
        | Preview gambar baru.
        */

        setImagePreview(
            URL.createObjectURL(file)
        );
    };


    /*
    |--------------------------------------------------------------------------
    | DELETE IMAGE - HANYA PREVIEW
    |--------------------------------------------------------------------------
    |
    | PENTING:
    |
    | Jangan melakukan router.delete().
    |
    | Tombol ini hanya mengubah tampilan dan form state.
    |
    | Database baru berubah ketika tombol SAVE ditekan.
    |
    |--------------------------------------------------------------------------
    */

    const deleteImage = () => {
        /*
        | Hilangkan preview.
        */

        setImagePreview(null);

        /*
        | Kosongkan file baru jika ada.
        */

        setData("image", null);

        /*
        | Tandai bahwa gambar lama harus dihapus
        | ketika form benar-benar disimpan.
        */

        setData("remove_image", true);

        /*
        | Reset error.
        */

        setImageError(false);

        toast.success(
            "Gambar dihapus dari tampilan. Klik Simpan Perubahan untuk menyimpan."
        );
    };


    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const submit = (e) => {
        e.preventDefault();

        post(
            route(
                "categories.update",
                category.id
            ),
            {
                forceFormData: true,

                preserveScroll: true,

                onSuccess: () => {
                    toast.success(
                        "Kategori berhasil diperbarui"
                    );
                },

                onError: () => {
                    toast.error(
                        "Gagal memperbarui kategori"
                    );
                },
            }
        );
    };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Edit Kategori" />


            {/* ==============================================================
                HEADER
            ============================================================== */}

            <div className="mb-6">

                <Link
                    href={route(
                        "categories.index"
                    )}
                    className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600"
                >
                    <IconArrowLeft
                        size={16}
                    />

                    Kembali ke Kategori
                </Link>


                <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">

                    <IconCategory
                        size={28}
                        className="text-primary-500"
                    />

                    Edit Kategori

                </h1>


                <p className="mt-1 text-sm text-slate-500">
                    {category.name}
                </p>

            </div>


            {/* ==============================================================
                FORM
            ============================================================== */}

            <form onSubmit={submit}>

                <div className="max-w-2xl">

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">


                            {/* ==================================================
                                IMAGE
                            ================================================== */}

                            <div>

                                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">

                                    <IconPhoto
                                        size={16}
                                    />

                                    Gambar

                                    <span className="font-normal text-slate-400">
                                        (Opsional)
                                    </span>

                                </h3>


                                {/* ==================================================
                                    PREVIEW
                                ================================================== */}

                                <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">

                                    {imagePreview &&
                                    !imageError ? (

                                        <img
                                            src={
                                                imagePreview
                                            }
                                            alt={
                                                category.name
                                            }
                                            className="h-full w-full object-cover"
                                            onError={() =>
                                                setImageError(
                                                    true
                                                )
                                            }
                                        />

                                    ) : (

                                        <div className="flex flex-col items-center justify-center text-slate-400">

                                            <IconPhoto
                                                size={40}
                                            />

                                            <span className="mt-2 text-xs">
                                                Tidak ada gambar
                                            </span>

                                        </div>

                                    )}

                                </div>


                                {/* ==================================================
                                    STATUS PENGHAPUSAN
                                ================================================== */}

                                {data.remove_image &&
                                    !data.image && (

                                        <div className="mb-3 rounded-xl border border-warning-200 bg-warning-50 px-3 py-2 text-xs text-warning-700 dark:border-warning-900 dark:bg-warning-950/30 dark:text-warning-400">

                                            Gambar akan dihapus
                                            setelah Anda menekan
                                            <strong>
                                                {" "}
                                                Simpan Perubahan
                                            </strong>
                                            .

                                        </div>

                                    )}


                                {/* ==================================================
                                    FILE INPUT
                                ================================================== */}

                                <Input
                                    type="file"
                                    onChange={
                                        handleImageChange
                                    }
                                    errors={
                                        errors.image
                                    }
                                    accept="image/jpeg,image/jpg,image/png,image/webp"
                                />


                                {/* ==================================================
                                    BUTTONS
                                ================================================== */}

                                <div className="mt-3 flex gap-2">

                                    {/* HAPUS GAMBAR */}

                                    {imagePreview && (

                                        <button
                                            type="button"
                                            onClick={
                                                deleteImage
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                                        >

                                            <IconTrash
                                                size={17}
                                            />

                                            Hapus Gambar

                                        </button>

                                    )}

                                </div>


                                <p className="mt-2 text-xs text-slate-400">
                                    Gambar bersifat opsional.
                                    Maksimal 2 MB.
                                </p>

                            </div>


                            {/* ==================================================
                                INFORMATION
                            ================================================== */}

                            <div className="space-y-4">

                                <Input
                                    type="text"
                                    label="Nama Kategori"
                                    placeholder="Masukkan nama kategori"
                                    errors={
                                        errors.name
                                    }
                                    value={
                                        data.name
                                    }
                                    onChange={(e) =>
                                        setData(
                                            "name",
                                            e.target.value
                                        )
                                    }
                                />


                                <Textarea
                                    label={
                                        <>
                                            Deskripsi{" "}
                                            <span className="font-normal text-slate-400">
                                                (Opsional)
                                            </span>
                                        </>
                                    }
                                    placeholder="Deskripsi kategori"
                                    errors={
                                        errors.description
                                    }
                                    value={
                                        data.description
                                    }
                                    onChange={(e) =>
                                        setData(
                                            "description",
                                            e.target.value
                                        )
                                    }
                                    rows={4}
                                />

                            </div>

                        </div>


                        {/* ==================================================
                            FOOTER
                        ================================================== */}

                        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">

                            <Link
                                href={route(
                                    "categories.index"
                                )}
                                className="rounded-xl border border-slate-200 px-5 py-2.5 font-medium text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                                Batal
                            </Link>


                            <button
                                type="submit"
                                disabled={
                                    processing
                                }
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 font-medium text-white transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <IconDeviceFloppy
                                    size={18}
                                />

                                {processing
                                    ? "Menyimpan..."
                                    : "Simpan Perubahan"}

                            </button>

                        </div>

                    </div>

                </div>

            </form>
        </>
    );
}


Edit.layout = (page) => (
    <DashboardLayout>
        {page}
    </DashboardLayout>
);