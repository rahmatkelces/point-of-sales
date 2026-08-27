import React, {
    useEffect,
    useState,
} from "react";

import { router } from "@inertiajs/react";

import {
    IconClock,
    IconPlayerPlay,
    IconTrash,
    IconChevronDown,
    IconChevronUp,
    IconX,
} from "@tabler/icons-react";

import toast from "react-hot-toast";

/*
|--------------------------------------------------------------------------
| Format Rupiah
|--------------------------------------------------------------------------
*/

const formatPrice = (value = 0) => {
    return Number(value || 0).toLocaleString(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }
    );
};

/*
|--------------------------------------------------------------------------
| Get Pay Later Code
|--------------------------------------------------------------------------
|
| Contoh:
|
| PAYLATER-ABC123
| menjadi
| PL-ABC123
|
*/

const getPayLaterCode = (holdId) => {
    if (!holdId) {
        return "PL";
    }

    const value = String(holdId);

    if (value.startsWith("PAYLATER-")) {
        return `PL-${value.replace(
            "PAYLATER-",
            ""
        )}`;
    }

    if (value.startsWith("HOLD-")) {
        return `PL-${value.replace(
            "HOLD-",
            ""
        )}`;
    }

    return value;
};

/*
|--------------------------------------------------------------------------
| Format Date
|--------------------------------------------------------------------------
*/

const formatHeldAt = (value) => {
    if (!value) {
        return "";
    }

    try {
        return new Date(value).toLocaleString(
            "id-ID",
            {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    } catch {
        return "";
    }
};

/*
|--------------------------------------------------------------------------
| HeldTransactions
|--------------------------------------------------------------------------
|
| Menampilkan daftar Pay Later.
|
| Fitur:
|
| - Jumlah Pay Later
| - Total Pay Later
| - Kode Pay Later
| - Label / keterangan
| - Jumlah item
| - Total transaksi
| - Buka & Bayar
| - Hapus Pay Later
| - Mengirim label ke parent saat resume
|
*/

export default function HeldTransactions({
    heldCarts = [],
    hasActiveCart = false,
    onResume,
}) {
    const [
        isExpanded,
        setIsExpanded,
    ] = useState(false);

    const [
        resumingId,
        setResumingId,
    ] = useState(null);

    const [
        deletingId,
        setDeletingId,
    ] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | Tidak ada Pay Later
    |--------------------------------------------------------------------------
    */

    if (
        !heldCarts ||
        heldCarts.length === 0
    ) {
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Resume Pay Later
    |--------------------------------------------------------------------------
    */

    const handleResume = (hold) => {
        /*
        |--------------------------------------------------------------------------
        | Jangan resume kalau masih ada transaksi aktif
        |--------------------------------------------------------------------------
        */

        if (hasActiveCart) {
            toast.error(
                "Selesaikan atau tahan transaksi aktif terlebih dahulu"
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Validasi ID
        |--------------------------------------------------------------------------
        */

        if (!hold?.hold_id) {
            toast.error(
                "ID Pay Later tidak ditemukan"
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Ambil label
        |--------------------------------------------------------------------------
        |
        | Contoh:
        |
        | hold.label = "Meja 6"
        |
        | Maka:
        |
        | onResume("Meja 6")
        |
        */

        const lastLabel = String(
            hold?.label || ""
        ).trim();

        /*
        |--------------------------------------------------------------------------
        | Kirim label ke parent
        |--------------------------------------------------------------------------
        */

        if (
            typeof onResume === "function"
        ) {
            onResume(lastLabel);
        }

        /*
        |--------------------------------------------------------------------------
        | Loading
        |--------------------------------------------------------------------------
        */

        setResumingId(
            hold.hold_id
        );

        /*
        |--------------------------------------------------------------------------
        | Resume
        |--------------------------------------------------------------------------
        */

        router.post(
            route(
                "transactions.resume",
                hold.hold_id
            ),
            {},
            {
                preserveScroll: true,

                onSuccess: () => {
                    toast.success(
                        lastLabel
                            ? `Pay Later ${lastLabel} dibuka`
                            : "Pay Later dibuka"
                    );

                    setResumingId(null);

                    setIsExpanded(false);
                },

                onError: (errors) => {
                    toast.error(
                        errors?.message ||
                            "Gagal membuka transaksi Pay Later"
                    );

                    setResumingId(null);

                    /*
                    |--------------------------------------------------------------------------
                    | Resume gagal
                    |--------------------------------------------------------------------------
                    |
                    | Jangan biarkan label dari transaksi
                    | sebelumnya tertinggal.
                    |
                    */

                    if (
                        typeof onResume === "function"
                    ) {
                        onResume("");
                    }
                },

                onFinish: () => {
                    setResumingId(null);
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Pay Later
    |--------------------------------------------------------------------------
    */

    const handleDelete = (holdId) => {
        /*
        |--------------------------------------------------------------------------
        | Validasi
        |--------------------------------------------------------------------------
        */

        if (!holdId) {
            toast.error(
                "ID Pay Later tidak ditemukan"
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Konfirmasi
        |--------------------------------------------------------------------------
        */

        const confirmed =
            window.confirm(
                "Hapus transaksi Pay Later ini?\n\n" +
                    "Transaksi yang dihapus tidak dapat dikembalikan."
            );

        if (!confirmed) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Loading
        |--------------------------------------------------------------------------
        */

        setDeletingId(holdId);

        /*
        |--------------------------------------------------------------------------
        | Delete menggunakan Inertia
        |--------------------------------------------------------------------------
        |
        | Backend harus mengembalikan response Inertia,
        | contoh:
        |
        | return back()->with(
        |     'success',
        |     'Pay Later berhasil dihapus.'
        | | );
        |
        | JANGAN menggunakan:
        |
        | return response()->json(...)
        |
        */

        router.delete(
            route(
                "transactions.clearHold",
                holdId
            ),
            {
                preserveScroll: true,

                /*
                |--------------------------------------------------------------------------
                | BERHASIL DELETE
                |--------------------------------------------------------------------------
                |
                | Setelah backend berhasil menghapus Pay Later,
                | reload halaman agar heldCarts diambil ulang
                | dari session/backend.
                |
                */

                onSuccess: () => {
                    toast.success(
                        "Pay Later berhasil dihapus"
                    );

                    setDeletingId(null);

                    /*
                    |--------------------------------------------------------------------------
                    | Refresh halaman
                    |--------------------------------------------------------------------------
                    |
                    | Ini sengaja digunakan supaya Pay Later
                    | yang baru dihapus langsung hilang dari UI.
                    |
                    */

                    setTimeout(() => {
                        window.location.reload();
                    }, 300);
                },

                /*
                |--------------------------------------------------------------------------
                | DELETE ERROR
                |--------------------------------------------------------------------------
                */

                onError: (errors) => {
                    toast.error(
                        errors?.message ||
                            "Gagal menghapus transaksi Pay Later"
                    );

                    setDeletingId(null);
                },

                /*
                |--------------------------------------------------------------------------
                | FINISH
                |--------------------------------------------------------------------------
                */

                onFinish: () => {
                    setDeletingId(null);
                },
            }
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Total Pay Later
    |--------------------------------------------------------------------------
    */

    const totalHeldAmount =
        heldCarts.reduce(
            (sum, item) => {
                return (
                    sum +
                    Number(
                        item?.total || 0
                    )
                );
            },
            0
        );

    /*
    |--------------------------------------------------------------------------
    | COLLAPSED
    |--------------------------------------------------------------------------
    */

    if (!isExpanded) {
        return (
            <button
                type="button"
                onClick={() =>
                    setIsExpanded(true)
                }
                className="
                    w-full
                    px-3
                    py-2
                    flex
                    items-center
                    justify-between
                    bg-amber-50
                    dark:bg-amber-950/30
                    border-b
                    border-amber-200
                    dark:border-amber-800/50
                    hover:bg-amber-100
                    dark:hover:bg-amber-900/40
                    transition-colors
                "
            >
                <div className="flex items-center gap-2 min-w-0">
                    <div
                        className="
                            w-7
                            h-7
                            rounded-lg
                            bg-amber-500
                            flex
                            items-center
                            justify-center
                            text-white
                            text-xs
                            font-bold
                            flex-shrink-0
                        "
                    >
                        {heldCarts.length}
                    </div>

                    <div className="text-left min-w-0">
                        <div
                            className="
                                text-sm
                                font-semibold
                                text-amber-700
                                dark:text-amber-300
                            "
                        >
                            Pay Later
                        </div>

                        <div
                            className="
                                text-[11px]
                                text-amber-600
                                dark:text-amber-400
                            "
                        >
                            {heldCarts.length} transaksi
                            {" • "}
                            {formatPrice(
                                totalHeldAmount
                            )}
                        </div>
                    </div>
                </div>

                <IconChevronDown
                    size={17}
                    className="
                        text-amber-600
                        flex-shrink-0
                    "
                />
            </button>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | EXPANDED
    |--------------------------------------------------------------------------
    */

    return (
        <div
            className="
                border-b
                border-amber-200
                dark:border-amber-800/50
                bg-amber-50
                dark:bg-amber-950/30
            "
        >
            {/* HEADER */}

            <div
                className="
                    flex
                    items-center
                    justify-between
                    px-3
                    py-2
                    border-b
                    border-amber-200/50
                    dark:border-amber-800/30
                "
            >
                <div className="flex items-center gap-2">
                    <div
                        className="
                            w-7
                            h-7
                            rounded-lg
                            bg-amber-500
                            flex
                            items-center
                            justify-center
                            text-white
                            text-xs
                            font-bold
                        "
                    >
                        {heldCarts.length}
                    </div>

                    <div>
                        <div
                            className="
                                text-sm
                                font-semibold
                                text-amber-700
                                dark:text-amber-300
                            "
                        >
                            Pay Later
                        </div>

                        <div
                            className="
                                text-[10px]
                                text-amber-600
                                dark:text-amber-400
                            "
                        >
                            Transaksi belum dibayar
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setIsExpanded(false)
                    }
                    className="
                        w-7
                        h-7
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        hover:bg-amber-200
                        dark:hover:bg-amber-900/50
                    "
                >
                    <IconChevronUp
                        size={16}
                        className="text-amber-600"
                    />
                </button>
            </div>

            {/* LIST */}

            <div className="max-h-[240px] overflow-y-auto">
                {heldCarts.map((hold) => {
                    const payLaterCode =
                        getPayLaterCode(
                            hold?.hold_id
                        );

                    const label =
                        String(
                            hold?.label ||
                                "Umum"
                        ).trim();

                    return (
                        <div
                            key={hold.hold_id}
                            className="
                                px-3
                                py-3
                                border-b
                                border-amber-100/70
                                dark:border-amber-900/30
                                last:border-0
                            "
                        >
                            {/* INFORMATION */}

                            <div className="flex items-start gap-2">
                                {/* ICON */}

                                <div
                                    className="
                                        w-8
                                        h-8
                                        rounded-lg
                                        bg-amber-500
                                        text-white
                                        flex
                                        items-center
                                        justify-center
                                        flex-shrink-0
                                    "
                                >
                                    <IconClock
                                        size={16}
                                    />
                                </div>

                                {/* INFO */}

                                <div className="flex-1 min-w-0">
                                    {/* CODE */}

                                    <div
                                        className="
                                            flex
                                            items-center
                                            justify-between
                                            gap-2
                                        "
                                    >
                                        <p
                                            className="
                                                text-xs
                                                font-bold
                                                text-amber-800
                                                dark:text-amber-200
                                            "
                                        >
                                            {
                                                payLaterCode
                                            }
                                        </p>

                                        <span
                                            className="
                                                px-1.5
                                                py-0.5
                                                rounded
                                                bg-amber-200
                                                dark:bg-amber-900/60
                                                text-[9px]
                                                font-bold
                                                text-amber-800
                                                dark:text-amber-300
                                            "
                                        >
                                            BELUM DIBAYAR
                                        </span>
                                    </div>

                                    {/* LABEL */}

                                    <p
                                        className="
                                            mt-1
                                            text-xs
                                            font-semibold
                                            text-slate-700
                                            dark:text-slate-300
                                            truncate
                                        "
                                    >
                                        {label}
                                    </p>

                                    {/* DETAIL */}

                                    <div
                                        className="
                                            mt-1
                                            flex
                                            flex-wrap
                                            items-center
                                            gap-x-2
                                            gap-y-0.5
                                            text-[10px]
                                            text-amber-600
                                            dark:text-amber-400
                                        "
                                    >
                                        <span>
                                            {
                                                hold?.items_count ||
                                                0
                                            }{" "}
                                            item
                                        </span>

                                        <span>
                                            •
                                        </span>

                                        <span>
                                            {formatPrice(
                                                hold?.total ||
                                                    0
                                            )}
                                        </span>

                                        {hold?.held_at && (
                                            <>
                                                <span>
                                                    •
                                                </span>

                                                <span>
                                                    {formatHeldAt(
                                                        hold.held_at
                                                    )}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* ACTIONS */}

                            <div
                                className="
                                    flex
                                    gap-2
                                    mt-2
                                    ml-10
                                "
                            >
                                {/* BUKA & BAYAR */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleResume(
                                            hold
                                        )
                                    }
                                    disabled={
                                        resumingId ===
                                            hold.hold_id ||
                                        hasActiveCart
                                    }
                                    className="
                                        flex-1
                                        h-8
                                        rounded-lg
                                        bg-amber-500
                                        hover:bg-amber-600
                                        text-white
                                        text-xs
                                        font-semibold
                                        disabled:opacity-50
                                        flex
                                        items-center
                                        justify-center
                                        gap-1.5
                                        transition-colors
                                    "
                                    title={
                                        hasActiveCart
                                            ? "Selesaikan atau tahan transaksi aktif terlebih dahulu"
                                            : "Buka transaksi dan lakukan pembayaran"
                                    }
                                >
                                    {resumingId ===
                                    hold.hold_id ? (
                                        <div
                                            className="
                                                w-3
                                                h-3
                                                border-2
                                                border-white/30
                                                border-t-white
                                                rounded-full
                                                animate-spin
                                            "
                                        />
                                    ) : (
                                        <IconPlayerPlay
                                            size={13}
                                        />
                                    )}

                                    <span>
                                        Buka & Bayar
                                    </span>
                                </button>

                                {/* DELETE */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(
                                            hold.hold_id
                                        )
                                    }
                                    disabled={
                                        deletingId ===
                                        hold.hold_id
                                    }
                                    className="
                                        w-8
                                        h-8
                                        rounded-lg
                                        flex
                                        items-center
                                        justify-center
                                        text-amber-600
                                        hover:text-red-600
                                        hover:bg-red-50
                                        dark:hover:bg-red-950/30
                                        disabled:opacity-50
                                        transition-colors
                                    "
                                    title="Hapus Pay Later"
                                >
                                    {deletingId ===
                                    hold.hold_id ? (
                                        <div
                                            className="
                                                w-3
                                                h-3
                                                border-2
                                                border-amber-300
                                                border-t-amber-700
                                                rounded-full
                                                animate-spin
                                            "
                                        />
                                    ) : (
                                        <IconTrash
                                            size={14}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* FOOTER */}

            <div
                className="
                    px-3
                    py-2
                    border-t
                    border-amber-200/50
                    dark:border-amber-800/30
                    flex
                    items-center
                    justify-between
                "
            >
                <span
                    className="
                        text-[10px]
                        font-medium
                        text-amber-700
                        dark:text-amber-300
                    "
                >
                    Total Pay Later
                </span>

                <span
                    className="
                        text-xs
                        font-bold
                        text-amber-700
                        dark:text-amber-300
                    "
                >
                    {formatPrice(
                        totalHeldAmount
                    )}
                </span>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| HoldButton / Pay Later Button
|--------------------------------------------------------------------------
|
| Perilaku:
|
| 1. Belum ada label
|    -> klik Pay Later
|    -> muncul input
|
| 2. Resume "Meja 6"
|    -> lastLabel = "Meja 6"
|    -> klik Pay Later
|    -> langsung Pay Later Meja 6
|
*/

export function HoldButton({
    hasItems = false,
    onHold,
    isHolding = false,
    lastLabel = "",
    onLabelUsed,
}) {
    const [
        showLabelInput,
        setShowLabelInput,
    ] = useState(false);

    const [
        label,
        setLabel,
    ] = useState("");

    /*
    |--------------------------------------------------------------------------
    | Sync label dari parent
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const cleanLastLabel =
            String(
                lastLabel || ""
            ).trim();

        setLabel(cleanLastLabel);

        /*
        |--------------------------------------------------------------------------
        | Kalau ada label dari transaksi resume,
        | jangan tampilkan input.
        |--------------------------------------------------------------------------
        */

        if (cleanLastLabel) {
            setShowLabelInput(false);
        }
    }, [lastLabel]);

    /*
    |--------------------------------------------------------------------------
    | Handle Hold
    |--------------------------------------------------------------------------
    */

    const handleHold = () => {
        const cleanLabel =
            String(
                label || ""
            ).trim();

        /*
        |--------------------------------------------------------------------------
        | Simpan Pay Later
        |--------------------------------------------------------------------------
        */

        onHold(
            cleanLabel || null
        );

        /*
        |--------------------------------------------------------------------------
        | Tutup input
        |--------------------------------------------------------------------------
        */

        setShowLabelInput(false);

        /*
        |--------------------------------------------------------------------------
        | Reset input internal.
        |--------------------------------------------------------------------------
        |
        | Parent tetap harus mengosongkan lastLabel
        | setelah transaksi baru berhasil disimpan.
        |
        */

        setLabel("");

        /*
        |--------------------------------------------------------------------------
        | Beritahu parent bahwa label sudah digunakan.
        |--------------------------------------------------------------------------
        */

        if (
            typeof onLabelUsed ===
            "function"
        ) {
            onLabelUsed();
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Tidak ada item
    |--------------------------------------------------------------------------
    */

    if (!hasItems) {
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Sedang menyimpan Pay Later
    |--------------------------------------------------------------------------
    */

    if (isHolding) {
        return (
            <button
                type="button"
                disabled
                className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    w-full
                    py-2
                    px-3
                    rounded-lg
                    border
                    border-amber-300
                    dark:border-amber-700
                    text-amber-600
                    dark:text-amber-400
                    text-xs
                    font-semibold
                    opacity-60
                    cursor-not-allowed
                "
            >
                <div
                    className="
                        w-3.5
                        h-3.5
                        border-2
                        border-amber-300
                        border-t-amber-600
                        rounded-full
                        animate-spin
                    "
                />

                Menyimpan Pay Later...
            </button>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | LAST LABEL ADA
    |--------------------------------------------------------------------------
    |
    | Contoh:
    |
    | lastLabel = "Meja 6"
    |
    | Maka tombol:
    |
    | Pay Later Meja 6
    |
    | dan tidak perlu input lagi.
    |
    */

    const cleanLastLabel =
        String(
            lastLabel || ""
        ).trim();

    if (cleanLastLabel) {
        return (
            <button
                type="button"
                onClick={() => {
                    /*
                    |--------------------------------------------------------------------------
                    | Simpan menggunakan label terakhir.
                    |--------------------------------------------------------------------------
                    */

                    onHold(
                        cleanLastLabel
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Reset state lokal.
                    |--------------------------------------------------------------------------
                    */

                    setLabel("");

                    setShowLabelInput(
                        false
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | Beritahu parent bahwa label sudah digunakan.
                    |--------------------------------------------------------------------------
                    */

                    if (
                        typeof onLabelUsed ===
                        "function"
                    ) {
                        onLabelUsed();
                    }
                }}
                disabled={isHolding}
                className="
                    flex
                    items-center
                    justify-center
                    gap-1.5
                    w-full
                    py-2
                    px-3
                    rounded-lg
                    border
                    border-dashed
                    border-amber-400
                    dark:border-amber-700
                    text-amber-600
                    dark:text-amber-400
                    hover:bg-amber-50
                    dark:hover:bg-amber-950/30
                    text-xs
                    font-semibold
                    transition-colors
                    disabled:opacity-50
                "
                title={`Simpan kembali sebagai ${cleanLastLabel}`}
            >
                <IconClock
                    size={14}
                />

                <span>
                    Pay Later{" "}
                    {cleanLastLabel}
                </span>
            </button>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | INPUT LABEL
    |--------------------------------------------------------------------------
    */

    if (showLabelInput) {
        return (
            <div
                className="
                    p-2
                    rounded-xl
                    border
                    border-amber-200
                    dark:border-amber-800
                    bg-amber-50
                    dark:bg-amber-950/30
                "
            >
                {/* HEADER */}

                <div className="mb-2">
                    <p
                        className="
                            text-xs
                            font-semibold
                            text-amber-700
                            dark:text-amber-300
                        "
                    >
                        Simpan sebagai Pay Later
                    </p>

                    <p
                        className="
                            text-[10px]
                            text-amber-600
                            dark:text-amber-400
                            mt-0.5
                        "
                    >
                        Isi keterangan agar mudah
                        dicari nanti.
                    </p>
                </div>

                {/* INPUT */}

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={label}
                        onChange={(e) =>
                            setLabel(
                                e.target.value
                            )
                        }
                        placeholder="Contoh: Meja 6"
                        maxLength={50}
                        className="
                            flex-1
                            h-9
                            px-3
                            rounded-lg
                            border
                            border-slate-200
                            dark:border-slate-700
                            bg-white
                            dark:bg-slate-900
                            text-sm
                            outline-none
                            focus:ring-2
                            focus:ring-amber-500/20
                            focus:border-amber-500
                        "
                        autoFocus
                        onKeyDown={(e) => {
                            if (
                                e.key ===
                                "Enter"
                            ) {
                                e.preventDefault();

                                handleHold();
                            }

                            if (
                                e.key ===
                                "Escape"
                            ) {
                                e.preventDefault();

                                setLabel("");

                                setShowLabelInput(
                                    false
                                );
                            }
                        }}
                    />

                    {/* SIMPAN */}

                    <button
                        type="button"
                        onClick={
                            handleHold
                        }
                        disabled={
                            isHolding
                        }
                        className="
                            px-3
                            h-9
                            rounded-lg
                            bg-amber-500
                            hover:bg-amber-600
                            text-white
                            text-xs
                            font-semibold
                            disabled:opacity-50
                        "
                    >
                        Simpan
                    </button>

                    {/* CANCEL */}

                    <button
                        type="button"
                        onClick={() => {
                            setLabel("");

                            setShowLabelInput(
                                false
                            );
                        }}
                        className="
                            w-9
                            h-9
                            rounded-lg
                            flex
                            items-center
                            justify-center
                            hover:bg-slate-100
                            dark:hover:bg-slate-800
                        "
                    >
                        <IconX
                            size={15}
                            className="text-slate-500"
                        />
                    </button>
                </div>
            </div>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | DEFAULT PAY LATER BUTTON
    |--------------------------------------------------------------------------
    */

    return (
        <button
            type="button"
            onClick={() =>
                setShowLabelInput(
                    true
                )
            }
            disabled={isHolding}
            className="
                flex
                items-center
                justify-center
                gap-1.5
                w-full
                py-2
                px-3
                rounded-lg
                border
                border-dashed
                border-amber-400
                dark:border-amber-700
                text-amber-600
                dark:text-amber-400
                hover:bg-amber-50
                dark:hover:bg-amber-950/30
                text-xs
                font-semibold
                transition-colors
                disabled:opacity-50
            "
        >
            <IconClock
                size={14}
            />

            <span>
                Pay Later
            </span>
        </button>
    );
}