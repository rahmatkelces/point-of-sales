import React, {
    useMemo,
    useState,
} from "react";

import DashboardLayout from "@/Layouts/DashboardLayout";

import {
    Head,
    Link,
    useForm,
    usePage,
} from "@inertiajs/react";

import Input from "@/Components/Dashboard/Input";

import toast from "react-hot-toast";

import {
    IconArrowLeft,
    IconCheck,
    IconDeviceFloppy,
    IconPlus,
    IconSearch,
} from "@tabler/icons-react";


/*
|--------------------------------------------------------------------------
| Format Currency
|--------------------------------------------------------------------------
*/

const formatCurrency = (value = 0) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value ?? 0);
};


/*
|--------------------------------------------------------------------------
| Edit
|--------------------------------------------------------------------------
*/

export default function Edit({
    extra,
    products = [],
}) {
    const { errors = {} } = usePage().props;

    const {
        data,
        setData,
        put,
        processing,
    } = useForm({
        name: extra?.name ?? "",
        price: extra?.price ?? "",
        is_active:
            extra?.is_active ?? true,
        product_ids:
            extra?.product_ids ?? [],
    });

    const [
        productSearch,
        setProductSearch,
    ] = useState("");


    /*
    |--------------------------------------------------------------------------
    | FILTER PRODUCTS
    |--------------------------------------------------------------------------
    */

    const filteredProducts = useMemo(() => {
        const productList = Array.isArray(products)
            ? products
            : [];

        const keyword = productSearch
            .toLowerCase()
            .trim();

        if (!keyword) {
            return productList;
        }

        return productList.filter((product) =>
            String(product.title ?? "")
                .toLowerCase()
                .includes(keyword)
        );
    }, [
        products,
        productSearch,
    ]);


    /*
    |--------------------------------------------------------------------------
    | TOGGLE PRODUCT
    |--------------------------------------------------------------------------
    */

    const toggleProduct = (productId) => {
        const selected =
            data.product_ids.includes(productId);

        if (selected) {
            setData(
                "product_ids",
                data.product_ids.filter(
                    (id) => id !== productId
                )
            );

            return;
        }

        setData(
            "product_ids",
            [
                ...data.product_ids,
                productId,
            ]
        );
    };


    /*
    |--------------------------------------------------------------------------
    | SELECT ALL
    |--------------------------------------------------------------------------
    */

    const selectAll = () => {
        const ids = filteredProducts.map(
            (product) => product.id
        );

        setData(
            "product_ids",
            [
                ...new Set([
                    ...data.product_ids,
                    ...ids,
                ]),
            ]
        );
    };


    /*
    |--------------------------------------------------------------------------
    | CLEAR FILTERED
    |--------------------------------------------------------------------------
    */

    const clearAll = () => {
        const ids = filteredProducts.map(
            (product) => product.id
        );

        setData(
            "product_ids",
            data.product_ids.filter(
                (id) => !ids.includes(id)
            )
        );
    };


    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const submit = (e) => {
        e.preventDefault();

        put(
            route(
                "extras.update",
                extra.id
            ),
            {
                preserveScroll: true,

                onSuccess: () => {
                    toast.success(
                        "Extra berhasil diperbarui"
                    );
                },

                onError: () => {
                    toast.error(
                        "Gagal memperbarui extra"
                    );
                },
            }
        );
    };


    return (
        <>
            <Head title="Edit Extra" />


            {/* HEADER */}

            <div className="mb-6">

                <Link
                    href={route("extras.index")}
                    className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-primary-600"
                >
                    <IconArrowLeft size={16} />

                    Kembali ke Extra
                </Link>


                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Edit Extra
                </h1>


                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Perbarui informasi dan produk
                    yang bisa menggunakan extra.
                </p>

            </div>


            {/* FORM */}

            <form onSubmit={submit}>

                <div className="max-w-5xl">

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">


                            {/* ==================================================
                                INFO
                            ================================================== */}

                            <div className="space-y-4">

                                <Input
                                    type="text"
                                    label="Nama Extra"
                                    placeholder="Contoh: Keju"
                                    value={data.name}
                                    errors={errors.name}
                                    onChange={(e) =>
                                        setData(
                                            "name",
                                            e.target.value
                                        )
                                    }
                                />


                                <Input
                                    type="number"
                                    label="Harga Extra"
                                    placeholder="Contoh: 2000"
                                    min="0"
                                    value={data.price}
                                    errors={errors.price}
                                    onChange={(e) =>
                                        setData(
                                            "price",
                                            e.target.value
                                        )
                                    }
                                />


                                {/* STATUS */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Status
                                    </label>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setData(
                                                "is_active",
                                                !data.is_active
                                            )
                                        }
                                        className={`relative inline-flex h-11 w-full items-center rounded-xl border px-4 transition ${
                                            data.is_active
                                                ? "border-success-200 bg-success-50 text-success-700 dark:border-success-900 dark:bg-success-950/30 dark:text-success-400"
                                                : "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800"
                                        }`}
                                    >

                                        <span
                                            className={`mr-3 flex h-6 w-6 items-center justify-center rounded-full ${
                                                data.is_active
                                                    ? "bg-success-500 text-white"
                                                    : "bg-slate-300 dark:bg-slate-600"
                                            }`}
                                        >

                                            {data.is_active && (
                                                <IconCheck
                                                    size={15}
                                                />
                                            )}

                                        </span>


                                        <span className="font-medium">
                                            {data.is_active
                                                ? "Aktif"
                                                : "Nonaktif"}
                                        </span>

                                    </button>

                                </div>

                            </div>


                            {/* ==================================================
                                PRODUCTS
                            ================================================== */}

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">

                                <div className="mb-4 flex items-center justify-between">

                                    <div>

                                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                                            Produk yang Bisa Menggunakan
                                        </h3>

                                        <p className="text-xs text-slate-500">
                                            Tentukan produk yang
                                            memiliki extra ini.
                                        </p>

                                    </div>


                                    <span className="rounded-full bg-primary-100 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-400">

                                        {data.product_ids.length}{" "}
                                        dipilih

                                    </span>

                                </div>


                                {/* SEARCH */}

                                <div className="relative mb-3">

                                    <input
                                        type="text"
                                        value={productSearch}
                                        onChange={(e) =>
                                            setProductSearch(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Cari produk..."
                                        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    />


                                    <IconSearch
                                        size={17}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                </div>


                                {/* ACTION */}

                                <div className="mb-3 flex gap-2">

                                    <button
                                        type="button"
                                        onClick={selectAll}
                                        disabled={
                                            filteredProducts.length === 0
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                    >
                                        Pilih Semua
                                    </button>


                                    <button
                                        type="button"
                                        onClick={clearAll}
                                        disabled={
                                            filteredProducts.length === 0
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                                    >
                                        Hapus Pilihan
                                    </button>

                                </div>


                                {/* PRODUCTS */}

                                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">

                                    {filteredProducts.length > 0 ? (

                                        filteredProducts.map(
                                            (product) => {

                                                const selected =
                                                    data.product_ids.includes(
                                                        product.id
                                                    );

                                                return (

                                                    <button
                                                        type="button"
                                                        key={product.id}
                                                        onClick={() =>
                                                            toggleProduct(
                                                                product.id
                                                            )
                                                        }
                                                        className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition ${
                                                            selected
                                                                ? "border-primary-300 bg-primary-50 dark:border-primary-800 dark:bg-primary-950/30"
                                                                : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                                                        }`}
                                                    >

                                                        <div className="flex items-center gap-3">

                                                            <div
                                                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                                    selected
                                                                        ? "bg-primary-500 text-white"
                                                                        : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                                                                }`}
                                                            >

                                                                {selected ? (
                                                                    <IconCheck
                                                                        size={17}
                                                                    />
                                                                ) : (
                                                                    <IconPlus
                                                                        size={17}
                                                                    />
                                                                )}

                                                            </div>


                                                            <div>

                                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                                    {product.title}
                                                                </p>


                                                                <p className="text-xs text-slate-400">
                                                                    {formatCurrency(
                                                                        product.sell_price
                                                                    )}
                                                                </p>

                                                            </div>

                                                        </div>

                                                    </button>

                                                );
                                            }
                                        )

                                    ) : (

                                        <div className="py-8 text-center text-sm text-slate-400">
                                            {products.length === 0
                                                ? "Belum ada produk."
                                                : "Produk tidak ditemukan."}
                                        </div>

                                    )}

                                </div>

                            </div>

                        </div>


                        {/* FOOTER */}

                        <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">

                            <Link
                                href={route("extras.index")}
                                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                            >
                                Batal
                            </Link>


                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600 disabled:opacity-50"
                            >

                                <IconDeviceFloppy size={18} />

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