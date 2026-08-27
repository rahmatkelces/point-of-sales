import React, { useEffect, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import Pagination from "@/Components/Dashboard/Pagination";
import Table from "@/Components/Dashboard/Table";

import {
    IconCirclePlus,
    IconDatabaseOff,
    IconFilter,
    IconGift,
    IconList,
    IconLayoutGrid,
    IconPencilCog,
    IconReceiptDollar,
    IconSearch,
    IconTicket,
    IconTrash,
    IconX,
    IconDiscount2,
} from "@tabler/icons-react";


/*
|--------------------------------------------------------------------------
| DEFAULT FILTER
|--------------------------------------------------------------------------
*/

const defaultFilterState = {
    search: "",
    type: "",
    status: "",
    per_page: 15,
};


/*
|--------------------------------------------------------------------------
| FORMAT CURRENCY
|--------------------------------------------------------------------------
*/

const formatCurrency = (value = 0) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
};


/*
|--------------------------------------------------------------------------
| FORMAT DATE
|--------------------------------------------------------------------------
|
| Input bisa berasal dari Laravel dalam beberapa bentuk:
|
| 2026-08-26 00:00:00
| 2026-08-26T00:00:00.000000Z
| 2026-08-26T00:00:00+00:00
|
| Output:
|
| 26/08/2026 00:00
|
|--------------------------------------------------------------------------
*/

const formatDateTime = (value) => {
    if (!value) {
        return "-";
    }

    const stringValue = String(value).trim();

    if (!stringValue) {
        return "-";
    }


    /*
    |--------------------------------------------------------------------------
    | Jika format Laravel:
    | 2026-08-26 00:00:00
    |--------------------------------------------------------------------------
    |
    | Jangan biarkan browser menebak format.
    |
    */

    const laravelMatch = stringValue.match(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/
    );

    if (laravelMatch) {
        const [
            ,
            year,
            month,
            day,
            hour,
            minute,
        ] = laravelMatch;

        return `${day}/${month}/${year} ${hour}:${minute}`;
    }


    /*
    |--------------------------------------------------------------------------
    | ISO format
    |--------------------------------------------------------------------------
    |
    | Contoh:
    | 2026-08-26T00:00:00.000000Z
    |
    */

    const isoDate = new Date(stringValue);

    if (!Number.isNaN(isoDate.getTime())) {
        return new Intl.DateTimeFormat("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }).format(isoDate);
    }


    /*
    |--------------------------------------------------------------------------
    | Jika tidak berhasil diparse
    |--------------------------------------------------------------------------
    */

    return stringValue;
};


/*
|--------------------------------------------------------------------------
| FORMAT DATE ONLY
|--------------------------------------------------------------------------
|
| Dipakai jika suatu saat hanya membutuhkan tanggal.
|
|--------------------------------------------------------------------------
*/

const formatDate = (value) => {
    if (!value) {
        return "-";
    }

    const stringValue = String(value).trim();

    const match = stringValue.match(
        /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (match) {
        const [, year, month, day] = match;

        return `${day}/${month}/${year}`;
    }

    const date = new Date(stringValue);

    if (Number.isNaN(date.getTime())) {
        return stringValue;
    }

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
};


/*
|--------------------------------------------------------------------------
| PROMOTION TYPE LABEL
|--------------------------------------------------------------------------
*/

function getPromotionTypeLabel(type) {
    switch (type) {
        case "price_discount":
            return "Diskon Harga";

        case "buy_x_get_y_same":
            return "Beli X Gratis Y Sama";

        case "buy_x_get_y_diff":
            return "Beli X Gratis Y Berbeda";

        case "voucher_nominal":
            return "Voucher Nominal";

        default:
            return type || "-";
    }
}


/*
|--------------------------------------------------------------------------
| PROMOTION TYPE ICON
|--------------------------------------------------------------------------
*/

function getPromotionTypeIcon(type) {
    switch (type) {
        case "price_discount":
            return <IconDiscount2 size={18} />;

        case "buy_x_get_y_same":
            return <IconGift size={18} />;

        case "buy_x_get_y_diff":
            return <IconReceiptDollar size={18} />;

        case "voucher_nominal":
            return <IconTicket size={18} />;

        default:
            return <IconDiscount2 size={18} />;
    }
}


/*
|--------------------------------------------------------------------------
| PROMOTION CARD
|--------------------------------------------------------------------------
*/

function PromotionCard({ promotion }) {
    const active = !!promotion.is_active;

    return (
        <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">

            {/* HEADER */}

            <div className="border-b border-slate-100 p-5 dark:border-slate-800">

                <div className="flex items-start justify-between gap-3">

                    <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400">

                            {getPromotionTypeIcon(
                                promotion.type
                            )}

                        </div>


                        <div>

                            <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                {promotion.name}
                            </h3>

                            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {getPromotionTypeLabel(
                                    promotion.type
                                )}
                            </p>

                        </div>

                    </div>


                    <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            active
                                ? "bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-400"
                                : "bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-400"
                        }`}
                    >
                        {active
                            ? "Aktif"
                            : "Nonaktif"}
                    </span>

                </div>

            </div>


            {/* CONTENT */}

            <div className="space-y-3 p-5">

                {/* KODE */}

                <div>

                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        Kode Voucher
                    </p>

                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {promotion.code || "-"}
                    </p>

                </div>


                {/* DISCOUNT + MIN PURCHASE */}

                <div className="grid grid-cols-2 gap-3">

                    <div>

                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Diskon
                        </p>

                        <p className="text-sm font-semibold text-primary-600 dark:text-primary-400">

                            {promotion.discount_nominal
                                ? formatCurrency(
                                      promotion.discount_nominal
                                  )
                                : "-"}

                        </p>

                    </div>


                    <div>

                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Minimal Belanja
                        </p>

                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">

                            {promotion.min_purchase
                                ? formatCurrency(
                                      promotion.min_purchase
                                  )
                                : "-"}

                        </p>

                    </div>

                </div>


                {/* BUY GET */}

                <div className="grid grid-cols-2 gap-3">

                    <div>

                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Buy Qty
                        </p>

                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {promotion.buy_qty || "-"}
                        </p>

                    </div>


                    <div>

                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Get Qty
                        </p>

                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {promotion.get_qty || "-"}
                        </p>

                    </div>

                </div>


                {/* PERIODE */}

                <div>

                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        Periode
                    </p>

                    <p className="text-sm text-slate-700 dark:text-slate-300">

                        {formatDateTime(
                            promotion.start_at
                        )}

                        {" s/d "}

                        {formatDateTime(
                            promotion.end_at
                        )}

                    </p>

                </div>

            </div>


            {/* ACTION */}

            <div className="flex items-center gap-2 px-5 pb-5">

                <Link
                    href={route(
                        "promotions.edit",
                        promotion.id
                    )}
                    className="inline-flex items-center justify-center rounded-xl bg-warning-100 p-2.5 text-warning-600 hover:bg-warning-200 dark:bg-warning-900/40 dark:text-warning-400"
                >
                    <IconPencilCog size={18} />
                </Link>


                <Button
                    type="delete"
                    icon={<IconTrash size={18} />}
                    className="rounded-xl bg-danger-100 p-2.5 text-danger-600 hover:bg-danger-200 dark:bg-danger-900/40 dark:text-danger-400"
                    url={route(
                        "promotions.destroy",
                        promotion.id
                    )}
                />

            </div>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| MAIN COMPONENT
|--------------------------------------------------------------------------
*/

export default function Index({
    promotions,
    filters = {},
    perPageOptions = [],
    types = [],
}) {

    const [viewMode, setViewMode] =
        useState("grid");

    const [showFilters, setShowFilters] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | FILTER STATE
    |--------------------------------------------------------------------------
    */

    const [filterData, setFilterData] =
        useState({
            ...defaultFilterState,

            search:
                filters?.search ?? "",

            type:
                filters?.type ?? "",

            status:
                filters?.status ?? "",

            per_page:
                filters?.per_page || 15,
        });


    /*
    |--------------------------------------------------------------------------
    | SYNC FILTER
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        setFilterData({
            ...defaultFilterState,

            search:
                filters?.search ?? "",

            type:
                filters?.type ?? "",

            status:
                filters?.status ?? "",

            per_page:
                filters?.per_page || 15,
        });

    }, [filters]);


    /*
    |--------------------------------------------------------------------------
    | HANDLE FILTER CHANGE
    |--------------------------------------------------------------------------
    */

    const handleChange = (
        field,
        value
    ) => {

        setFilterData((prev) => ({
            ...prev,
            [field]: value,
        }));

    };


    /*
    |--------------------------------------------------------------------------
    | APPLY FILTER
    |--------------------------------------------------------------------------
    */

    const applyFilters = (e) => {

        e.preventDefault();

        router.get(
            route("promotions.index"),
            filterData,
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            }
        );

        setShowFilters(false);
    };


    /*
    |--------------------------------------------------------------------------
    | RESET FILTER
    |--------------------------------------------------------------------------
    */

    const resetFilters = () => {

        setFilterData(
            defaultFilterState
        );

        router.get(
            route(
                "promotions.index"
            ),
            defaultFilterState,
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            }
        );

    };


    /*
    |--------------------------------------------------------------------------
    | DATA
    |--------------------------------------------------------------------------
    */

    const rows =
        promotions?.data ?? [];

    const paginationLinks =
        promotions?.links ?? [];

    const currentPage =
        promotions?.current_page ?? 1;

    const perPage =
        promotions?.per_page
            ? Number(
                  promotions.per_page
              )
            : rows.length || 1;


    /*
    |--------------------------------------------------------------------------
    | ACTIVE FILTER
    |--------------------------------------------------------------------------
    */

    const hasActiveFilters =
        !!filterData.search ||
        !!filterData.type ||
        filterData.status !== "" ||
        Number(filterData.per_page) !== 15;


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Promotions" />


            <div className="space-y-6">


                {/* ==========================================================
                    HEADER
                ========================================================== */}

                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">

                    <div>

                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Promotion
                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {promotions?.total ?? 0}{" "}
                            promotion terdaftar
                        </p>

                    </div>


                    <div className="flex items-center gap-2">


                        {/* GRID */}

                        <button
                            type="button"
                            onClick={() =>
                                setViewMode(
                                    "grid"
                                )
                            }
                            className={`rounded-lg p-2.5 transition-colors ${
                                viewMode ===
                                "grid"
                                    ? "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
                                    : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                        >

                            <IconLayoutGrid
                                size={20}
                            />

                        </button>


                        {/* LIST */}

                        <button
                            type="button"
                            onClick={() =>
                                setViewMode(
                                    "list"
                                )
                            }
                            className={`rounded-lg p-2.5 transition-colors ${
                                viewMode ===
                                "list"
                                    ? "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
                                    : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                        >

                            <IconList
                                size={20}
                            />

                        </button>


                        {/* FILTER */}

                        <button
                            type="button"
                            onClick={() =>
                                setShowFilters(
                                    !showFilters
                                )
                            }
                            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                                showFilters ||
                                hasActiveFilters
                                    ? "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950/50 dark:text-primary-400"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                            }`}
                        >

                            <IconFilter
                                size={18}
                            />

                            <span>
                                Filter
                            </span>

                            {hasActiveFilters && (
                                <span className="h-2 w-2 rounded-full bg-primary-500" />
                            )}

                        </button>


                        {/* ADD */}

                        <Button
                            type="link"
                            icon={
                                <IconCirclePlus
                                    size={18}
                                    strokeWidth={1.5}
                                />
                            }
                            className="bg-primary-500 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-600"
                            label="Tambah Promotion"
                            href={route(
                                "promotions.create"
                            )}
                        />

                    </div>

                </div>


                {/* ==========================================================
                    FILTER
                ========================================================== */}

                {showFilters && (

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">

                        <form
                            onSubmit={
                                applyFilters
                            }
                        >

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">


                                {/* SEARCH */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Cari Promotion
                                    </label>

                                    <div className="relative">

                                        <input
                                            type="text"
                                            placeholder="Cari nama atau kode..."
                                            value={
                                                filterData.search
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                handleChange(
                                                    "search",
                                                    e
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-slate-800 transition-all placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                        />

                                        <IconSearch
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                    </div>

                                </div>


                                {/* TYPE */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Jenis Promotion
                                    </label>

                                    <select
                                        value={
                                            filterData.type
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            handleChange(
                                                "type",
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >

                                        <option value="">
                                            Semua jenis
                                        </option>

                                        {types.map(
                                            (
                                                type
                                            ) => (
                                                <option
                                                    key={
                                                        type.value
                                                    }
                                                    value={
                                                        type.value
                                                    }
                                                >
                                                    {
                                                        type.label
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>


                                {/* STATUS */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Status
                                    </label>

                                    <select
                                        value={
                                            filterData.status
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            handleChange(
                                                "status",
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >

                                        <option value="">
                                            Semua status
                                        </option>

                                        <option value="1">
                                            Aktif
                                        </option>

                                        <option value="0">
                                            Nonaktif
                                        </option>

                                    </select>

                                </div>


                                {/* PER PAGE */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Tampilkan
                                    </label>

                                    <select
                                        value={
                                            filterData.per_page
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            handleChange(
                                                "per_page",
                                                Number(
                                                    e
                                                        .target
                                                        .value
                                                )
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-slate-800 transition-all focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >

                                        {perPageOptions.map(
                                            (
                                                option
                                            ) => (
                                                <option
                                                    key={
                                                        option
                                                    }
                                                    value={
                                                        option
                                                    }
                                                >
                                                    {
                                                        option
                                                    }
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            </div>


                            {/* FILTER BUTTON */}

                            <div className="mt-4 flex justify-end gap-2">

                                {hasActiveFilters && (

                                    <button
                                        type="button"
                                        onClick={
                                            resetFilters
                                        }
                                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                                    >

                                        <IconX
                                            size={18}
                                        />

                                    </button>

                                )}


                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary-600"
                                >

                                    <IconSearch
                                        size={18}
                                    />

                                    Terapkan

                                </button>

                            </div>

                        </form>

                    </div>

                )}


                {/* ==========================================================
                    DATA
                ========================================================== */}

                {rows.length > 0 ? (

                    viewMode === "grid" ? (

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">

                            {rows.map(
                                (
                                    promotion
                                ) => (

                                    <PromotionCard
                                        key={
                                            promotion.id
                                        }
                                        promotion={
                                            promotion
                                        }
                                    />

                                )
                            )}

                        </div>

                    ) : (

                        <Table.Card title="Data Promotion">

                            <Table>

                                <Table.Thead>

                                    <tr>

                                        <Table.Th className="w-10">
                                            No
                                        </Table.Th>

                                        <Table.Th>
                                            Nama
                                        </Table.Th>

                                        <Table.Th>
                                            Tipe
                                        </Table.Th>

                                        <Table.Th>
                                            Kode
                                        </Table.Th>

                                        <Table.Th>
                                            Diskon
                                        </Table.Th>

                                        <Table.Th>
                                            Status
                                        </Table.Th>

                                        <Table.Th>
                                        </Table.Th>

                                    </tr>

                                </Table.Thead>


                                <Table.Tbody>

                                    {rows.map(
                                        (
                                            promotion,
                                            i
                                        ) => (

                                            <tr
                                                key={
                                                    promotion.id
                                                }
                                                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                            >

                                                {/* NO */}

                                                <Table.Td className="text-center">

                                                    {i +
                                                        1 +
                                                        (currentPage -
                                                            1) *
                                                            perPage}

                                                </Table.Td>


                                                {/* NAMA */}

                                                <Table.Td>

                                                    <div>

                                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                            {
                                                                promotion.name
                                                            }
                                                        </p>

                                                        <p className="text-xs text-slate-500">

                                                            {formatDateTime(
                                                                promotion.start_at
                                                            )}

                                                            {" s/d "}

                                                            {formatDateTime(
                                                                promotion.end_at
                                                            )}

                                                        </p>

                                                    </div>

                                                </Table.Td>


                                                {/* TIPE */}

                                                <Table.Td>

                                                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">

                                                        {getPromotionTypeLabel(
                                                            promotion.type
                                                        )}

                                                    </span>

                                                </Table.Td>


                                                {/* CODE */}

                                                <Table.Td>
                                                    {
                                                        promotion.code ||
                                                        "-"
                                                    }
                                                </Table.Td>


                                                {/* DISCOUNT */}

                                                <Table.Td className="font-semibold text-primary-600 dark:text-primary-400">

                                                    {promotion.discount_nominal
                                                        ? formatCurrency(
                                                              promotion.discount_nominal
                                                          )
                                                        : "-"}

                                                </Table.Td>


                                                {/* STATUS */}

                                                <Table.Td>

                                                    <span
                                                        className={`rounded px-2 py-0.5 text-xs font-medium ${
                                                            promotion.is_active
                                                                ? "bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-400"
                                                                : "bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-400"
                                                        }`}
                                                    >

                                                        {promotion.is_active
                                                            ? "Aktif"
                                                            : "Nonaktif"}

                                                    </span>

                                                </Table.Td>


                                                {/* ACTION */}

                                                <Table.Td>

                                                    <div className="flex gap-2">

                                                        <Button
                                                            type="edit"
                                                            icon={
                                                                <IconPencilCog
                                                                    size={
                                                                        16
                                                                    }
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                            }
                                                            className="border border-warning-200 bg-warning-100 text-warning-600 hover:bg-warning-200 dark:border-warning-800 dark:bg-warning-900/50 dark:text-warning-400"
                                                            href={route(
                                                                "promotions.edit",
                                                                promotion.id
                                                            )}
                                                        />


                                                        <Button
                                                            type="delete"
                                                            icon={
                                                                <IconTrash
                                                                    size={
                                                                        16
                                                                    }
                                                                    strokeWidth={
                                                                        1.5
                                                                    }
                                                                />
                                                            }
                                                            className="border border-danger-200 bg-danger-100 text-danger-600 hover:bg-danger-200 dark:border-danger-800 dark:bg-danger-900/50 dark:text-danger-400"
                                                            url={route(
                                                                "promotions.destroy",
                                                                promotion.id
                                                            )}
                                                        />

                                                    </div>

                                                </Table.Td>

                                            </tr>

                                        )
                                    )}

                                </Table.Tbody>

                            </Table>

                        </Table.Card>

                    )

                ) : (

                    /* ======================================================
                       EMPTY
                    ====================================================== */

                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">

                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">

                            <IconDatabaseOff
                                size={32}
                                className="text-slate-400"
                                strokeWidth={1.5}
                            />

                        </div>


                        <h3 className="mb-1 text-lg font-medium text-slate-800 dark:text-slate-200">
                            Belum Ada Promotion
                        </h3>


                        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
                            Tidak ada promotion sesuai filter.
                        </p>


                        <Button
                            type="link"
                            icon={
                                <IconCirclePlus
                                    size={18}
                                />
                            }
                            className="bg-primary-500 text-white hover:bg-primary-600"
                            label="Tambah Promotion"
                            href={route(
                                "promotions.create"
                            )}
                        />

                    </div>

                )}


                {/* ==========================================================
                    PAGINATION
                ========================================================== */}

                {paginationLinks.length >
                    3 && (
                    <Pagination
                        links={
                            paginationLinks
                        }
                    />
                )}

            </div>
        </>
    );
}


/*
|--------------------------------------------------------------------------
| LAYOUT
|--------------------------------------------------------------------------
*/

Index.layout = (page) => (
    <DashboardLayout>
        {page}
    </DashboardLayout>
);