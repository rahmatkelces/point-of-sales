import { usePage } from "@inertiajs/react";

import {
    IconBox,
    IconBuildingStore,
    IconChartArrowsVertical,
    IconChartBarPopular,
    IconCirclePlus,
    IconClockHour6,
    IconCreditCard,
    IconFileCertificate,
    IconFolder,
    IconLayout2,
    IconPlus,
    IconShoppingCart,
    IconTable,
    IconUserBolt,
    IconUserShield,
    IconUsers,
    IconUsersPlus,
    IconWallet,
} from "@tabler/icons-react";

import hasAnyPermission from "./Permission";
import React from "react";

export default function Menu() {
    const { url } = usePage();

    const menuNavigation = [
        /*
        |--------------------------------------------------------------------------
        | Overview
        |--------------------------------------------------------------------------
        */

        {
            title: "Overview",

            details: [
                {
                    title: "Dashboard",

                    href: route("dashboard"),

                    active:
                        url === "/dashboard",

                    icon: (
                        <IconLayout2
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "dashboard-access",
                        ]),
                },
            ],
        },

        /*
        |--------------------------------------------------------------------------
        | Data Management
        |--------------------------------------------------------------------------
        */

        {
            title: "Data Management",

            details: [
                /*
                |--------------------------------------------------------------------------
                | Kategori
                |--------------------------------------------------------------------------
                */

                {
                    title: "Kategori",

                    href: route(
                        "categories.index"
                    ),

                    active:
                        url ===
                        "/dashboard/categories",

                    icon: (
                        <IconFolder
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "categories-access",
                        ]),
                },

                /*
                |--------------------------------------------------------------------------
                | Produk
                |--------------------------------------------------------------------------
                */

                {
                    title: "Produk",

                    href: route(
                        "products.index"
                    ),

                    active:
                        url.startsWith(
                            "/dashboard/products"
                        ),

                    icon: (
                        <IconBox
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "products-access",
                        ]),
                },

                /*
                |--------------------------------------------------------------------------
                | Extra Produk
                |--------------------------------------------------------------------------
                */

                {
                    title: "Extra Produk",

                    href: route(
                        "extras.index"
                    ),

                    active:
                        url.startsWith(
                            "/dashboard/extras"
                        ),

                    icon: (
                        <IconPlus
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "extras-access",
                        ]),
                },

                /*
                |--------------------------------------------------------------------------
                | Pelanggan
                |--------------------------------------------------------------------------
                */

                {
                    title: "Pelanggan",

                    href: route(
                        "customers.index"
                    ),

                    active:
                        url ===
                        "/dashboard/customers",

                    icon: (
                        <IconUsersPlus
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "customers-access",
                        ]),
                },
            ],
        },

        /*
        |--------------------------------------------------------------------------
        | Transaksi
        |--------------------------------------------------------------------------
        */

        {
            title: "Transaksi",

            details: [
                {
                    title: "Transaksi",

                    href: route(
                        "transactions.index"
                    ),

                    active:
                        url ===
                        "/dashboard/transactions",

                    icon: (
                        <IconShoppingCart
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "transactions-access",
                        ]),
                },

                {
                    title: "Riwayat Transaksi",

                    href: route(
                        "transactions.history"
                    ),

                    active:
                        url ===
                        "/dashboard/transactions/history",

                    icon: (
                        <IconClockHour6
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "transactions-access",
                        ]),
                },
            ],
        },

        /*
        |--------------------------------------------------------------------------
        | Laporan
        |--------------------------------------------------------------------------
        */

        {
            title: "Laporan",

            details: [
                /*
                |--------------------------------------------------------------------------
                | Laporan Penjualan
                |--------------------------------------------------------------------------
                */

                {
                    title: "Laporan Penjualan",

                    href: route(
                        "reports.sales.index"
                    ),

                    active:
                        url.startsWith(
                            "/dashboard/reports/sales"
                        ),

                    icon: (
                        <IconChartArrowsVertical
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "reports-access",
                        ]),
                },

                /*
                |--------------------------------------------------------------------------
                | Laporan Pembayaran
                |--------------------------------------------------------------------------
                */

                {
                    title: "Laporan Pembayaran",

                    href: route(
                        "reports.payments.index"
                    ),

                    active:
                        url.startsWith(
                            "/dashboard/reports/payments"
                        ),

                    icon: (
                        <IconCreditCard
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "reports-access",
                        ]),
                },

                /*
                |--------------------------------------------------------------------------
                | Laporan Keuntungan
                |--------------------------------------------------------------------------
                */

                {
                    title: "Laporan Keuntungan",

                    href: route(
                        "reports.profits.index"
                    ),

                    active:
                        url.startsWith(
                            "/dashboard/reports/profits"
                        ),

                    icon: (
                        <IconChartBarPopular
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "profits-access",
                        ]),
                },
            ],
        },

        /*
        |--------------------------------------------------------------------------
        | User Management
        |--------------------------------------------------------------------------
        */

        {
            title: "User Management",

            details: [
                {
                    title: "Hak Akses",

                    href: route(
                        "permissions.index"
                    ),

                    active:
                        url ===
                        "/dashboard/permissions",

                    icon: (
                        <IconUserBolt
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "permissions-access",
                        ]),
                },

                {
                    title: "Akses Group",

                    href: route(
                        "roles.index"
                    ),

                    active:
                        url ===
                        "/dashboard/roles",

                    icon: (
                        <IconUserShield
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "roles-access",
                        ]),
                },

                {
                    title: "Pengguna",

                    icon: (
                        <IconUsers
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "users-access",
                        ]),

                    subdetails: [
                        {
                            title: "Data Pengguna",

                            href: route(
                                "users.index"
                            ),

                            icon: (
                                <IconTable
                                    size={20}
                                    strokeWidth={1.5}
                                />
                            ),

                            active:
                                url ===
                                "/dashboard/users",

                            permissions:
                                hasAnyPermission([
                                    "users-access",
                                ]),
                        },

                        {
                            title:
                                "Tambah Data Pengguna",

                            href: route(
                                "users.create"
                            ),

                            icon: (
                                <IconCirclePlus
                                    size={20}
                                    strokeWidth={1.5}
                                />
                            ),

                            active:
                                url ===
                                "/dashboard/users/create",

                            permissions:
                                hasAnyPermission([
                                    "users-create",
                                ]),
                        },
                    ],
                },
            ],
        },

        /*
        |--------------------------------------------------------------------------
        | Pengaturan
        |--------------------------------------------------------------------------
        */

        {
            title: "Pengaturan",

            details: [
                /*
                |--------------------------------------------------------------------------
                | Payment Gateway
                |--------------------------------------------------------------------------
                */

                {
                    title: "Payment Gateway",

                    href: route(
                        "settings.payments.edit"
                    ),

                    active:
                        url ===
                        "/dashboard/settings/payments",

                    icon: (
                        <IconCreditCard
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "payment-settings-access",
                        ]),
                },

                /*
                |--------------------------------------------------------------------------
                | Konfigurasi Toko
                |--------------------------------------------------------------------------
                */

                {
                    title: "Konfigurasi Toko",

                    href: route(
                        "settings.store.edit"
                    ),

                    active:
                        url.startsWith(
                            "/dashboard/settings/store"
                        ),

                    icon: (
                        <IconBuildingStore
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "store-settings-access",
                        ]),
                },

                /*
                |--------------------------------------------------------------------------
                | Penarikan Dana
                |--------------------------------------------------------------------------
                */

                {
                    title: "Penarikan Dana",

                    href: route(
                        "withdrawals.index"
                    ),

                    active:
                        url.startsWith(
                            "/dashboard/withdrawals"
                        ),

                    icon: (
                        <IconWallet
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "withdrawals-access",
                        ]),
                },
            ],
        },

        /*
        |--------------------------------------------------------------------------
        | Promotions
        |--------------------------------------------------------------------------
        */

        {
            title: "Promotions",

            details: [
                {
                    title: "Promotions",

                    href: route(
                        "promotions.index"
                    ),

                    active:
                        url ===
                        "/dashboard/promotions",

                    icon: (
                        <IconFileCertificate
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "promotions-access",
                        ]),
                },

                {
                    title:
                        "Tambah Promotion",

                    href: route(
                        "promotions.create"
                    ),

                    active:
                        url ===
                        "/dashboard/promotions/create",

                    icon: (
                        <IconCirclePlus
                            size={20}
                            strokeWidth={1.5}
                        />
                    ),

                    permissions:
                        hasAnyPermission([
                            "promotions-create",
                        ]),
                },
            ],
        },
    ];

    return menuNavigation;
}