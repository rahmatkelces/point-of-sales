import React from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";

function InputError({ message }) {
    if (!message) return null;
    return <p className="mt-1 text-sm text-danger-500">{message}</p>;
}

export default function Edit({
    promotion,
    products = [],
    types = [],
    selectedProducts = {},
}) {
    const { data, setData, put, processing, errors } = useForm({
        name: promotion?.name || "",
        code: promotion?.code || "",
        type: promotion?.type || "",
        is_active: !!promotion?.is_active,
        start_at: promotion?.start_at || "",
        end_at: promotion?.end_at || "",
        discount_nominal: promotion?.discount_nominal || "",
        min_purchase: promotion?.min_purchase || "",
        buy_qty: promotion?.buy_qty || "",
        get_qty: promotion?.get_qty || "",
        description: promotion?.description || "",
        target_product_ids: selectedProducts?.target_product_ids || [],
        buy_product_ids: selectedProducts?.buy_product_ids || [],
        get_product_ids: selectedProducts?.get_product_ids || [],
    });

    const submit = (e) => {
        e.preventDefault();
        put(route("promotions.update", promotion.id));
    };

    const handleMultiSelect = (e, field) => {
        const values = Array.from(e.target.selectedOptions, (option) =>
            Number(option.value)
        );
        setData(field, values);
    };

    const showTargetProducts =
        data.type === "price_discount" || data.type === "buy_x_get_y_same";

    const showBuyGetProducts = data.type === "buy_x_get_y_diff";
    const showVoucherFields = data.type === "voucher_nominal";

    return (
        <>
            <Head title="Edit Promotion" />

            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Edit Promotion
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Update data promotion.
                        </p>
                    </div>

                    <Link
                        href={route("promotions.index")}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <IconArrowLeft size={18} />
                        Kembali
                    </Link>
                </div>

                <form onSubmit={submit}>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                    Nama Promotion
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                    Jenis Promotion
                                </label>
                                <select
                                    value={data.type}
                                    onChange={(e) => setData("type", e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                >
                                    <option value="">Pilih jenis promotion</option>
                                    {types.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.type} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                    Start At
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.start_at}
                                    onChange={(e) => setData("start_at", e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                                <InputError message={errors.start_at} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                    End At
                                </label>
                                <input
                                    type="datetime-local"
                                    value={data.end_at}
                                    onChange={(e) => setData("end_at", e.target.value)}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                                <InputError message={errors.end_at} />
                            </div>

                            <div className="md:col-span-2">
                                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData("is_active", e.target.checked)}
                                    />
                                    Promotion aktif
                                </label>
                            </div>

                            {showVoucherFields && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                            Kode Voucher
                                        </label>
                                        <input
                                            type="text"
                                            value={data.code}
                                            onChange={(e) => setData("code", e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                        />
                                        <InputError message={errors.code} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                            Minimal Belanja
                                        </label>
                                        <input
                                            type="number"
                                            value={data.min_purchase}
                                            onChange={(e) => setData("min_purchase", e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                        />
                                        <InputError message={errors.min_purchase} />
                                    </div>
                                </>
                            )}

                            {(data.type === "price_discount" || data.type === "voucher_nominal") && (
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                        Discount Nominal
                                    </label>
                                    <input
                                        type="number"
                                        value={data.discount_nominal}
                                        onChange={(e) => setData("discount_nominal", e.target.value)}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    />
                                    <InputError message={errors.discount_nominal} />
                                </div>
                            )}

                            {(data.type === "buy_x_get_y_same" || data.type === "buy_x_get_y_diff") && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                            Buy Qty
                                        </label>
                                        <input
                                            type="number"
                                            value={data.buy_qty}
                                            onChange={(e) => setData("buy_qty", e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                        />
                                        <InputError message={errors.buy_qty} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                            Get Qty
                                        </label>
                                        <input
                                            type="number"
                                            value={data.get_qty}
                                            onChange={(e) => setData("get_qty", e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                        />
                                        <InputError message={errors.get_qty} />
                                    </div>
                                </>
                            )}

                            {showTargetProducts && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                        Product Target
                                    </label>
                                    <select
                                        multiple
                                        value={data.target_product_ids}
                                        onChange={(e) => handleMultiSelect(e, "target_product_ids")}
                                        className="w-full min-h-[180px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    >
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.title} - {product.barcode}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.target_product_ids} />
                                </div>
                            )}

                            {showBuyGetProducts && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                            Buy Products
                                        </label>
                                        <select
                                            multiple
                                            value={data.buy_product_ids}
                                            onChange={(e) => handleMultiSelect(e, "buy_product_ids")}
                                            className="w-full min-h-[180px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                        >
                                            {products.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.title} - {product.barcode}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.buy_product_ids} />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                            Get Products
                                        </label>
                                        <select
                                            multiple
                                            value={data.get_product_ids}
                                            onChange={(e) => handleMultiSelect(e, "get_product_ids")}
                                            className="w-full min-h-[180px] px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                        >
                                            {products.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.title} - {product.barcode}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.get_product_ids} />
                                    </div>
                                </>
                            )}

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                                    Deskripsi
                                </label>
                                <textarea
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData("description", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Link
                                href={route("promotions.index")}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white"
                            >
                                <IconDeviceFloppy size={18} />
                                {processing ? "Menyimpan..." : "Update"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

Edit.layout = (page) => <DashboardLayout children={page} />;