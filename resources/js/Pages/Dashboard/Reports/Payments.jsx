import React, { useEffect, useMemo, useState } from "react";
import { Head, router } from "@inertiajs/react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import InputSelect from "@/Components/Dashboard/InputSelect";
import Pagination from "@/Components/Dashboard/Pagination";
import {
    IconCash,
    IconCreditCard,
    IconDatabaseOff,
    IconFilter,
    IconFileSpreadsheet,
    IconReceipt2,
    IconSearch,
    IconX,
    IconQrcode,
    IconClockHour6,
    IconCircleCheck,
    IconAlertCircle,
} from "@tabler/icons-react";

// =========================================================
// FORMAT PRICE
// =========================================================

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(Number(value) || 0);

// =========================================================
// FORMAT FILTER
// =========================================================

const castFilterString = (value) =>
    typeof value === "number"
        ? String(value)
        : value ?? "";

// =========================================================
// SUMMARY CARD
// =========================================================

const SummaryCard = ({
    icon,
    title,
    value,
    count,
    description,
    gradient,
}) => (
    <div
        className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${gradient} text-white shadow-lg`}
    >
        <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
            {React.cloneElement(icon, {
                size: 96,
                strokeWidth: 0.5,
                className:
                    "transform translate-x-4 -translate-y-4",
            })}
        </div>

        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 rounded-xl bg-white/20">
                    {React.cloneElement(icon, {
                        size: 18,
                    })}
                </div>

                <span className="text-sm font-medium opacity-90">
                    {title}
                </span>
            </div>

            <p className="text-2xl font-bold">
                {value}
            </p>

            <p className="text-sm opacity-80 mt-1">
                {count} transaksi
            </p>

            {description && (
                <p className="text-xs opacity-70 mt-1">
                    {description}
                </p>
            )}
        </div>
    </div>
);

// =========================================================
// DEFAULT FILTER
// =========================================================

const defaultFilterState = {
    start_date: "",
    end_date: "",
    invoice: "",
    cashier_id: "",
    customer_id: "",
    payment_method: "",
    payment_status: "",
};

// =========================================================
// PAYMENT LABEL
// =========================================================

const paymentLabel = (method) => {
    const value = String(
        method ?? ""
    )
        .trim()
        .toLowerCase();

    if (
        value === "cash" ||
        value === "tunai"
    ) {
        return "CASH";
    }

    if (value === "qris") {
        return "QRIS";
    }

    if (
        value === "paylater" ||
        value === "pay_later"
    ) {
        return "PAY LATER";
    }

    return value
        ? value.toUpperCase()
        : "-";
};

// =========================================================
// STATUS LABEL
// =========================================================

const statusLabel = (status) => {
    const value = String(
        status ?? ""
    )
        .trim()
        .toLowerCase();

    if (
        [
            "paid",
            "success",
            "successful",
            "completed",
            "complete",
        ].includes(value)
    ) {
        return "LUNAS";
    }

    if (
        [
            "unpaid",
            "pending",
            "waiting",
        ].includes(value)
    ) {
        return "BELUM LUNAS";
    }

    if (
        [
            "failed",
            "failure",
        ].includes(value)
    ) {
        return "GAGAL";
    }

    if (value === "expired") {
        return "EXPIRED";
    }

    return value
        ? value.toUpperCase()
        : "-";
};

// =========================================================
// STATUS CLASS
// =========================================================

const statusClass = (status) => {
    const value = String(
        status ?? ""
    )
        .trim()
        .toLowerCase();

    if (
        [
            "paid",
            "success",
            "successful",
            "completed",
            "complete",
        ].includes(value)
    ) {
        return "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400";
    }

    if (
        [
            "unpaid",
            "pending",
            "waiting",
        ].includes(value)
    ) {
        return "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400";
    }

    if (
        [
            "failed",
            "failure",
            "expired",
        ].includes(value)
    ) {
        return "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400";
    }

    return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
};

// =========================================================
// PAYMENTS
// =========================================================

export default function Payments({
    transactions,
    summary,
    filters,
    cashiers = [],
    customers = [],
}) {
    const [showFilters, setShowFilters] =
        useState(false);

    const [isExporting, setIsExporting] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    const [filterData, setFilterData] =
        useState({
            ...defaultFilterState,

            start_date:
                castFilterString(
                    filters?.start_date
                ),

            end_date:
                castFilterString(
                    filters?.end_date
                ),

            invoice:
                castFilterString(
                    filters?.invoice
                ),

            cashier_id:
                castFilterString(
                    filters?.cashier_id
                ),

            customer_id:
                castFilterString(
                    filters?.customer_id
                ),

            payment_method:
                castFilterString(
                    filters?.payment_method
                ),

            payment_status:
                castFilterString(
                    filters?.payment_status
                ),
        });

    /*
    |--------------------------------------------------------------------------
    | SELECTED CASHIER
    |--------------------------------------------------------------------------
    */

    const cashierFromFilters = useMemo(
        () =>
            cashiers.find(
                (cashier) =>
                    castFilterString(
                        cashier.id
                    ) ===
                    filterData.cashier_id
            ) ?? null,
        [
            cashiers,
            filterData.cashier_id,
        ]
    );

    /*
    |--------------------------------------------------------------------------
    | SELECTED CUSTOMER
    |--------------------------------------------------------------------------
    */

    const customerFromFilters = useMemo(
        () =>
            customers.find(
                (customer) =>
                    castFilterString(
                        customer.id
                    ) ===
                    filterData.customer_id
            ) ?? null,
        [
            customers,
            filterData.customer_id,
        ]
    );

    const [
        selectedCashier,
        setSelectedCashier,
    ] = useState(
        cashierFromFilters
    );

    const [
        selectedCustomer,
        setSelectedCustomer,
    ] = useState(
        customerFromFilters
    );

    /*
    |--------------------------------------------------------------------------
    | SYNC
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        setSelectedCashier(
            cashierFromFilters
        );
    }, [
        cashierFromFilters,
    ]);

    useEffect(() => {
        setSelectedCustomer(
            customerFromFilters
        );
    }, [
        customerFromFilters,
    ]);

    useEffect(() => {
        setFilterData({
            ...defaultFilterState,

            start_date:
                castFilterString(
                    filters?.start_date
                ),

            end_date:
                castFilterString(
                    filters?.end_date
                ),

            invoice:
                castFilterString(
                    filters?.invoice
                ),

            cashier_id:
                castFilterString(
                    filters?.cashier_id
                ),

            customer_id:
                castFilterString(
                    filters?.customer_id
                ),

            payment_method:
                castFilterString(
                    filters?.payment_method
                ),

            payment_status:
                castFilterString(
                    filters?.payment_status
                ),
        });
    }, [filters]);

    /*
    |--------------------------------------------------------------------------
    | CHANGE
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
    | CASHIER
    |--------------------------------------------------------------------------
    */

    const handleSelectCashier = (
        value
    ) => {
        setSelectedCashier(value);

        handleChange(
            "cashier_id",
            value
                ? String(value.id)
                : ""
        );
    };

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER
    |--------------------------------------------------------------------------
    */

    const handleSelectCustomer = (
        value
    ) => {
        setSelectedCustomer(value);

        handleChange(
            "customer_id",
            value
                ? String(value.id)
                : ""
        );
    };

    /*
    |--------------------------------------------------------------------------
    | APPLY FILTER
    |--------------------------------------------------------------------------
    */

    const applyFilters = (e) => {
        e.preventDefault();

        router.get(
            route(
                "reports.payments.index"
            ),
            filterData,
            {
                preserveScroll: true,
                preserveState: true,
            }
        );

        setShowFilters(false);
    };

    /*
    |--------------------------------------------------------------------------
    | RESET
    |--------------------------------------------------------------------------
    */

    const resetFilters = () => {
        setFilterData(
            defaultFilterState
        );

        setSelectedCashier(null);
        setSelectedCustomer(null);

        router.get(
            route(
                "reports.payments.index"
            ),
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | EXPORT
    |--------------------------------------------------------------------------
    */

    const exportExcel = () => {
        if (isExporting) {
            return;
        }

        setIsExporting(true);

        const params =
            new URLSearchParams();

        Object.entries(
            filterData
        ).forEach(
            ([key, value]) => {
                if (
                    value !== null &&
                    value !== undefined &&
                    value !== ""
                ) {
                    params.append(
                        key,
                        value
                    );
                }
            }
        );

        const queryString =
            params.toString();

        const url =
            route(
                "reports.payments.export"
            ) +
            (
                queryString
                    ? `?${queryString}`
                    : ""
            );

        window.location.href = url;

        setTimeout(() => {
            setIsExporting(false);
        }, 1500);
    };

    /*
    |--------------------------------------------------------------------------
    | ACTIVE FILTER
    |--------------------------------------------------------------------------
    */

    const hasActiveFilters =
        filterData.start_date ||
        filterData.end_date ||
        filterData.invoice ||
        filterData.cashier_id ||
        filterData.customer_id ||
        filterData.payment_method ||
        filterData.payment_status;

    /*
    |--------------------------------------------------------------------------
    | DATA
    |--------------------------------------------------------------------------
    */

    const rows =
        transactions?.data ?? [];

    const paginationLinks =
        transactions?.links ?? [];

    const currentPage =
        transactions?.current_page ?? 1;

    const perPage =
        transactions?.per_page
            ? Number(
                  transactions.per_page
              )
            : 10;

    /*
    |--------------------------------------------------------------------------
    | SAFE SUMMARY
    |--------------------------------------------------------------------------
    */

    const safeSummary = {
        total_transactions:
            summary?.total_transactions ??
            0,

        total_payment:
            summary?.total_payment ??
            0,

        cash: {
            count:
                summary?.cash?.count ??
                0,

            total:
                summary?.cash?.total ??
                0,
        },

        qris: {
            count:
                summary?.qris?.count ??
                0,

            total:
                summary?.qris?.total ??
                0,
        },

        paylater: {
            count:
                summary?.paylater?.count ??
                0,

            total:
                summary?.paylater?.total ??
                0,
        },

        paid: {
            count:
                summary?.paid?.count ??
                0,

            total:
                summary?.paid?.total ??
                0,
        },

        unpaid: {
            count:
                summary?.unpaid?.count ??
                0,

            total:
                summary?.unpaid?.total ??
                0,
        },
    };

    /*
    |--------------------------------------------------------------------------
    | SUMMARY CARDS
    |--------------------------------------------------------------------------
    */

    const summaryCards = [
        {
            title: "CASH",

            value:
                formatCurrency(
                    safeSummary.cash.total
                ),

            count:
                safeSummary.cash.count,

            description:
                "Pembayaran tunai",

            icon:
                <IconCash />,

            gradient:
                "from-success-500 to-success-700",
        },

        {
            title: "QRIS",

            value:
                formatCurrency(
                    safeSummary.qris.total
                ),

            count:
                safeSummary.qris.count,

            description:
                "Pembayaran QRIS",

            icon:
                <IconQrcode />,

            gradient:
                "from-primary-500 to-primary-700",
        },

        {
            title: "PAY LATER",

            value:
                formatCurrency(
                    safeSummary.paylater.total
                ),

            count:
                safeSummary.paylater.count,

            description:
                "Pembayaran tertunda",

            icon:
                <IconClockHour6 />,

            gradient:
                "from-warning-500 to-warning-600",
        },

        {
            title: "TOTAL",

            value:
                formatCurrency(
                    safeSummary.total_payment
                ),

            count:
                safeSummary.total_transactions,

            description:
                "Seluruh transaksi",

            icon:
                <IconReceipt2 />,

            gradient:
                "from-slate-600 to-slate-800",
        },
    ];

    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Laporan Pembayaran" />

            <div className="space-y-6">

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">

                            <IconCreditCard
                                size={28}
                                className="text-primary-500"
                            />

                            Laporan Pembayaran

                        </h1>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Ringkasan dan detail pembayaran transaksi
                        </p>
                    </div>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={
                                exportExcel
                            }
                            disabled={
                                isExporting
                            }
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success-500 hover:bg-success-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
                        >
                            <IconFileSpreadsheet
                                size={18}
                            />

                            {isExporting
                                ? "Menyiapkan..."
                                : "Export Excel"}
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                setShowFilters(
                                    !showFilters
                                )
                            }
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                                showFilters ||
                                hasActiveFilters
                                    ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-950/50 dark:border-primary-800 dark:text-primary-400"
                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            }`}
                        >
                            <IconFilter
                                size={18}
                            />

                            Filter

                            {hasActiveFilters && (
                                <span className="w-2 h-2 rounded-full bg-primary-500" />
                            )}
                        </button>

                    </div>
                </div>

                {/* =====================================================
                    SUMMARY
                ===================================================== */}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                    {summaryCards.map(
                        (card) => (
                            <SummaryCard
                                key={
                                    card.title
                                }
                                {...card}
                            />
                        )
                    )}

                </div>

                {/* =====================================================
                    STATUS SUMMARY
                ===================================================== */}

                <div className="grid gap-4 sm:grid-cols-2">

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">

                        <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-success-100 dark:bg-success-900/30 flex items-center justify-center">

                                <IconCircleCheck
                                    size={22}
                                    className="text-success-600 dark:text-success-400"
                                />

                            </div>

                            <div>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Pembayaran Lunas
                                </p>

                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {
                                        safeSummary.paid.count
                                    }{" "}
                                    transaksi
                                </p>

                                <p className="text-sm text-success-600 dark:text-success-400">
                                    {formatCurrency(
                                        safeSummary
                                            .paid
                                            .total
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">

                        <div className="flex items-center gap-3">

                            <div className="w-10 h-10 rounded-xl bg-warning-100 dark:bg-warning-900/30 flex items-center justify-center">

                                <IconAlertCircle
                                    size={22}
                                    className="text-warning-600 dark:text-warning-400"
                                />

                            </div>

                            <div>

                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Belum Lunas
                                </p>

                                <p className="text-xl font-bold text-slate-900 dark:text-white">
                                    {
                                        safeSummary
                                            .unpaid
                                            .count
                                    }{" "}
                                    transaksi
                                </p>

                                <p className="text-sm text-warning-600 dark:text-warning-400">
                                    {formatCurrency(
                                        safeSummary
                                            .unpaid
                                            .total
                                    )}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* =====================================================
                    FILTER
                ===================================================== */}

                {showFilters && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">

                        <form
                            onSubmit={
                                applyFilters
                            }
                        >

                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                                {/* START DATE */}

                                <div>

                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Tanggal Mulai
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            filterData.start_date
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "start_date",
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                    />

                                </div>

                                {/* END DATE */}

                                <div>

                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Tanggal Akhir
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            filterData.end_date
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "end_date",
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                    />

                                </div>

                                {/* INVOICE */}

                                <div>

                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Invoice
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            filterData.invoice
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "invoice",
                                                e.target.value
                                            )
                                        }
                                        placeholder="Cari invoice..."
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                    />

                                </div>

                                {/* PAYMENT METHOD */}

                                <div>

                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Metode Pembayaran
                                    </label>

                                    <select
                                        value={
                                            filterData.payment_method
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "payment_method",
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                    >
                                        <option value="">
                                            Semua metode
                                        </option>

                                        <option value="cash">
                                            CASH
                                        </option>

                                        <option value="qris">
                                            QRIS
                                        </option>

                                        <option value="paylater">
                                            PAY LATER
                                        </option>

                                    </select>

                                </div>

                                {/* CASHIER */}

                                <InputSelect
                                    label="Kasir"
                                    data={
                                        cashiers
                                    }
                                    selected={
                                        selectedCashier
                                    }
                                    setSelected={
                                        handleSelectCashier
                                    }
                                    placeholder="Semua kasir"
                                    searchable
                                />

                                {/* CUSTOMER */}

                                <InputSelect
                                    label="Pelanggan"
                                    data={
                                        customers
                                    }
                                    selected={
                                        selectedCustomer
                                    }
                                    setSelected={
                                        handleSelectCustomer
                                    }
                                    placeholder="Semua pelanggan"
                                    searchable
                                />

                                {/* STATUS */}

                                <div>

                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Status
                                    </label>

                                    <select
                                        value={
                                            filterData.payment_status
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                "payment_status",
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
                                    >
                                        <option value="">
                                            Semua status
                                        </option>

                                        <option value="paid">
                                            LUNAS
                                        </option>

                                        <option value="unpaid">
                                            BELUM LUNAS
                                        </option>

                                        <option value="pending">
                                            PENDING
                                        </option>

                                        <option value="failed">
                                            GAGAL
                                        </option>

                                    </select>

                                </div>

                            </div>

                            <div className="flex justify-end gap-2 mt-5">

                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={
                                            resetFilters
                                        }
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        <IconX
                                            size={18}
                                        />

                                        Reset
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium"
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

                {/* =====================================================
                    TABLE
                ===================================================== */}

                {rows.length > 0 ? (

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead>

                                    <tr className="border-b border-slate-100 dark:border-slate-800">

                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                            No
                                        </th>

                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                            Invoice
                                        </th>

                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                            Tanggal
                                        </th>

                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                            Pelanggan
                                        </th>

                                        <th className="px-4 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                            Kasir
                                        </th>

                                        <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                            Metode
                                        </th>

                                        <th className="px-4 py-4 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                            Status
                                        </th>

                                        <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                            Total
                                        </th>

                                        <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                            Cash
                                        </th>

                                        <th className="px-4 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                                            Kembalian
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                                    {rows.map(
                                        (
                                            transaction,
                                            index
                                        ) => (

                                            <tr
                                                key={
                                                    transaction.id
                                                }
                                                className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >

                                                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {index +
                                                        1 +
                                                        (currentPage -
                                                            1) *
                                                            perPage}
                                                </td>

                                                <td className="px-4 py-4 text-sm font-semibold text-slate-900 dark:text-white">
                                                    {
                                                        transaction.invoice
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {
                                                        transaction.created_at
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {
                                                        transaction
                                                            .customer
                                                            ?.name ??
                                                        "Umum"
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                    {
                                                        transaction
                                                            .cashier
                                                            ?.name ??
                                                        "-"
                                                    }
                                                </td>

                                                <td className="px-4 py-4 text-center">

                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                            String(
                                                                transaction.payment_method ??
                                                                    ""
                                                            )
                                                                .toLowerCase()
                                                                .includes(
                                                                    "cash"
                                                                )
                                                                ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                                                                : String(
                                                                      transaction.payment_method ??
                                                                          ""
                                                                  )
                                                                      .toLowerCase()
                                                                      .includes(
                                                                          "qris"
                                                                      )
                                                                ? "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                                                                : "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400"
                                                        }`}
                                                    >
                                                        {paymentLabel(
                                                            transaction.payment_method
                                                        )}
                                                    </span>

                                                </td>

                                                <td className="px-4 py-4 text-center">

                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass(
                                                            transaction.payment_status
                                                        )}`}
                                                    >
                                                        {statusLabel(
                                                            transaction.payment_status
                                                        )}
                                                    </span>

                                                </td>

                                                <td className="px-4 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                                                    {formatCurrency(
                                                        transaction.grand_total
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-400">
                                                    {formatCurrency(
                                                        transaction.cash
                                                    )}
                                                </td>

                                                <td className="px-4 py-4 text-right text-sm text-slate-600 dark:text-slate-400">
                                                    {formatCurrency(
                                                        transaction.change
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </div>

                ) : (

                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">

                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">

                            <IconDatabaseOff
                                size={32}
                                className="text-slate-400"
                            />

                        </div>

                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">
                            Tidak Ada Data
                        </h3>

                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Tidak ada transaksi sesuai filter.
                        </p>

                    </div>

                )}

                {/* =====================================================
                    PAGINATION
                ===================================================== */}

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

Payments.layout = (page) => (
    <DashboardLayout children={page} />
);