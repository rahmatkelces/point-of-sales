import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Head,
    router,
    useForm,
} from "@inertiajs/react";

import DashboardLayout from "@/Layouts/DashboardLayout";

import {
    IconBuildingStore,
    IconCheck,
    IconDeviceFloppy,
    IconMapPin,
    IconPhone,
    IconPhoto,
    IconReceipt,
    IconTrash,
    IconUpload,
} from "@tabler/icons-react";

/*
|--------------------------------------------------------------------------
| HELPER
|--------------------------------------------------------------------------
|
| Normalisasi URL logo.
|
| Database bisa menyimpan:
|
| store/xxxxx.png
|
| atau:
|
| /storage/store/xxxxx.png
|
| atau backend sudah memberikan:
|
| http://localhost:8000/storage/store/xxxxx.png
|
| Semua format tersebut ditangani di sini.
|
*/

const normalizeLogoUrl = (value) => {
    if (!value) {
        return null;
    }

    const url = String(value).trim();

    if (!url) {
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Data URL
    |--------------------------------------------------------------------------
    */

    if (
        url.startsWith("data:image/") ||
        url.startsWith("blob:")
    ) {
        return url;
    }

    /*
    |--------------------------------------------------------------------------
    | Absolute URL
    |--------------------------------------------------------------------------
    */

    if (
        url.startsWith("http://") ||
        url.startsWith("https://")
    ) {
        return url;
    }

    /*
    |--------------------------------------------------------------------------
    | Already storage URL
    |--------------------------------------------------------------------------
    */

    if (
        url.startsWith("/storage/")
    ) {
        return url;
    }

    /*
    |--------------------------------------------------------------------------
    | Storage URL tanpa slash
    |--------------------------------------------------------------------------
    */

    if (
        url.startsWith("storage/")
    ) {
        return `/${url}`;
    }

    /*
    |--------------------------------------------------------------------------
    | Path dari Laravel Storage
    |--------------------------------------------------------------------------
    |
    | Contoh:
    |
    | store/abc.png
    |
    | menjadi:
    |
    | /storage/store/abc.png
    |
    */

    return `/storage/${url.replace(/^\/+/, "")}`;
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function Store({ setting }) {
    const fileInputRef = useRef(null);

    /*
    |--------------------------------------------------------------------------
    | DEFAULT STORE DATA
    |--------------------------------------------------------------------------
    */

    const defaultName =
        "Gemilang Mart";

    const defaultAddress =
        "Ruko Sentra Danau Kemuning\n" +
        "Jl. Raya Tonjong - Sudimampir No. 7,\n" +
        "Cimanggis, Kec Bojonggede,\n" +
        "Kab Bogor, Jawa Barat 16920";

    const defaultPhone =
        "0877-7568-1693";

    const defaultFooter =
        "Terima kasih telah berbelanja\n" +
        "Barang yang sudah dibeli tidak dapat ditukar/dikembalikan";


    /*
    |--------------------------------------------------------------------------
    | CURRENT LOGO URL
    |--------------------------------------------------------------------------
    |
    | Prioritaskan logo_url dari backend.
    | Kalau tidak ada, gunakan setting.logo.
    |
    */

    const getCurrentLogo = () => {
        if (setting?.logo_url) {
            return normalizeLogoUrl(
                setting.logo_url
            );
        }

        if (setting?.logo) {
            return normalizeLogoUrl(
                setting.logo
            );
        }

        return null;
    };


    /*
    |--------------------------------------------------------------------------
    | LOGO PREVIEW
    |--------------------------------------------------------------------------
    */

    const [
        preview,
        setPreview,
    ] = useState(
        getCurrentLogo()
    );


    /*
    |--------------------------------------------------------------------------
    | SYNC LOGO DARI BACKEND
    |--------------------------------------------------------------------------
    |
    | Penting:
    |
    | State React tidak otomatis berubah ketika
    | props Inertia berubah.
    |
    | Karena itu logo harus disinkronkan kembali
    | setelah Inertia melakukan reload.
    |
    */

    useEffect(() => {
        const logo = getCurrentLogo();

        setPreview(logo);
    }, [
        setting?.logo,
        setting?.logo_url,
    ]);


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
        errors,
        recentlySuccessful,
    } = useForm({
        name:
            setting?.name ||
            defaultName,

        logo:
            null,

        address:
            setting?.address ||
            defaultAddress,

        phone:
            setting?.phone ||
            defaultPhone,

        footer:
            setting?.footer ||
            defaultFooter,

        _method:
            "PUT",
    });


    /*
    |--------------------------------------------------------------------------
    | LOGO CHANGE
    |--------------------------------------------------------------------------
    */

    const handleLogoChange = (
        event
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Validasi client sederhana
        |--------------------------------------------------------------------------
        */

        const maxSize =
            2 * 1024 * 1024;

        if (
            file.size >
            maxSize
        ) {
            alert(
                "Ukuran logo maksimal 2 MB."
            );

            event.target.value = "";

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Simpan file ke form
        |--------------------------------------------------------------------------
        */

        setData(
            "logo",
            file
        );


        /*
        |--------------------------------------------------------------------------
        | Preview file yang baru dipilih
        |--------------------------------------------------------------------------
        */

        const reader =
            new FileReader();

        reader.onload = (
            e
        ) => {
            const result =
                e.target?.result;

            if (result) {
                setPreview(
                    result
                );
            }
        };

        reader.readAsDataURL(
            file
        );
    };


    /*
    |--------------------------------------------------------------------------
    | REMOVE LOGO
    |--------------------------------------------------------------------------
    */

    const removeLogo = () => {

        /*
        |--------------------------------------------------------------------------
        | Kalau belum ada logo di database
        |--------------------------------------------------------------------------
        */

        if (
            !setting?.logo
        ) {
            setPreview(
                null
            );

            setData(
                "logo",
                null
            );

            if (
                fileInputRef.current
            ) {
                fileInputRef.current.value =
                    "";
            }

            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Confirm
        |--------------------------------------------------------------------------
        */

        const confirmed =
            window.confirm(
                "Hapus logo toko?"
            );

        if (!confirmed) {
            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Delete logo dari server
        |--------------------------------------------------------------------------
        */

        router.delete(
            route(
                "settings.store.logo.destroy"
            ),
            {
                preserveScroll:
                    true,

                onSuccess: () => {

                    /*
                    |--------------------------------------------------------------------------
                    | Hapus preview
                    |--------------------------------------------------------------------------
                    */

                    setPreview(
                        null
                    );

                    setData(
                        "logo",
                        null
                    );

                    if (
                        fileInputRef.current
                    ) {
                        fileInputRef.current.value =
                            "";
                    }
                },
            }
        );
    };


    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const submit = (
        e
    ) => {
        e.preventDefault();

        post(
            route(
                "settings.store.update"
            ),
            {
                forceFormData:
                    true,

                preserveScroll:
                    true,

                onSuccess: (
                    page
                ) => {

                    /*
                    |--------------------------------------------------------------------------
                    | Ambil setting terbaru dari response Inertia
                    |--------------------------------------------------------------------------
                    */

                    const latestSetting =
                        page?.props?.setting;

                    if (
                        latestSetting
                    ) {
                        const latestLogo =
                            latestSetting.logo_url ||
                            latestSetting.logo;

                        setPreview(
                            normalizeLogoUrl(
                                latestLogo
                            )
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | Reset file input
                    |--------------------------------------------------------------------------
                    */

                    if (
                        fileInputRef.current
                    ) {
                        fileInputRef.current.value =
                            "";
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | File upload tidak perlu
                    | dikirim lagi
                    |--------------------------------------------------------------------------
                    */

                    setData(
                        "logo",
                        null
                    );
                },
            }
        );
    };


    /*
    |--------------------------------------------------------------------------
    | IMAGE ERROR
    |--------------------------------------------------------------------------
    */

    const handleImageError = (
        e
    ) => {
        console.error(
            "Logo toko gagal dimuat:",
            e.currentTarget.src
        );

        /*
        |--------------------------------------------------------------------------
        | Jangan fallback ke logo lama.
        |--------------------------------------------------------------------------
        |
        | Sebelumnya kode menggunakan:
        |
        | e.currentTarget.src = defaultLogo;
        |
        | Ini membuat logo lama muncul ketika URL
        | logo baru salah.
        |
        */

        e.currentTarget.style.display =
            "none";
    };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head
                title="Konfigurasi Toko"
            />

            <div className="space-y-6">

                {/* =========================================================
                    HEADER
                ========================================================= */}

                <div>
                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400">

                            <IconBuildingStore
                                size={23}
                                strokeWidth={
                                    1.8
                                }
                            />

                        </div>

                        <div>

                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                Konfigurasi Toko
                            </h1>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Atur informasi toko
                                yang tampil di
                                aplikasi, invoice,
                                dan struk transaksi.
                            </p>

                        </div>

                    </div>
                </div>


                {/* =========================================================
                    SUCCESS
                ========================================================= */}

                {recentlySuccessful && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-400">

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">

                            <IconCheck
                                size={18}
                            />

                        </div>

                        Konfigurasi toko
                        berhasil disimpan.

                    </div>
                )}


                {/* =========================================================
                    FORM
                ========================================================= */}

                <form
                    onSubmit={
                        submit
                    }
                    className="grid gap-6 xl:grid-cols-[1fr_360px]"
                >

                    {/* =====================================================
                        LEFT
                    ===================================================== */}

                    <div className="space-y-6">

                        {/* =================================================
                            INFORMASI TOKO
                        ================================================= */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                            <div className="mb-6">

                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Informasi Toko
                                </h2>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Informasi ini akan
                                    digunakan pada
                                    invoice dan struk.
                                </p>

                            </div>


                            <div className="space-y-5">

                                {/* =========================================
                                    NAMA TOKO
                                ========================================= */}

                                <div>

                                    <label
                                        htmlFor="name"
                                        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                                    >
                                        Nama Toko
                                    </label>

                                    <div className="relative">

                                        <IconBuildingStore
                                            size={20}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            id="name"
                                            type="text"
                                            value={
                                                data.name
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setData(
                                                    "name",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Contoh: Gemilang Mart"
                                            className={`h-12 w-full rounded-xl border bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition dark:bg-slate-950 dark:text-white ${
                                                errors.name
                                                    ? "border-red-400"
                                                    : "border-slate-200 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-slate-700 dark:focus:bg-slate-900"
                                            }`}
                                        />

                                    </div>

                                    {errors.name && (
                                        <p className="mt-2 text-xs text-red-500">
                                            {
                                                errors.name
                                            }
                                        </p>
                                    )}

                                </div>


                                {/* =========================================
                                    TELEPON
                                ========================================= */}

                                <div>

                                    <label
                                        htmlFor="phone"
                                        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                                    >
                                        Nomor Telepon
                                    </label>

                                    <div className="relative">

                                        <IconPhone
                                            size={20}
                                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                        <input
                                            id="phone"
                                            type="text"
                                            value={
                                                data.phone
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setData(
                                                    "phone",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="08xxxxxxxxxx"
                                            className={`h-12 w-full rounded-xl border bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 ${
                                                errors.phone
                                                    ? "border-red-400"
                                                    : "border-slate-200"
                                            }`}
                                        />

                                    </div>

                                    {errors.phone && (
                                        <p className="mt-2 text-xs text-red-500">
                                            {
                                                errors.phone
                                            }
                                        </p>
                                    )}

                                </div>


                                {/* =========================================
                                    ALAMAT
                                ========================================= */}

                                <div>

                                    <label
                                        htmlFor="address"
                                        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                                    >
                                        Alamat Toko
                                    </label>

                                    <div className="relative">

                                        <IconMapPin
                                            size={20}
                                            className="pointer-events-none absolute left-4 top-4 text-slate-400"
                                        />

                                        <textarea
                                            id="address"
                                            rows={6}
                                            value={
                                                data.address
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setData(
                                                    "address",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Masukkan alamat lengkap toko"
                                            className={`w-full resize-none rounded-xl border bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:bg-slate-950 dark:text-white dark:focus:bg-slate-900 ${
                                                errors.address
                                                    ? "border-red-400"
                                                    : "border-slate-200 dark:border-slate-700"
                                            }`}
                                        />

                                    </div>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Gunakan Enter
                                        untuk membuat
                                        baris baru.
                                    </p>

                                    {errors.address && (
                                        <p className="mt-2 text-xs text-red-500">
                                            {
                                                errors.address
                                            }
                                        </p>
                                    )}

                                </div>


                                {/* =========================================
                                    FOOTER
                                ========================================= */}

                                <div>

                                    <label
                                        htmlFor="footer"
                                        className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
                                    >
                                        Footer Struk
                                    </label>

                                    <div className="relative">

                                        <IconReceipt
                                            size={20}
                                            className="pointer-events-none absolute left-4 top-4 text-slate-400"
                                        />

                                        <textarea
                                            id="footer"
                                            rows={6}
                                            value={
                                                data.footer
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setData(
                                                    "footer",
                                                    e.target.value
                                                )
                                            }
                                            placeholder={
                                                "Terima kasih telah berbelanja\n" +
                                                "Barang yang sudah dibeli tidak dapat ditukar/dikembalikan"
                                            }
                                            className={`w-full resize-none rounded-xl border bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition dark:bg-slate-950 dark:text-white ${
                                                errors.footer
                                                    ? "border-red-400"
                                                    : "border-slate-200 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-slate-700 dark:focus:bg-slate-900"
                                            }`}
                                        />

                                    </div>

                                    <p className="mt-2 text-xs leading-5 text-slate-400">
                                        Footer akan
                                        ditampilkan di
                                        bagian bawah
                                        invoice, struk
                                        80mm, dan struk
                                        58mm.
                                        <br />
                                        Gunakan Enter
                                        untuk membuat
                                        baris baru.
                                    </p>

                                    {errors.footer && (
                                        <p className="mt-2 text-xs text-red-500">
                                            {
                                                errors.footer
                                            }
                                        </p>
                                    )}

                                </div>

                            </div>

                        </div>

                    </div>


                    {/* =====================================================
                        RIGHT
                    ===================================================== */}

                    <div className="space-y-6">

                        {/* =================================================
                            LOGO
                        ================================================= */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                            <div className="mb-5">

                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Logo Toko
                                </h2>

                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Logo akan
                                    ditampilkan pada
                                    struk dan invoice.
                                </p>

                            </div>


                            <div className="flex flex-col items-center">

                                {/* =========================================
                                    LOGO PREVIEW
                                ========================================= */}

                                <div className="flex h-44 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-950">

                                    {preview ? (
                                        <img
                                            key={
                                                preview
                                            }
                                            src={
                                                preview
                                            }
                                            alt={
                                                data.name ||
                                                "Logo toko"
                                            }
                                            className="max-h-36 max-w-[85%] object-contain"
                                            onError={
                                                handleImageError
                                            }
                                        />
                                    ) : (
                                        <div className="text-center">

                                            <IconPhoto
                                                size={44}
                                                className="mx-auto text-slate-300"
                                                stroke={
                                                    1.5
                                                }
                                            />

                                            <p className="mt-3 text-sm font-medium text-slate-500">
                                                Belum ada
                                                logo
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                PNG, JPG,
                                                WEBP atau
                                                SVG
                                            </p>

                                        </div>
                                    )}

                                </div>


                                {/* =========================================
                                    FILE INPUT
                                ========================================= */}

                                <input
                                    ref={
                                        fileInputRef
                                    }
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.webp,.svg,image/*"
                                    onChange={
                                        handleLogoChange
                                    }
                                    className="hidden"
                                />


                                {/* =========================================
                                    BUTTON
                                ========================================= */}

                                <div className="mt-4 flex w-full gap-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 text-sm font-semibold text-white transition hover:bg-primary-600"
                                    >

                                        <IconUpload
                                            size={18}
                                        />

                                        Upload Logo

                                    </button>


                                    {preview && (
                                        <button
                                            type="button"
                                            onClick={
                                                removeLogo
                                            }
                                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-red-200 text-red-500 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/30"
                                        >

                                            <IconTrash
                                                size={18}
                                            />

                                        </button>
                                    )}

                                </div>


                                {errors.logo && (
                                    <p className="mt-2 w-full text-xs text-red-500">
                                        {
                                            errors.logo
                                        }
                                    </p>
                                )}


                                <p className="mt-3 text-center text-xs leading-5 text-slate-400">
                                    Maksimal 2 MB.
                                    <br />
                                    Disarankan
                                    menggunakan logo
                                    dengan background
                                    transparan.
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            PREVIEW STRUK
                        ================================================= */}

                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                            <div className="mb-4 flex items-center gap-2">

                                <IconReceipt
                                    size={20}
                                    className="text-primary-500"
                                />

                                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                                    Preview Struk
                                </h2>

                            </div>


                            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-center dark:border-slate-700 dark:bg-slate-950">

                                {/* =========================================
                                    LOGO
                                ========================================= */}

                                {preview && (
                                    <img
                                        key={
                                            `preview-${preview}`
                                        }
                                        src={
                                            preview
                                        }
                                        alt="Logo"
                                        className="mx-auto mb-3 h-12 max-w-[150px] object-contain"
                                        onError={
                                            handleImageError
                                        }
                                    />
                                )}


                                {/* =========================================
                                    STORE NAME
                                ========================================= */}

                                <p className="font-bold text-slate-900 dark:text-white">
                                    {data.name ||
                                        "Nama Toko"}
                                </p>


                                {/* =========================================
                                    ADDRESS
                                ========================================= */}

                                {data.address && (
                                    <p className="mt-1 whitespace-pre-line text-xs leading-5 text-slate-500 dark:text-slate-400">
                                        {
                                            data.address
                                        }
                                    </p>
                                )}


                                {/* =========================================
                                    PHONE
                                ========================================= */}

                                {data.phone && (
                                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                        Telp:{" "}
                                        {
                                            data.phone
                                        }
                                    </p>
                                )}


                                {/* =========================================
                                    DIVIDER
                                ========================================= */}

                                <div className="mx-auto mt-4 h-px bg-slate-200 dark:bg-slate-700" />


                                {/* =========================================
                                    FOOTER PREVIEW
                                ========================================= */}

                                {data.footer ? (
                                    <p className="mt-3 whitespace-pre-line text-[10px] leading-4 uppercase tracking-widest text-slate-400">
                                        {
                                            data.footer
                                        }
                                    </p>
                                ) : (
                                    <p className="mt-3 text-[10px] uppercase tracking-widest text-slate-400">
                                        Footer belum
                                        diatur
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>


                    {/* =====================================================
                        SAVE
                    ===================================================== */}

                    <div className="flex justify-end xl:col-span-2">

                        <button
                            type="submit"
                            disabled={
                                processing
                            }
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary-500 px-6 text-sm font-bold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {processing ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <IconDeviceFloppy
                                        size={19}
                                    />

                                    Simpan Perubahan
                                </>
                            )}

                        </button>

                    </div>

                </form>

            </div>
        </>
    );
}


/*
|--------------------------------------------------------------------------
| DASHBOARD LAYOUT
|--------------------------------------------------------------------------
*/

Store.layout = (
    page
) => (
    <DashboardLayout>
        {page}
    </DashboardLayout>
);