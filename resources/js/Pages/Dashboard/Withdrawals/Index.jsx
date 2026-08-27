import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Head,
    router,
    useForm,
    usePage,
} from "@inertiajs/react";

import {
    IconAlertCircle,
    IconArrowDown,
    IconBuildingBank,
    IconCash,
    IconChartBar,
    IconCheck,
    IconChevronDown,
    IconClock,
    IconDashboard,
    IconFileAnalytics,
    IconFilter,
    IconHistory,
    IconLoader2,
    IconMenu2,
    IconPackage,
    IconRefresh,
    IconReceipt,
    IconReportMoney,
    IconSettings,
    IconShoppingCart,
    IconUsers,
    IconUserShield,
    IconWallet,
    IconX,
    IconLogout,
    IconCategory,
} from "@tabler/icons-react";

import toast from "react-hot-toast";

/*
|--------------------------------------------------------------------------
| Format Rupiah
|--------------------------------------------------------------------------
*/

const formatPrice = (value = 0) => {
    return Number(value || 0).toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    });
};

/*
|--------------------------------------------------------------------------
| Format tanggal
|--------------------------------------------------------------------------
*/

const formatDate = (value) => {
    if (!value) {
        return "-";
    }

    try {
        return new Date(value).toLocaleString("id-ID", {
            dateStyle: "short",
            timeStyle: "short",
        });
    } catch {
        return value;
    }
};

/*
|--------------------------------------------------------------------------
| Status Badge
|--------------------------------------------------------------------------
*/

function StatusBadge({ status }) {
    const normalized = String(status || "").toLowerCase();

    if (
        normalized === "paid" ||
        normalized === "success" ||
        normalized === "successful"
    ) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                <IconCheck size={13} />
                Berhasil
            </span>
        );
    }

    if (
        normalized === "failed" ||
        normalized === "failure" ||
        normalized === "rejected"
    ) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
                Gagal
            </span>
        );
    }

    if (
        normalized === "approved" ||
        normalized === "processing" ||
        normalized === "pending"
    ) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                <IconClock size={13} />

                {normalized === "approved"
                    ? "Disetujui"
                    : normalized === "processing"
                    ? "Diproses"
                    : "Menunggu"}
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
            {status || "-"}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| Sidebar
|--------------------------------------------------------------------------
*/

function Sidebar({
    open,
    onClose,
}) {
    const { url, auth } = usePage().props;

    const currentUrl = String(url || window.location.pathname);

    const user =
        auth?.user ||
        {};

    const userName =
        user?.name ||
        "Rahmat Kelces";

    const userEmail =
        user?.email ||
        "admin@gmail.com";

    const isActive = (path) => {
        if (path === "/dashboard") {
            return (
                currentUrl === "/dashboard" ||
                currentUrl === "/dashboard/"
            );
        }

        return currentUrl.startsWith(path);
    };

    const navigate = (href) => {
        router.visit(href);
        onClose?.();
    };

    const menuItemClass = (active) =>
        [
            "group flex items-center gap-3 w-full",
            "px-3 py-2.5 rounded-lg",
            "text-sm font-medium",
            "transition-all duration-150",
            active
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        ].join(" ");

    const iconClass = (active) =>
        active
            ? "text-indigo-600"
            : "text-slate-500 group-hover:text-slate-700";

    return (
        <>
            {/* Mobile overlay */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={[
                    "fixed left-0 top-0 z-50",
                    "h-screen w-[240px]",
                    "bg-white border-r border-slate-200",
                    "flex flex-col",
                    "transition-transform duration-200",
                    "lg:translate-x-0",
                    open
                        ? "translate-x-0"
                        : "-translate-x-full",
                ].join(" ")}
            >
                {/* =====================================================
                    BRAND
                ====================================================== */}

                <div className="h-[62px] px-5 flex items-center border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                            <span className="font-bold text-sm">
                                K
                            </span>
                        </div>

                        <span className="text-lg font-extrabold tracking-tight text-slate-800">
                            KASIR
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-auto lg:hidden text-slate-500 hover:text-slate-800"
                    >
                        <IconX size={20} />
                    </button>
                </div>

                {/* =====================================================
                    USER
                ====================================================== */}

                <div className="px-4 py-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center text-sm font-bold shrink-0">
                            {String(userName)
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-800 truncate">
                                {userName}
                            </div>

                            <div className="text-xs text-slate-400 truncate">
                                {userEmail}
                            </div>
                        </div>
                    </div>
                </div>

                {/* =====================================================
                    MENU
                ====================================================== */}

                <div className="flex-1 overflow-y-auto px-3 py-4">

                    {/* OVERVIEW */}

                    <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Overview
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/dashboard")
                        }
                        className={menuItemClass(
                            isActive("/dashboard") &&
                                !isActive("/dashboard/categories") &&
                                !isActive("/dashboard/products") &&
                                !isActive("/dashboard/customers")
                        )}
                    >
                        <IconDashboard
                            size={19}
                            className={iconClass(
                                isActive("/dashboard") &&
                                    !isActive(
                                        "/dashboard/categories"
                                    ) &&
                                    !isActive(
                                        "/dashboard/products"
                                    ) &&
                                    !isActive(
                                        "/dashboard/customers"
                                    )
                            )}
                        />

                        <span>Dashboard</span>
                    </button>

                    {/* DATA MANAGEMENT */}

                    <div className="px-2 mt-5 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Data Management
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/dashboard/categories")
                        }
                        className={menuItemClass(
                            isActive(
                                "/dashboard/categories"
                            )
                        )}
                    >
                        <IconCategory
                            size={19}
                            className={iconClass(
                                isActive(
                                    "/dashboard/categories"
                                )
                            )}
                        />

                        <span>Kategori</span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/dashboard/products")
                        }
                        className={menuItemClass(
                            isActive(
                                "/dashboard/products"
                            )
                        )}
                    >
                        <IconPackage
                            size={19}
                            className={iconClass(
                                isActive(
                                    "/dashboard/products"
                                )
                            )}
                        />

                        <span>Produk</span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/dashboard/customers")
                        }
                        className={menuItemClass(
                            isActive(
                                "/dashboard/customers"
                            )
                        )}
                    >
                        <IconUsers
                            size={19}
                            className={iconClass(
                                isActive(
                                    "/dashboard/customers"
                                )
                            )}
                        />

                        <span>Pelanggan</span>
                    </button>

                    {/* TRANSAKSI */}

                    <div className="px-2 mt-5 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Transaksi
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/dashboard/transactions")
                        }
                        className={menuItemClass(
                            isActive(
                                "/dashboard/transactions"
                            ) &&
                                !isActive(
                                    "/dashboard/transactions/history"
                                )
                        )}
                    >
                        <IconShoppingCart
                            size={19}
                            className={iconClass(
                                isActive(
                                    "/dashboard/transactions"
                                ) &&
                                    !isActive(
                                        "/dashboard/transactions/history"
                                    )
                            )}
                        />

                        <span>Transaksi</span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/dashboard/transactions/history"
                            )
                        }
                        className={menuItemClass(
                            isActive(
                                "/dashboard/transactions/history"
                            )
                        )}
                    >
                        <IconHistory
                            size={19}
                            className={iconClass(
                                isActive(
                                    "/dashboard/transactions/history"
                                )
                            )}
                        />

                        <span>Riwayat Transaksi</span>
                    </button>

                    {/* LAPORAN */}

                    <div className="px-2 mt-5 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Laporan
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/dashboard/reports/sales"
                            )
                        }
                        className={menuItemClass(
                            isActive(
                                "/dashboard/reports/sales"
                            )
                        )}
                    >
                        <IconReportMoney
                            size={19}
                            className={iconClass(
                                isActive(
                                    "/dashboard/reports/sales"
                                )
                            )}
                        />

                        <span>Laporan Penjualan</span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/dashboard/reports/profit"
                            )
                        }
                        className={menuItemClass(
                            isActive(
                                "/dashboard/reports/profit"
                            )
                        )}
                    >
                        <IconChartBar
                            size={19}
                            className={iconClass(
                                isActive(
                                    "/dashboard/reports/profit"
                                )
                            )}
                        />

                        <span>Laporan Keuntungan</span>
                    </button>

                    {/* USER MANAGEMENT */}

                    <div className="px-2 mt-5 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        User Management
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/dashboard/access-rights"
                            )
                        }
                        className={menuItemClass(
                            isActive(
                                "/dashboard/access-rights"
                            )
                        )}
                    >
                        <IconUserShield
                            size={19}
                            className={iconClass(
                                isActive(
                                    "/dashboard/access-rights"
                                )
                            )}
                        />

                        <span>Hak Akses</span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/dashboard/access-groups"
                            )
                        }
                        className={menuItemClass(
                            isActive(
                                "/dashboard/access-groups"
                            )
                        )}
                    >
                        <IconUsers
                            size={19}
                            className={iconClass(
                                isActive(
                                    "/dashboard/access-groups"
                                )
                            )}
                        />

                        <span>Akses Group</span>
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/dashboard/users"
                            )
                        }
                        className={menuItemClass(
                            isActive(
                                "/dashboard/users"
                            )
                        )}
                    >
                        <IconUsers
                            size={19}
                            className={iconClass(
                                isActive(
                                    "/dashboard/users"
                                )
                            )}
                        />

                        <span>Pengguna</span>
                    </button>

                    {/* PENGATURAN */}

                    <div className="px-2 mt-5 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Pengaturan
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/dashboard/settings/payments"
                            )
                        }
                        className={menuItemClass(
                            isActive(
                                "/dashboard/settings/payments"
                            )
                        )}
                    >
                        <IconReceipt
                            size={19}
                            className={iconClass(
                                isActive(
                                    "/dashboard/settings/payments"
                                )
                            )}
                        />

                        <span>Payment Gateway</span>
                    </button>

                    {/* PENARIKAN DANA */}

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/dashboard/withdrawals"
                            )
                        }
                        className={menuItemClass(
                            isActive(
                                "/dashboard/withdrawals"
                            )
                        )}
                    >
                        <IconWallet
                            size={19}
                            className={iconClass(
                                isActive(
                                    "/dashboard/withdrawals"
                                )
                            )}
                        />

                        <span>Penarikan Dana</span>
                    </button>

                </div>

                {/* =====================================================
                    FOOTER SIDEBAR
                ====================================================== */}

                <div className="border-t border-slate-100 px-3 py-3">
                    <button
                        type="button"
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        onClick={() => {
                            router.post(
                                "/logout"
                            );
                        }}
                    >
                        <IconSettings size={19} />

                        <span>Pengaturan</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Main
|--------------------------------------------------------------------------
*/

export default function WithdrawalIndex({
    balance = {},
    balanceError = null,
    withdrawals = [],
    withdrawalConfig = {},
}) {
    const { flash, errors } =
        usePage().props;

    /*
    |--------------------------------------------------------------------------
    | Sidebar
    |--------------------------------------------------------------------------
    */

    const [sidebarOpen, setSidebarOpen] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Balance
    |--------------------------------------------------------------------------
    */

    const availableBalance =
        Number(balance?.balance || 0);

    const minimum =
        Number(
            withdrawalConfig?.minimum ||
                25000
        );

    const feePercent =
        Number(
            withdrawalConfig?.fee_percent ||
                1
        );

    const feeFixed =
        Number(
            withdrawalConfig?.fee_fixed ||
                4000
        );

    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [amount, setAmount] =
        useState("");

    const [refreshing, setRefreshing] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const {
        processing,
        post,
        reset,
        setData,
    } = useForm({
        amount: "",
    });

    /*
    |--------------------------------------------------------------------------
    | Flash Message
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (flash?.success) {
            toast.success(
                flash.success
            );
        }
    }, [flash?.success]);

    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (errors?.amount) {
            toast.error(
                errors.amount
            );
        }
    }, [errors?.amount]);

    /*
    |--------------------------------------------------------------------------
    | Estimasi Fee
    |--------------------------------------------------------------------------
    */

    const calculation =
        useMemo(() => {
            const numericAmount =
                Number(
                    String(amount)
                        .replace(/\D/g, "")
                ) || 0;

            if (
                numericAmount <= 0
            ) {
                return {
                    amount: 0,
                    fee: 0,
                    received: 0,
                };
            }

            const percentFee =
                Math.floor(
                    (numericAmount *
                        feePercent) /
                        100
                );

            const fee =
                percentFee +
                feeFixed;

            const received =
                Math.max(
                    numericAmount -
                        fee,
                    0
                );

            return {
                amount:
                    numericAmount,
                fee,
                received,
            };
        }, [
            amount,
            feePercent,
            feeFixed,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Input nominal
    |--------------------------------------------------------------------------
    */

    const handleAmountChange = (
        event
    ) => {
        const raw =
            event.target.value.replace(
                /\D/g,
                ""
            );

        setAmount(raw);

        setData(
            "amount",
            raw
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Submit Withdrawal
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (
        event
    ) => {
        event.preventDefault();

        const numericAmount =
            Number(amount || 0);

        if (
            numericAmount <
            minimum
        ) {
            toast.error(
                `Minimal penarikan ${formatPrice(
                    minimum
                )}.`
            );

            return;
        }

        if (
            numericAmount >
            availableBalance
        ) {
            toast.error(
                "Saldo tidak cukup."
            );

            return;
        }

        const confirmed =
            window.confirm(
                `Tarik ${formatPrice(
                    numericAmount
                )}?\n\n` +
                    `Estimasi biaya: ${formatPrice(
                        calculation.fee
                    )}\n` +
                    `Estimasi diterima: ${formatPrice(
                        calculation.received
                    )}`
            );

        if (!confirmed) {
            return;
        }

        post(
            route(
                "withdrawals.store"
            ),
            {
                preserveScroll: true,

                onSuccess: () => {
                    setAmount("");

                    reset();

                    toast.success(
                        "Penarikan berhasil diajukan."
                    );
                },

                onError: (
                    formErrors
                ) => {
                    toast.error(
                        formErrors?.amount ||
                            "Penarikan gagal."
                    );
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Refresh saldo
    |--------------------------------------------------------------------------
    */

    const refreshBalance = () => {
        setRefreshing(true);

        router.reload({
            only: [
                "balance",
                "balanceError",
                "withdrawals",
            ],

            preserveState: true,
            preserveScroll: true,

            onFinish: () => {
                setRefreshing(false);
            },

            onSuccess: () => {
                toast.success(
                    "Saldo berhasil diperbarui."
                );
            },

            onError: () => {
                toast.error(
                    "Gagal memperbarui saldo."
                );
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Quick Amount
    |--------------------------------------------------------------------------
    */

    const setQuickAmount = (
        value
    ) => {
        const finalValue =
            Math.min(
                Number(value),
                availableBalance
            );

        const raw =
            String(
                Math.floor(
                    finalValue
                )
            );

        setAmount(raw);

        setData(
            "amount",
            raw
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Penarikan Dana" />

            <div className="min-h-screen bg-[#f4f7fb] text-slate-900">

                {/* =====================================================
                    SIDEBAR
                ====================================================== */}

                <Sidebar
                    open={sidebarOpen}
                    onClose={() =>
                        setSidebarOpen(false)
                    }
                />

                {/* =====================================================
                    MAIN AREA
                ====================================================== */}

                <div className="lg:pl-[240px] min-h-screen">

                    {/* =================================================
                        TOPBAR
                    ================================================== */}

                    <header className="h-[62px] bg-white border-b border-slate-200 sticky top-0 z-30">

                        <div className="h-full px-4 lg:px-6 flex items-center">

                            <button
                                type="button"
                                onClick={() =>
                                    setSidebarOpen(
                                        true
                                    )
                                }
                                className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
                            >
                                <IconMenu2
                                    size={21}
                                />
                            </button>

                            <div className="hidden lg:flex items-center gap-3">

                                <button
                                    type="button"
                                    className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
                                    onClick={() =>
                                        setSidebarOpen(
                                            true
                                        )
                                    }
                                >
                                    <IconMenu2
                                        size={20}
                                    />
                                </button>

                                <div className="h-7 w-px bg-slate-200" />

                                <span className="text-sm font-semibold text-slate-800">
                                    Penarikan Dana
                                </span>

                            </div>

                            <div className="ml-auto flex items-center gap-3">

                                <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-full bg-indigo-50 text-indigo-600">
                                    <IconWallet
                                        size={18}
                                    />
                                </div>

                                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                    {String(
                                        usePage()
                                            .props
                                            ?.auth
                                            ?.user
                                            ?.name ||
                                            "RK"
                                    )
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>

                            </div>

                        </div>

                    </header>

                    {/* =================================================
                        CONTENT
                    ================================================== */}

                    <main className="p-4 md:p-6 lg:p-7">

                        <div className="max-w-[1200px] mx-auto">

                            {/* =================================================
                                HEADER
                            ================================================== */}

                            <div className="mb-6">

                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                                    <div>

                                        <div className="flex items-center gap-3">

                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                                <IconWallet
                                                    size={
                                                        21
                                                    }
                                                />
                                            </div>

                                            <div>

                                                <div className="flex items-center gap-2">

                                                    <h1 className="text-2xl font-bold text-slate-900">
                                                        Penarikan Dana
                                                    </h1>

                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />

                                                        LIVE
                                                    </span>

                                                </div>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    Tarik saldo InstantPay langsung ke rekening tersimpan
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    <button
                                        type="button"
                                        onClick={
                                            refreshBalance
                                        }
                                        disabled={
                                            refreshing
                                        }
                                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50"
                                    >
                                        <IconRefresh
                                            size={17}
                                            className={
                                                refreshing
                                                    ? "animate-spin"
                                                    : ""
                                            }
                                        />

                                        Perbarui Saldo
                                    </button>

                                </div>

                            </div>

                            {/* =================================================
                                ERROR SALDO
                            ================================================== */}

                            {balanceError && (
                                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">

                                    <IconAlertCircle
                                        size={20}
                                        className="text-red-600 mt-0.5"
                                    />

                                    <div>

                                        <p className="font-semibold text-red-800">
                                            Gagal mengambil saldo
                                        </p>

                                        <p className="text-sm text-red-700 mt-0.5">
                                            {balanceError}
                                        </p>

                                    </div>

                                </div>
                            )}

                            {/* =================================================
                                SALDO CARD
                            ================================================== */}

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

                                <div className="lg:col-span-2 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white p-6 shadow-lg">

                                    <div className="flex items-start justify-between">

                                        <div>

                                            <div className="flex items-center gap-2 text-indigo-100">

                                                <IconWallet
                                                    size={19}
                                                />

                                                <span className="text-sm font-medium">
                                                    Saldo InstantPay
                                                </span>

                                            </div>

                                            <div className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight">
                                                {formatPrice(
                                                    availableBalance
                                                )}
                                            </div>

                                            <div className="mt-2 text-sm text-indigo-100">
                                                Saldo live dari InstantPay
                                            </div>

                                        </div>

                                        <div className="px-3 py-1.5 rounded-full bg-white/15 text-xs font-bold">
                                            {balance?.mode
                                                ? String(
                                                      balance.mode
                                                  ).toUpperCase()
                                                : "LIVE"}
                                        </div>

                                    </div>

                                </div>

                                <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">

                                    <div className="flex items-center gap-2 text-slate-500">

                                        <IconCash
                                            size={19}
                                        />

                                        <span className="text-sm font-medium">
                                            Minimal Penarikan
                                        </span>

                                    </div>

                                    <div className="mt-4 text-2xl font-bold text-slate-900">
                                        {formatPrice(
                                            minimum
                                        )}
                                    </div>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Biaya estimasi:{" "}
                                        {feePercent}% +{" "}
                                        {formatPrice(
                                            feeFixed
                                        )}
                                    </p>

                                </div>

                            </div>

                            {/* =================================================
                                MAIN CONTENT
                            ================================================== */}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                                {/* =================================================
                                    WITHDRAW FORM
                                ================================================== */}

                                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm">

                                    <div className="p-6 border-b border-slate-100">

                                        <h2 className="text-lg font-bold text-slate-900">
                                            Ajukan Penarikan
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Dana akan dikirim ke rekening tersimpan di InstantPay.
                                        </p>

                                    </div>

                                    <form
                                        onSubmit={
                                            handleSubmit
                                        }
                                        className="p-6"
                                    >

                                        {/* SALDO */}

                                        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 mb-5">

                                            <div className="flex items-center justify-between">

                                                <span className="text-sm text-slate-500">
                                                    Saldo tersedia
                                                </span>

                                                <span className="font-bold text-slate-900">
                                                    {formatPrice(
                                                        availableBalance
                                                    )}
                                                </span>

                                            </div>

                                        </div>

                                        {/* INPUT */}

                                        <label className="block">

                                            <span className="block text-sm font-semibold text-slate-700 mb-2">
                                                Jumlah Penarikan
                                            </span>

                                            <div className="relative">

                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                                    Rp
                                                </span>

                                                <input
                                                    type="text"
                                                    inputMode="numeric"
                                                    value={
                                                        amount
                                                            ? Number(
                                                                  amount
                                                              ).toLocaleString(
                                                                  "id-ID"
                                                              )
                                                            : ""
                                                    }
                                                    onChange={
                                                        handleAmountChange
                                                    }
                                                    placeholder="0"
                                                    disabled={
                                                        processing
                                                    }
                                                    className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-lg font-semibold outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                                                />

                                            </div>

                                        </label>

                                        {/* QUICK BUTTON */}

                                        <div className="mt-3 flex flex-wrap gap-2">

                                            {[
                                                25000,
                                                50000,
                                                100000,
                                            ]
                                                .filter(
                                                    (
                                                        value
                                                    ) =>
                                                        value <=
                                                        availableBalance
                                                )
                                                .map(
                                                    (
                                                        value
                                                    ) => (
                                                        <button
                                                            key={
                                                                value
                                                            }
                                                            type="button"
                                                            onClick={() =>
                                                                setQuickAmount(
                                                                    value
                                                                )
                                                            }
                                                            disabled={
                                                                processing
                                                            }
                                                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                                        >
                                                            {formatPrice(
                                                                value
                                                            )}
                                                        </button>
                                                    )
                                                )}

                                            {availableBalance >=
                                                minimum && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setQuickAmount(
                                                            availableBalance
                                                        )
                                                    }
                                                    disabled={
                                                        processing
                                                    }
                                                    className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 disabled:opacity-50"
                                                >
                                                    Semua Saldo
                                                </button>
                                            )}

                                        </div>

                                        {/* CALCULATION */}

                                        {calculation.amount >
                                            0 && (
                                            <div className="mt-5 rounded-xl border border-slate-200 overflow-hidden">

                                                <div className="px-4 py-3 flex justify-between text-sm">

                                                    <span className="text-slate-500">
                                                        Jumlah
                                                    </span>

                                                    <span className="font-semibold text-slate-900">
                                                        {formatPrice(
                                                            calculation.amount
                                                        )}
                                                    </span>

                                                </div>

                                                <div className="px-4 py-3 flex justify-between text-sm border-t border-slate-100">

                                                    <span className="text-slate-500">
                                                        Estimasi biaya
                                                    </span>

                                                    <span className="font-semibold text-red-600">
                                                        -{" "}
                                                        {formatPrice(
                                                            calculation.fee
                                                        )}
                                                    </span>

                                                </div>

                                                <div className="px-4 py-4 flex justify-between border-t border-slate-100 bg-slate-50">

                                                    <span className="font-bold text-slate-700">
                                                        Estimasi diterima
                                                    </span>

                                                    <span className="font-extrabold text-lg text-indigo-600">
                                                        {formatPrice(
                                                            calculation.received
                                                        )}
                                                    </span>

                                                </div>

                                            </div>
                                        )}

                                        {/* BUTTON */}

                                        <button
                                            type="submit"
                                            disabled={
                                                processing ||
                                                availableBalance <
                                                    minimum ||
                                                !amount
                                            }
                                            className="mt-5 w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold shadow-lg shadow-indigo-500/20 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >

                                            {processing ? (
                                                <>
                                                    <IconLoader2
                                                        size={
                                                            19
                                                        }
                                                        className="animate-spin"
                                                    />

                                                    Memproses...
                                                </>
                                            ) : (
                                                <>
                                                    <IconArrowDown
                                                        size={
                                                            19
                                                        }
                                                    />

                                                    Ajukan Penarikan
                                                </>
                                            )}

                                        </button>

                                        <p className="mt-3 text-center text-xs text-slate-400">
                                            Rekening tujuan dikelola dari dashboard InstantPay.
                                        </p>

                                    </form>

                                </div>

                                {/* =================================================
                                    REKENING TUJUAN
                                ================================================== */}

                                <div className="rounded-2xl bg-white border border-slate-200 shadow-sm">

                                    <div className="p-6 border-b border-slate-100">

                                        <div className="flex items-center gap-2">

                                            <IconBuildingBank
                                                size={20}
                                                className="text-indigo-600"
                                            />

                                            <h2 className="text-lg font-bold text-slate-900">
                                                Rekening Tujuan
                                            </h2>

                                        </div>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Rekening tersimpan pada akun InstantPay.
                                        </p>

                                    </div>

                                    <div className="p-6">

                                        <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-5">

                                            <div className="flex items-center gap-3">

                                                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center">
                                                    <IconBuildingBank
                                                        size={
                                                            23
                                                        }
                                                        className="text-indigo-600"
                                                    />
                                                </div>

                                                <div>

                                                    <p className="font-bold text-indigo-900">
                                                        Rekening tersimpan
                                                    </p>

                                                    <p className="text-sm text-indigo-700 mt-0.5">
                                                        Digunakan otomatis oleh InstantPay
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                        <div className="mt-5 space-y-3 text-sm">

                                            <div className="flex justify-between gap-4">

                                                <span className="text-slate-500">
                                                    Minimum penarikan
                                                </span>

                                                <span className="font-semibold text-slate-900">
                                                    {formatPrice(
                                                        minimum
                                                    )}
                                                </span>

                                            </div>

                                            <div className="flex justify-between gap-4">

                                                <span className="text-slate-500">
                                                    Biaya estimasi
                                                </span>

                                                <span className="font-semibold text-slate-900">
                                                    {feePercent}% +{" "}
                                                    {formatPrice(
                                                        feeFixed
                                                    )}
                                                </span>

                                            </div>

                                            <div className="pt-3 border-t border-slate-100">

                                                <p className="text-xs text-slate-500 leading-5">
                                                    Nomor rekening tidak dikirim dari aplikasi Laravel. InstantPay menggunakan rekening tersimpan yang telah dikunci di dashboard.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                RIWAYAT
                            ================================================== */}

                            <div className="mt-5 rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">

                                <div className="p-6 border-b border-slate-100">

                                    <div className="flex items-center justify-between">

                                        <div>

                                            <h2 className="text-lg font-bold text-slate-900">
                                                Riwayat Penarikan
                                            </h2>

                                            <p className="mt-1 text-sm text-slate-500">
                                                Data diambil langsung dari InstantPay.
                                            </p>

                                        </div>

                                        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                                            <IconHistory
                                                size={16}
                                            />

                                            Riwayat
                                        </div>

                                    </div>

                                </div>

                                <div className="overflow-x-auto">

                                    <table className="w-full text-sm">

                                        <thead>

                                            <tr className="border-b border-slate-100 bg-slate-50">

                                                <th className="text-left px-6 py-3 font-semibold text-slate-500">
                                                    ID
                                                </th>

                                                <th className="text-right px-6 py-3 font-semibold text-slate-500">
                                                    JUMLAH
                                                </th>

                                                <th className="text-right px-6 py-3 font-semibold text-slate-500">
                                                    BIAYA
                                                </th>

                                                <th className="text-right px-6 py-3 font-semibold text-slate-500">
                                                    DITERIMA
                                                </th>

                                                <th className="text-left px-6 py-3 font-semibold text-slate-500">
                                                    TUJUAN
                                                </th>

                                                <th className="text-left px-6 py-3 font-semibold text-slate-500">
                                                    STATUS
                                                </th>

                                                <th className="text-left px-6 py-3 font-semibold text-slate-500">
                                                    WAKTU
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {Array.isArray(
                                                withdrawals
                                            ) &&
                                            withdrawals.length >
                                                0 ? (
                                                withdrawals.map(
                                                    (
                                                        item,
                                                        index
                                                    ) => (
                                                        <tr
                                                            key={
                                                                item.id ??
                                                                item.reference ??
                                                                index
                                                            }
                                                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                                                        >

                                                            <td className="px-6 py-4">

                                                                <div className="font-semibold text-slate-900">
                                                                    #
                                                                    {item.id ??
                                                                        "-"}
                                                                </div>

                                                                {item.ref && (
                                                                    <div className="text-xs text-slate-400 mt-0.5">
                                                                        {
                                                                            item.ref
                                                                        }
                                                                    </div>
                                                                )}

                                                            </td>

                                                            <td className="px-6 py-4 text-right font-semibold text-slate-900">
                                                                {formatPrice(
                                                                    item.amount
                                                                )}
                                                            </td>

                                                            <td className="px-6 py-4 text-right text-red-600">
                                                                {formatPrice(
                                                                    item.fee
                                                                )}
                                                            </td>

                                                            <td className="px-6 py-4 text-right font-bold text-emerald-600">
                                                                {formatPrice(
                                                                    item.transfer_amount ??
                                                                        Number(
                                                                            item.amount ||
                                                                                0
                                                                        ) -
                                                                            Number(
                                                                                item.fee ||
                                                                                    0
                                                                            )
                                                                )}
                                                            </td>

                                                            <td className="px-6 py-4">

                                                                <div className="font-semibold text-slate-700">
                                                                    {
                                                                        item.bank
                                                                    }
                                                                </div>

                                                                <div className="text-xs text-slate-400">
                                                                    {
                                                                        item.account_number
                                                                    }
                                                                </div>

                                                            </td>

                                                            <td className="px-6 py-4">

                                                                <StatusBadge
                                                                    status={
                                                                        item.status
                                                                    }
                                                                />

                                                            </td>

                                                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                                                {formatDate(
                                                                    item.created_at ??
                                                                        item.createdAt
                                                                )}
                                                            </td>

                                                        </tr>
                                                    )
                                                )
                                            ) : (
                                                <tr>

                                                    <td
                                                        colSpan="7"
                                                        className="px-6 py-12 text-center"
                                                    >

                                                        <div className="flex flex-col items-center">

                                                            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                                                                <IconWallet
                                                                    size={
                                                                        22
                                                                    }
                                                                    className="text-slate-400"
                                                                />
                                                            </div>

                                                            <p className="font-semibold text-slate-700">
                                                                Belum ada penarikan
                                                            </p>

                                                            <p className="text-sm text-slate-400 mt-1">
                                                                Riwayat penarikan akan muncul di sini.
                                                            </p>

                                                        </div>

                                                    </td>

                                                </tr>
                                            )}

                                        </tbody>

                                    </table>

                                </div>

                            </div>

                        </div>

                    </main>

                </div>

            </div>
        </>
    );
}