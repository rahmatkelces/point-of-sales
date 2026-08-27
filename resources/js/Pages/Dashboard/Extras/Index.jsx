import React, {
    useEffect,
    useState,
} from "react";

import DashboardLayout from "@/Layouts/DashboardLayout";

import {
    Head,
    Link,
    router,
} from "@inertiajs/react";

import Button from "@/Components/Dashboard/Button";
import Pagination from "@/Components/Dashboard/Pagination";
import Table from "@/Components/Dashboard/Table";

import {
    IconCirclePlus,
    IconDatabaseOff,
    IconEdit,
    IconFilter,
    IconSearch,
    IconTrash,
    IconX,
    IconPlus,
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
| Index
|--------------------------------------------------------------------------
*/

export default function Index({
    extras,
    filters = {},
    perPageOptions = [],
}) {
    const [showFilters, setShowFilters] =
        useState(false);


    const [filterData, setFilterData] =
        useState({
            search:
                filters.search ?? "",

            per_page:
                filters.per_page ?? 15,
        });


    /*
    |--------------------------------------------------------------------------
    | SYNC FILTER
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        setFilterData({
            search:
                filters.search ?? "",

            per_page:
                filters.per_page ?? 15,
        });
    }, [filters]);


    /*
    |--------------------------------------------------------------------------
    | FILTER CHANGE
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
            route("extras.index"),
            filterData,
            {
                preserveState: true,
                preserveScroll: true,
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
        const reset = {
            search: "",
            per_page: 15,
        };

        setFilterData(reset);

        router.get(
            route("extras.index"),
            reset,
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };


    /*
    |--------------------------------------------------------------------------
    | HAS FILTER
    |--------------------------------------------------------------------------
    */

    const hasFilters =
        !!filterData.search ||
        Number(filterData.per_page) !== 15;


    /*
    |--------------------------------------------------------------------------
    | ROWS
    |--------------------------------------------------------------------------
    */

    const rows =
        extras?.data ?? [];


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Extra Produk" />


            <div className="space-y-6">


                {/* ==========================================================
                    HEADER
                ========================================================== */}

                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                    <div>

                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Extra Produk
                        </h1>


                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Kelola tambahan produk seperti telur,
                            keju, bakso, sosis, dan lainnya.
                        </p>

                    </div>


                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={() =>
                                setShowFilters(
                                    !showFilters
                                )
                            }
                            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${
                                showFilters ||
                                hasFilters
                                    ? "border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-800 dark:bg-primary-950/40 dark:text-primary-400"
                                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                            }`}
                        >

                            <IconFilter
                                size={18}
                            />

                            Filter

                        </button>


                        <Link
                            href={route(
                                "extras.create"
                            )}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-600"
                        >

                            <IconCirclePlus
                                size={18}
                            />

                            Tambah Extra

                        </Link>

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

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">


                                {/* SEARCH */}

                                <div>

                                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Cari Extra
                                    </label>


                                    <div className="relative">

                                        <input
                                            type="text"
                                            value={
                                                filterData.search
                                            }
                                            onChange={(e) =>
                                                handleChange(
                                                    "search",
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Cari nama extra..."
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                        />


                                        <IconSearch
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />

                                    </div>

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
                                        onChange={(e) =>
                                            handleChange(
                                                "per_page",
                                                Number(
                                                    e.target.value
                                                )
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-800 outline-none focus:border-primary-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                                    >

                                        {perPageOptions.map(
                                            (option) => (
                                                <option
                                                    key={
                                                        option
                                                    }
                                                    value={
                                                        option
                                                    }
                                                >
                                                    {option}
                                                </option>
                                            )
                                        )}

                                    </select>

                                </div>

                            </div>


                            <div className="mt-4 flex justify-end gap-2">

                                {hasFilters && (

                                    <button
                                        type="button"
                                        onClick={
                                            resetFilters
                                        }
                                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
                                    >

                                        <IconX
                                            size={18}
                                        />

                                    </button>

                                )}


                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
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
                    TABLE
                ========================================================== */}

                {rows.length > 0 ? (

                    <Table.Card title="Daftar Extra">

                        <Table>

                            <Table.Thead>

                                <tr>

                                    <Table.Th className="w-12">
                                        No
                                    </Table.Th>

                                    <Table.Th>
                                        Nama Extra
                                    </Table.Th>

                                    <Table.Th>
                                        Harga
                                    </Table.Th>

                                    <Table.Th>
                                        Digunakan Pada
                                    </Table.Th>

                                    <Table.Th>
                                        Status
                                    </Table.Th>

                                    <Table.Th>
                                        Aksi
                                    </Table.Th>

                                </tr>

                            </Table.Thead>


                            <Table.Tbody>

                                {rows.map(
                                    (
                                        extra,
                                        index
                                    ) => (

                                        <tr
                                            key={
                                                extra.id
                                            }
                                            className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        >

                                            {/* NO */}

                                            <Table.Td className="text-center">

                                                {index +
                                                    1 +
                                                    (
                                                        (
                                                            extras.current_page ??
                                                            1
                                                        ) -
                                                        1
                                                    ) *
                                                    (
                                                        extras.per_page ??
                                                        15
                                                    )}

                                            </Table.Td>


                                            {/* NAME */}

                                            <Table.Td>

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40 dark:text-primary-400">

                                                        <IconPlus
                                                            size={20}
                                                        />

                                                    </div>


                                                    <div>

                                                        <p className="font-medium text-slate-800 dark:text-slate-200">
                                                            {
                                                                extra.name
                                                            }
                                                        </p>


                                                        <p className="text-xs text-slate-400">
                                                            Extra Produk
                                                        </p>

                                                    </div>

                                                </div>

                                            </Table.Td>


                                            {/* PRICE */}

                                            <Table.Td>

                                                <span className="font-semibold text-primary-600 dark:text-primary-400">

                                                    {formatCurrency(
                                                        extra.price
                                                    )}

                                                </span>

                                            </Table.Td>


                                            {/* PRODUCT COUNT */}

                                            <Table.Td>

                                                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">

                                                    {
                                                        extra.products_count ??
                                                        0
                                                    }{" "}
                                                    produk

                                                </span>

                                            </Table.Td>


                                            {/* STATUS */}

                                            <Table.Td>

                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                        extra.is_active
                                                            ? "bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-400"
                                                            : "bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-400"
                                                    }`}
                                                >

                                                    {extra.is_active
                                                        ? "Aktif"
                                                        : "Nonaktif"}

                                                </span>

                                            </Table.Td>


                                            {/* ACTION */}

                                            <Table.Td>

                                                <div className="flex items-center gap-2">

                                                    <Link
                                                        href={route(
                                                            "extras.edit",
                                                            extra.id
                                                        )}
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-warning-100 text-warning-600 transition hover:bg-warning-200 dark:bg-warning-900/40 dark:text-warning-400"
                                                    >

                                                        <IconEdit
                                                            size={17}
                                                        />

                                                    </Link>


                                                    <Button
                                                        type="delete"
                                                        icon={
                                                            <IconTrash
                                                                size={17}
                                                            />
                                                        }
                                                        className="border border-danger-200 bg-danger-100 text-danger-600 hover:bg-danger-200 dark:border-danger-800 dark:bg-danger-900/40 dark:text-danger-400"
                                                        url={route(
                                                            "extras.destroy",
                                                            extra.id
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

                ) : (

                    /* ======================================================
                       EMPTY
                    ====================================================== */

                    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">

                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">

                            <IconDatabaseOff
                                size={32}
                                className="text-slate-400"
                            />

                        </div>


                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                            Belum Ada Extra
                        </h3>


                        <p className="mt-1 text-sm text-slate-500">
                            Tambahkan extra seperti telur,
                            keju, bakso, atau sosis.
                        </p>


                        <Link
                            href={route(
                                "extras.create"
                            )}
                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-600"
                        >

                            <IconCirclePlus
                                size={18}
                            />

                            Tambah Extra

                        </Link>

                    </div>

                )}


                {/* ==========================================================
                    PAGINATION
                ========================================================== */}

                {extras?.links &&
                    extras.links.length > 3 && (

                        <Pagination
                            links={
                                extras.links
                            }
                        />

                    )}

            </div>
        </>
    );
}


Index.layout = (page) => (
    <DashboardLayout>
        {page}
    </DashboardLayout>
);