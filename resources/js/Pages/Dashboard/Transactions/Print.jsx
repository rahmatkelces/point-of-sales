import React, { useEffect, useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import {
    IconArrowLeft,
    IconPrinter,
    IconExternalLink,
    IconReceipt,
    IconFileInvoice,
} from "@tabler/icons-react";

import ThermalReceipt, {
    ThermalReceipt58mm,
} from "@/Components/Receipt/ThermalReceipt";

const formatPrice = (price = 0) =>
    Number(price || 0).toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    });

const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export default function Print({ transaction }) {
    const { store } = usePage().props;

    const [printMode, setPrintMode] = useState("invoice");

    const storeName =
        store?.name ||
        "Gemilang Mart";

    const storeAddress =
        store?.address ||
        "Ruko Sentra Danau Kemuning\n" +
            "Jl. Raya Tonjong - Sudimampir No. 7,\n" +
            "Cimanggis, Kec Bojonggede,\n" +
            "Kab Bogor, Jawa Barat 16920";

    const storePhone =
        store?.phone ||
        "0877-7568-1693";

    const storeLogo =
        store?.logo_url ||
        (store?.logo
            ? `/storage/${store.logo}`
            : null);

    const items =
        Array.isArray(transaction?.details)
            ? transaction.details
            : [];

    const paymentLabels = {
        cash: "Tunai",
        debit: "Debit",
        instantpay: "QRIS",
        qris: "QRIS",
        bank_transfer: "Transfer Bank",
        transfer: "Transfer Bank",
        ewallet: "E-Wallet",
        card: "Kartu",
        midtrans: "Midtrans",
        xendit: "Xendit",
    };

    const paymentMethodKey = String(
        transaction?.payment_method ||
            "cash"
    ).toLowerCase();

    const paymentMethodLabel =
        paymentLabels[paymentMethodKey] ??
        paymentMethodKey
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, (char) =>
                char.toUpperCase()
            );

    const paymentReference =
        transaction?.payment_reference ??
        transaction?.reference ??
        transaction?.gateway_reference ??
        transaction?.transaction_id ??
        transaction?.payment_transaction_id ??
        null;

    const paymentStatuses = {
        paid: "Lunas",
        lunas: "Lunas",
        pending: "Menunggu",
        menunggu: "Menunggu",
        failed: "Gagal",
        failure: "Gagal",
        expired: "Kedaluwarsa",
        expire: "Kedaluwarsa",
        cancelled: "Dibatalkan",
        canceled: "Dibatalkan",
    };

    const paymentStatusKey = String(
        transaction?.payment_status || ""
    ).toLowerCase();

    const paymentStatusLabel =
        paymentStatuses[paymentStatusKey] ??
        (
            paymentMethodKey === "cash" ||
            paymentMethodKey === "debit"
                ? "Lunas"
                : "Menunggu"
        );

    const statusColors = {
        paid:
            "bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-400",
        lunas:
            "bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-400",
        pending:
            "bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-400",
        menunggu:
            "bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-400",
        failed:
            "bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-400",
        failure:
            "bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-400",
        expired:
            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
        expire:
            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
        cancelled:
            "bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-400",
        canceled:
            "bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-400",
    };

    const paymentStatusColor =
        statusColors[paymentStatusKey] ??
        statusColors.paid;

    const isLocalPayment =
        paymentMethodKey === "cash" ||
        paymentMethodKey === "debit";

    const isInstantpay =
        paymentMethodKey === "instantpay" ||
        paymentMethodKey === "qris";

    const isNonCash = !isLocalPayment;

    const showPaymentLink =
        isNonCash &&
        Boolean(transaction?.payment_url);

    const subtotalBeforeDiscount =
        items.reduce(
            (sum, item) => {
                const qty =
                    Number(item?.qty) || 1;

                const unitPrice =
                    Number(item?.price) || 0;

                return (
                    sum +
                    qty * unitPrice
                );
            },
            0
        );

    const discount =
        Number(transaction?.discount) || 0;

    const grandTotal =
        Number(transaction?.grand_total) ||
        Math.max(
            0,
            subtotalBeforeDiscount -
                discount
        );

    /*
     * Penting:
     * Jangan pakai @page dari komponen Receipt.
     * Ukuran halaman ditentukan di file ini berdasarkan mode yang dipilih.
     */
    useEffect(() => {
        const root =
            document.documentElement;

        root.dataset.printMode =
            printMode;

        return () => {
            delete root.dataset.printMode;
        };
    }, [printMode]);

    const handlePrint = () => {
        document.documentElement.dataset.printMode =
            printMode;

        window.setTimeout(() => {
            window.print();
        }, 50);
    };

    return (
        <>
            <Head title="Invoice Penjualan" />

            <div className="print-page min-h-screen bg-slate-100 dark:bg-slate-950 py-8 px-4">
                <div className="print-container max-w-5xl mx-auto">

                    {/* ACTION BAR */}
                    <div className="print-controls flex flex-wrap items-center justify-between gap-3 mb-6">
                        <Link
                            href={route(
                                "transactions.index"
                            )}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <IconArrowLeft size={18} />
                            Kembali ke kasir
                        </Link>

                        <div className="flex items-center gap-2 flex-wrap justify-end">

                            {/* PRINT MODE */}
                            <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPrintMode(
                                            "invoice"
                                        )
                                    }
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                        printMode ===
                                        "invoice"
                                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                                    }`}
                                >
                                    <IconFileInvoice
                                        size={16}
                                        className="inline mr-1"
                                    />
                                    Invoice
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPrintMode(
                                            "thermal80"
                                        )
                                    }
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                        printMode ===
                                        "thermal80"
                                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                                    }`}
                                >
                                    <IconReceipt
                                        size={16}
                                        className="inline mr-1"
                                    />
                                    Struk 80mm
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setPrintMode(
                                            "thermal58"
                                        )
                                    }
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                                        printMode ===
                                        "thermal58"
                                            ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow"
                                            : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
                                    }`}
                                >
                                    <IconReceipt
                                        size={16}
                                        className="inline mr-1"
                                    />
                                    Struk 58mm
                                </button>
                            </div>

                            {showPaymentLink ? (
                                <a
                                    href={
                                        transaction.payment_url
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-primary-200 dark:border-primary-800 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 transition-colors"
                                >
                                    <IconExternalLink
                                        size={18}
                                    />
                                    Pembayaran
                                </a>
                            ) : null}

                            <button
                                type="button"
                                onClick={handlePrint}
                                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 transition-colors"
                            >
                                <IconPrinter size={18} />
                                Cetak
                            </button>
                        </div>
                    </div>

                    {/* ======================================================
                        THERMAL PREVIEW
                    ====================================================== */}
                    {(printMode === "thermal80" ||
                        printMode === "thermal58") && (
                        <div
                            className={`thermal-preview thermal-preview-${printMode}`}
                        >
                            <div className="thermal-preview-card">

                                {printMode ===
                                "thermal80" ? (
                                    <div className="print-target print-target-80">
                                        <ThermalReceipt
                                            transaction={
                                                transaction
                                            }
                                            storeName={
                                                storeName
                                            }
                                            storeAddress={
                                                storeAddress
                                            }
                                            storePhone={
                                                storePhone
                                            }
                                            storeLogo={
                                                storeLogo
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div className="print-target print-target-58">
                                        <ThermalReceipt58mm
                                            transaction={
                                                transaction
                                            }
                                            storeName={
                                                storeName
                                            }
                                            storeAddress={
                                                storeAddress
                                            }
                                            storePhone={
                                                storePhone
                                            }
                                            storeLogo={
                                                storeLogo
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ======================================================
                        INVOICE
                    ====================================================== */}
                    {printMode === "invoice" && (
                        <div className="invoice-view bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">

                            {/* HEADER */}
                            <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-6 text-white">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <IconReceipt size={24} />
                                            <span className="text-sm font-medium opacity-90">
                                                INVOICE
                                            </span>
                                        </div>

                                        <p className="text-2xl font-bold">
                                            {
                                                transaction?.invoice
                                            }
                                        </p>

                                        <p className="text-sm opacity-80 mt-1">
                                            {formatDateTime(
                                                transaction?.created_at
                                            )}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <span
                                            className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${paymentStatusColor}`}
                                        >
                                            {
                                                paymentStatusLabel
                                            }
                                        </span>

                                        <p className="text-sm opacity-80 mt-2">
                                            {
                                                paymentMethodLabel
                                            }
                                        </p>

                                        {isInstantpay &&
                                        paymentReference ? (
                                            <p className="text-xs opacity-70 mt-1 font-mono">
                                                Ref:{" "}
                                                {
                                                    paymentReference
                                                }
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {/* CUSTOMER + CASHIER */}
                            <div className="grid md:grid-cols-2 gap-6 px-6 py-6 border-b border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                                        Pelanggan
                                    </p>

                                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                                        {
                                            transaction?.customer?.name ??
                                            "Umum"
                                        }
                                    </p>

                                    {transaction?.customer
                                        ?.address ? (
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {
                                                transaction
                                                    .customer
                                                    .address
                                            }
                                        </p>
                                    ) : null}

                                    {transaction?.customer
                                        ?.phone ? (
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {
                                                transaction
                                                    .customer
                                                    .phone
                                            }
                                        </p>
                                    ) : null}
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                                        Kasir
                                    </p>

                                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                                        {
                                            transaction?.cashier?.name ??
                                            "-"
                                        }
                                    </p>
                                </div>
                            </div>

                            {/* ITEMS TABLE */}
                            <div className="px-6 py-6">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-100 dark:border-slate-800">
                                            <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                Produk
                                            </th>

                                            <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                Harga
                                            </th>

                                            <th className="pb-3 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                Qty
                                            </th>

                                            <th className="pb-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                                                Subtotal
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {items.map(
                                            (
                                                item,
                                                index
                                            ) => {
                                                const quantity =
                                                    Number(
                                                        item?.qty
                                                    ) ||
                                                    1;

                                                const unitPrice =
                                                    Number(
                                                        item?.price
                                                    ) ||
                                                    0;

                                                const subtotal =
                                                    unitPrice *
                                                    quantity;

                                                return (
                                                    <tr
                                                        key={
                                                            item?.id ??
                                                            index
                                                        }
                                                    >
                                                        <td className="py-3">
                                                            <p className="font-medium text-slate-900 dark:text-white">
                                                                {
                                                                    item
                                                                        ?.product
                                                                        ?.title ??
                                                                    item
                                                                        ?.product
                                                                        ?.name ??
                                                                    "-"
                                                                }
                                                            </p>

                                                            {item
                                                                ?.product
                                                                ?.barcode ? (
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                    {
                                                                        item
                                                                            .product
                                                                            .barcode
                                                                    }
                                                                </p>
                                                            ) : null}
                                                        </td>

                                                        <td className="py-3 text-right text-slate-600 dark:text-slate-400">
                                                            {formatPrice(
                                                                unitPrice
                                                            )}
                                                        </td>

                                                        <td className="py-3 text-center text-slate-600 dark:text-slate-400">
                                                            {
                                                                quantity
                                                            }
                                                        </td>

                                                        <td className="py-3 text-right font-semibold text-slate-900 dark:text-white">
                                                            {formatPrice(
                                                                subtotal
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* SUMMARY */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-6">
                                <div className="max-w-xs ml-auto space-y-2 text-sm">

                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>
                                            Subtotal
                                        </span>

                                        <span>
                                            {formatPrice(
                                                subtotalBeforeDiscount
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                        <span>
                                            Diskon
                                        </span>

                                        <span>
                                            -{" "}
                                            {formatPrice(
                                                discount
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-lg font-bold text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                                        <span>
                                            Total
                                        </span>

                                        <span>
                                            {formatPrice(
                                                grandTotal
                                            )}
                                        </span>
                                    </div>

                                    {/* CASH / DEBIT */}
                                    {isLocalPayment ? (
                                        <>
                                            <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-2">
                                                <span>
                                                    {paymentMethodKey ===
                                                    "cash"
                                                        ? "Tunai Dibayar"
                                                        : "Debit Dibayar"}
                                                </span>

                                                <span>
                                                    {formatPrice(
                                                        transaction?.cash ??
                                                            grandTotal
                                                    )}
                                                </span>
                                            </div>

                                            {paymentMethodKey ===
                                            "cash" ? (
                                                <div className="flex justify-between text-success-600 dark:text-success-400 font-medium">
                                                    <span>
                                                        Kembali
                                                    </span>

                                                    <span>
                                                        {formatPrice(
                                                            transaction?.change ??
                                                                0
                                                        )}
                                                    </span>
                                                </div>
                                            ) : null}
                                        </>
                                    ) : null}

                                    {/* INSTANTPAY */}
                                    {isInstantpay ? (
                                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                                <span>
                                                    Nominal Instantpay
                                                </span>

                                                <span>
                                                    {formatPrice(
                                                        grandTotal
                                                    )}
                                                </span>
                                            </div>

                                            {paymentReference ? (
                                                <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-400">
                                                    <span>
                                                        Reference
                                                    </span>

                                                    <span className="font-mono text-xs text-right text-slate-900 dark:text-white">
                                                        {
                                                            paymentReference
                                                        }
                                                    </span>
                                                </div>
                                            ) : null}

                                            <div className="flex justify-between text-success-600 dark:text-success-400 font-medium">
                                                <span>
                                                    Status Pembayaran
                                                </span>

                                                <span>
                                                    {
                                                        paymentStatusLabel
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    ) : null}

                                    {/* OTHER ONLINE PAYMENT */}
                                    {!isLocalPayment &&
                                    !isInstantpay ? (
                                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                                <span>
                                                    Metode Pembayaran
                                                </span>

                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    {
                                                        paymentMethodLabel
                                                    }
                                                </span>
                                            </div>

                                            <div className="flex justify-between text-slate-600 dark:text-slate-400">
                                                <span>
                                                    Status Pembayaran
                                                </span>

                                                <span className="font-semibold text-slate-900 dark:text-white">
                                                    {
                                                        paymentStatusLabel
                                                    }
                                                </span>
                                            </div>

                                            {paymentReference ? (
                                                <div className="flex justify-between gap-4 text-slate-600 dark:text-slate-400">
                                                    <span>
                                                        Reference
                                                    </span>

                                                    <span className="font-mono text-xs text-right text-slate-900 dark:text-white">
                                                        {
                                                            paymentReference
                                                        }
                                                    </span>
                                                </div>
                                            ) : null}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            {/* FOOTER */}
                            <div className="px-6 py-4 text-center border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    Terima kasih telah berbelanja
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ==============================================================
                PRINT CSS
               ============================================================== */}
            <style>{`
                .thermal-preview {
                    width: 100%;
                    display: flex;
                    justify-content: center;
                }

                .thermal-preview-card {
                    display: block;
                    width: auto;
                    padding: 16px;
                    background: #fff;
                    border: 1px solid rgb(226 232 240);
                    border-radius: 16px;
                    box-shadow:
                        0 20px 25px -5px rgb(15 23 42 / 0.10),
                        0 8px 10px -6px rgb(15 23 42 / 0.10);
                }

                .print-target {
                    display: block;
                    width: fit-content;
                    margin: 0 auto;
                    background: #fff;
                }

                .print-target-80 {
                    width: 80mm;
                    max-width: 80mm;
                }

                .print-target-58 {
                    width: 58mm;
                    max-width: 58mm;
                }

                /*
                 * Preview 58mm:
                 * receipt harus tetap benar-benar 58mm.
                 * Tidak boleh ada transform, scale, atau flex
                 * yang mengecilkan isi receipt.
                 */
                .thermal-preview-thermal58 .thermal-preview-card {
                    width: calc(58mm + 32px);
                }

                .thermal-preview-thermal80 .thermal-preview-card {
                    width: calc(80mm + 32px);
                }

                @media print {
                    @page {
                        margin: 0;
                    }

                    html,
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                        min-height: 0 !important;
                    }

                    body * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    .print-page,
                    .print-container {
                        width: auto !important;
                        max-width: none !important;
                        min-height: 0 !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                    }

                    .print-controls,
                    .invoice-view {
                        display: none !important;
                    }

                    .thermal-preview {
                        display: block !important;
                        width: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .thermal-preview-card {
                        display: block !important;
                        width: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: 0 !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        background: #fff !important;
                    }

                    .print-target {
                        display: block !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #fff !important;
                    }

                    .print-target-80 {
                        width: 80mm !important;
                        max-width: 80mm !important;
                    }

                    .print-target-58 {
                        width: 58mm !important;
                        max-width: 58mm !important;
                    }

                    html[data-print-mode="thermal80"]
                        .print-target-58 {
                        display: none !important;
                    }

                    html[data-print-mode="thermal58"]
                        .print-target-80 {
                        display: none !important;
                    }

                    html[data-print-mode="invoice"]
                        .thermal-preview {
                        display: none !important;
                    }

                    html[data-print-mode="thermal58"]
                        .thermal-receipt-58 {
                        width: 58mm !important;
                        max-width: 58mm !important;
                        margin: 0 !important;
                        padding: 2.5mm !important;
                        box-sizing: border-box !important;
                    }

                    html[data-print-mode="thermal80"]
                        .thermal-receipt-80 {
                        width: 80mm !important;
                        max-width: 80mm !important;
                        margin: 0 !important;
                        padding: 3mm !important;
                        box-sizing: border-box !important;
                    }

                    /*
                     * Named page tidak dipakai.
                     * Ini sengaja supaya Chrome tidak salah memilih
                     * page box ketika preview 58mm.
                     */
                }
            `}</style>
        </>
    );
}
