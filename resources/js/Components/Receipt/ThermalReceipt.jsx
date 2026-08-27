import React from "react";
import { usePage } from "@inertiajs/react";

const num = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

const formatPrice = (value = 0) =>
    `Rp ${Math.round(num(value)).toLocaleString("id-ID")}`;

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const getExtras = (item) => {
    let extras =
        item?.extras ??
        item?.extra_items ??
        item?.cart_extras ??
        item?.transaction_detail_extras ??
        item?.transactionDetailExtras ??
        [];

    if (typeof extras === "string") {
        try {
            extras = JSON.parse(extras);
        } catch {
            return [];
        }
    }

    if (!Array.isArray(extras)) {
        return [];
    }

    /*
     * Laravel TransactionDetailExtra biasanya mempunyai:
     * {
     *   qty,
     *   price,
     *   extra: {
     *      id,
     *      name,
     *      price
     *   }
     * }
     *
     * Normalisasi dilakukan di frontend supaya semua bentuk response
     * tetap bisa dicetak.
     */
    return extras
        .filter(Boolean)
        .map((extra) => ({
            ...extra,
            id: extra?.id ?? extra?.extra?.id,
            name:
                extra?.name ??
                extra?.extra?.name ??
                extra?.extra?.title ??
                "Extra",
            price:
                extra?.price ??
                extra?.extra?.price ??
                extra?.extra?.sell_price ??
                0,
            qty:
                extra?.qty ??
                extra?.quantity ??
                extra?.pivot?.qty ??
                extra?.pivot?.quantity ??
                1,
        }));
};

const extraName = (extra) =>
    extra?.name ??
    extra?.title ??
    extra?.extra?.name ??
    extra?.extra?.title ??
    "Extra";

const extraPrice = (extra) =>
    num(
        extra?.price ??
            extra?.sell_price ??
            extra?.extra?.price ??
            extra?.extra?.sell_price ??
            0
    );

const extraQty = (extra) =>
    Math.max(
        1,
        Math.round(
            num(
                extra?.qty ??
                    extra?.quantity ??
                    extra?.pivot?.qty ??
                    1,
                1
            )
        )
    );

const itemData = (item) => {
    const qty = Math.max(1, Math.round(num(item?.qty, 1)));

    /*
     * PENTING:
     * Jangan memakai transaction_details.price sebagai harga dasar
     * produk untuk struk.
     *
     * transaction_details.price pada flow POS ini bisa merupakan harga
     * yang sudah tersimpan/terpengaruh proses transaksi. Harga produk
     * yang harus ditampilkan di struk diambil dari relasi product.sell_price.
     */
    const productPrice = Math.max(
        0,
        num(
            item?.product?.sell_price ??
                item?.product?.price ??
                0
        )
    );

    const extras = getExtras(item);

    const extrasPerProduct = extras.reduce(
        (sum, extra) =>
            sum + extraPrice(extra) * extraQty(extra),
        0
    );

    const baseTotal = productPrice * qty;
    const extrasTotal = extrasPerProduct * qty;

    return {
        qty,
        productPrice,
        storedPrice: Math.max(0, num(item?.price, 0)),
        extras,
        extrasPerProduct,
        extrasTotal,
        baseTotal,
        baseUnitPrice: productPrice,
        lineTotal: baseTotal + extrasTotal,
    };
};

const paymentLabel = (method) => {
    const key = String(method || "cash").toLowerCase();

    const labels = {
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

    return (
        labels[key] ||
        key
            .replace(/[_-]+/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase())
    );
};

const storeData = (store, props) => ({
    name:
        store?.name ||
        props.storeName ||
        "Gemilang Mart",

    address:
        store?.address ??
        props.storeAddress ??
        "",

    phone:
        store?.phone ??
        props.storePhone ??
        "",

    footer:
        store?.footer ??
        props.footer ??
        "",

    logo:
        store?.logo_url ||
        (store?.logo
            ? `/storage/${String(store.logo).replace(/^\/+/, "")}`
            : null) ||
        props.storeLogo ||
        props.logoSrc ||
        null,
});

const Separator = ({ dashed = false }) => (
    <div
        className={`receipt-separator ${
            dashed ? "receipt-separator-dashed" : ""
        }`}
        aria-hidden="true"
    />
);

const Row = ({
    left,
    right,
    bold = false,
    className = "",
}) => (
    <div
        className={`receipt-row ${
            bold ? "receipt-row-bold" : ""
        } ${className}`}
    >
        <span className="receipt-left">{left}</span>
        <span className="receipt-right">{right}</span>
    </div>
);

function ReceiptContent({
    transaction,
    storeName,
    storeAddress,
    storePhone,
    footer,
    logo,
    mode = "80",
}) {
    const is58 = mode === "58";

    const items = Array.isArray(transaction?.details)
        ? transaction.details
        : [];

    const discount = Math.max(
        0,
        num(transaction?.discount, 0)
    );

    const total = Math.max(
        0,
        num(transaction?.grand_total, 0)
    );

    const subtotal = Math.max(
        total + discount,
        items.reduce(
            (sum, item) =>
                sum + itemData(item).lineTotal,
            0
        )
    );

    const paymentKey = String(
        transaction?.payment_method || "cash"
    ).toLowerCase();

    const cash = num(transaction?.cash, 0);
    const change = Math.max(
        0,
        num(transaction?.change, 0)
    );

    const footerLines = String(footer || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

    return (
        <div
            className={`thermal-receipt thermal-receipt-${mode}`}
        >
            <div className="receipt-header">
                {logo ? (
                    <img
                        src={logo}
                        alt=""
                        className="receipt-logo"
                        onError={(event) => {
                            event.currentTarget.style.display =
                                "none";
                        }}
                    />
                ) : null}

                <div className="receipt-store-name">
                    {String(storeName || "").toUpperCase()}
                </div>

                {storeAddress ? (
                    <div className="receipt-store-address">
                        {storeAddress}
                    </div>
                ) : null}

                {storePhone ? (
                    <div className="receipt-store-phone">
                        Telp: {storePhone}
                    </div>
                ) : null}
            </div>

            <Separator />

            <div className="receipt-section receipt-meta">
                <Row
                    left="No:"
                    right={transaction?.invoice || "-"}
                />
                <Row
                    left="Tgl:"
                    right={formatDate(
                        transaction?.created_at
                    )}
                />
                <Row
                    left="Kasir:"
                    right={
                        transaction?.cashier?.name || "-"
                    }
                />
                <Row
                    left="Pelanggan:"
                    right={
                        transaction?.customer?.name ||
                        "Umum"
                    }
                />
            </div>

            <Separator />

            <div className="receipt-items">
                {items.length === 0 ? (
                    <div className="receipt-empty">
                        Tidak ada item
                    </div>
                ) : (
                    items.map((item, index) => {
                        const data = itemData(item);

                        const title =
                            item?.product?.title ||
                            item?.product?.name ||
                            "Produk";

                        return (
                            <div
                                className="receipt-item"
                                key={item?.id ?? index}
                            >
                                <div className="receipt-product-name">
                                    {title}
                                </div>

                                <Row
                                    left={`${data.qty}x @ ${formatPrice(
                                        data.baseUnitPrice
                                    )}`}
                                    right={formatPrice(
                                        data.baseTotal
                                    )}
                                    className="receipt-small"
                                />

                                {data.extras.length > 0 ? (
                                    <div className="receipt-extras">
                                        <div className="receipt-extra-title">
                                            Extra
                                        </div>

                                        {data.extras.map(
                                            (
                                                extra,
                                                extraIndex
                                            ) => {
                                                const qty =
                                                    extraQty(
                                                        extra
                                                    );

                                                const totalExtra =
                                                    extraPrice(
                                                        extra
                                                    ) *
                                                    qty *
                                                    data.qty;

                                                return (
                                                    <Row
                                                        key={`${item?.id ?? index}-extra-${extra?.id ?? extraIndex}`}
                                                        left={`+ ${extraName(
                                                            extra
                                                        )} x ${qty}`}
                                                        right={formatPrice(
                                                            totalExtra
                                                        )}
                                                        className="receipt-extra-row"
                                                    />
                                                );
                                            }
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        );
                    })
                )}
            </div>

            <Separator dashed />

            <div className="receipt-section receipt-summary">
                <Row
                    left="Subtotal"
                    right={formatPrice(subtotal)}
                />

                {discount > 0 ? (
                    <Row
                        left="Diskon"
                        right={`-${formatPrice(discount)}`}
                    />
                ) : null}

                <Row
                    left="TOTAL"
                    right={formatPrice(total)}
                    bold
                    className="receipt-total"
                />
            </div>

            <Separator dashed />

            <div className="receipt-section receipt-payment">
                <Row
                    left={`Bayar (${paymentLabel(
                        paymentKey
                    )})`}
                    right={formatPrice(
                        paymentKey === "cash"
                            ? cash || total
                            : total
                    )}
                    bold
                />

                {paymentKey === "cash" &&
                change > 0 ? (
                    <Row
                        left="Kembali"
                        right={formatPrice(change)}
                        bold
                    />
                ) : null}
            </div>

            <Separator />

            {footerLines.length > 0 ? (
                <div className="receipt-footer">
                    {footerLines.map((line, index) => (
                        <div key={index}>{line}</div>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function ReceiptStyles() {
    return (
        <style>{`

                .thermal-receipt {
                    box-sizing: border-box;
                    background: #fff;
                    color: #000;
                    font-family: "Courier New", Courier, monospace;
                    font-weight: 400;
                    overflow: hidden;
                    margin: 0 auto;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }

                .thermal-receipt-80 {
                    width: 80mm;
                    max-width: 80mm;
                    padding: 4mm;
                    font-size: 10px;
                    line-height: 1.25;
                }

                .thermal-receipt-58 {
                    width: 58mm;
                    max-width: 58mm;
                    padding: 3mm;
                    font-size: 8px;
                    line-height: 1.2;
                }

                .receipt-header {
                    width: 100%;
                    text-align: center;
                    margin-bottom: 4px;
                }

                .receipt-logo {
                    display: block;
                    width: 150px;
                    max-width: 100%;
                    max-height: 65px;
                    height: auto;
                    object-fit: contain;
                    margin: 0 auto 4px;
                }

                .thermal-receipt-80 .receipt-logo {
                    width: 210px;
                    max-height: 85px;
                }

                .thermal-receipt-58 .receipt-logo {
                    width: 115px;
                    max-height: 50px;
                }

                .receipt-store-name {
                    font-size: 14px;
                    font-weight: 700;
                    line-height: 1.1;
                    overflow-wrap: anywhere;
                }

                .thermal-receipt-58 .receipt-store-name {
                    font-size: 10px;
                }

                .receipt-store-address,
                .receipt-store-phone {
                    width: 100%;
                    text-align: center;
                    white-space: pre-line;
                    overflow-wrap: anywhere;
                    word-break: normal;
                    margin-top: 2px;
                }

                .receipt-store-address {
                    font-size: 9px;
                    line-height: 1.25;
                }

                .receipt-store-phone {
                    font-size: 9px;
                    line-height: 1.2;
                }

                .thermal-receipt-58 .receipt-store-address {
                    font-size: 8px;
                    line-height: 1.2;
                }

                .thermal-receipt-58 .receipt-store-phone {
                    font-size: 8px;
                    line-height: 1.15;
                }

                .receipt-separator {
                    width: 100%;
                    height: 0;
                    border-top: 1px solid #000;
                    margin: 5px 0;
                    box-sizing: border-box;
                }

                .receipt-separator-dashed {
                    border-top-style: dashed;
                }

                .receipt-section {
                    width: 100%;
                    margin: 5px 0;
                }

                .receipt-row {
                    width: 100%;
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 5px;
                    margin: 2px 0;
                    box-sizing: border-box;
                }

                .receipt-left {
                    flex: 1 1 auto;
                    min-width: 0;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    text-align: left;
                }

                .receipt-right {
                    flex: 0 0 auto;
                    min-width: 0;
                    max-width: 52%;
                    white-space: nowrap;
                    text-align: right;
                }

                .receipt-row-bold {
                    font-weight: 700;
                }

                .receipt-small {
                    font-size: 9px;
                }

                .receipt-items {
                    width: 100%;
                    margin: 6px 0;
                }

                .receipt-item {
                    width: 100%;
                    margin-bottom: 6px;
                    break-inside: avoid;
                    page-break-inside: avoid;
                }

                .receipt-product-name {
                    width: 100%;
                    font-size: 10px;
                    font-weight: 700;
                    line-height: 1.2;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                }

                .thermal-receipt-58 .receipt-product-name {
                    font-size: 8px;
                }

                .thermal-receipt-58 .receipt-small {
                    font-size: 7px;
                }

                .receipt-extras {
                    width: 100%;
                    margin-top: 2px;
                    padding-left: 7px;
                    box-sizing: border-box;
                }

                .receipt-extra-title {
                    font-size: 8px;
                    font-weight: 700;
                    margin-bottom: 1px;
                }

                .receipt-extra-row {
                    font-size: 8px;
                }

                .thermal-receipt-58 .receipt-extra-title,
                .thermal-receipt-58 .receipt-extra-row {
                    font-size: 7px;
                }

                .receipt-total {
                    font-size: 11px;
                    margin-top: 3px;
                }

                .thermal-receipt-58 .receipt-total {
                    font-size: 9px;
                }

                .receipt-payment {
                    margin-top: 5px;
                }

                .receipt-footer {
                    width: 100%;
                    text-align: center;
                    font-size: 8px;
                    line-height: 1.25;
                    white-space: pre-line;
                    overflow-wrap: anywhere;
                    word-break: break-word;
                    margin-top: 6px;
                }

                .thermal-receipt-58 .receipt-footer {
                    font-size: 7px;
                }

                .receipt-empty {
                    text-align: center;
                    padding: 5px 0;
                }

                @media print {
                    .thermal-receipt {
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: 0 !important;
                        border-radius: 0 !important;
                    }

                    .thermal-receipt-80 {
                        width: 80mm !important;
                        max-width: 80mm !important;
                        padding: 3mm !important;
                    }

                    .thermal-receipt-58 {
                        display: block !important;
                        visibility: visible !important;
                        width: 58mm !important;
                        max-width: 58mm !important;
                        min-width: 58mm !important;
                        padding: 2.5mm !important;
                        box-sizing: border-box !important;
                    }
                }
            
        `}</style>
    );
}

export default function ThermalReceipt(props) {
    const { store } = usePage().props;

    const data = storeData(store, props);

    return (
        <>
            <ReceiptContent
                transaction={props.transaction}
                storeName={data.name}
                storeAddress={data.address}
                storePhone={data.phone}
                footer={data.footer}
                logo={data.logo}
                mode="80"
            />

            <ReceiptStyles />
        </>
    );
}

export function ThermalReceipt58mm(props) {
    const { store } = usePage().props;

    const data = storeData(store, props);

    return (
        <>
            <ReceiptContent
                transaction={props.transaction}
                storeName={data.name}
                storeAddress={data.address}
                storePhone={data.phone}
                footer={data.footer}
                logo={data.logo}
                mode="58"
            />
            <ReceiptStyles />
        </>
    );
}
