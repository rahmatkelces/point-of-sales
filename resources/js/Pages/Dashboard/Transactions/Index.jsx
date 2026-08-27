import React, {
    useEffect,
    useMemo,
    useState,
    useCallback,
    useRef,
} from "react";
import { Head, router, usePage } from "@inertiajs/react";
import toast from "react-hot-toast";
import axios from "axios";
import POSLayout from "@/Layouts/POSLayout";
import ProductGrid from "@/Components/POS/ProductGrid";
import CustomerSelect from "@/Components/POS/CustomerSelect";
import NumpadModal from "@/Components/POS/NumpadModal";
import HeldTransactions, {
    HoldButton,
} from "@/Components/POS/HeldTransactions";
import useBarcodeScanner from "@/Hooks/useBarcodeScanner";
import { getProductImageUrl } from "@/Utils/imageUrl";
import {
    IconShoppingCart,
    IconReceipt,
    IconKeyboard,
    IconTrash,
    IconCash,
    IconCreditCard,
    IconQrcode,
    IconPlus,
    IconMinus,
    IconX,
} from "@tabler/icons-react";

const formatPrice = (value = 0) =>
    Number(value || 0).toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    });

const getCartExtras = (item) => {
    let extras = item?.extras ?? [];

    // Antisipasi jika extras dikirim sebagai JSON string.
    if (typeof extras === "string") {
        try {
            extras = JSON.parse(extras);
        } catch {
            extras = [];
        }
    }

    if (!Array.isArray(extras)) {
        return [];
    }

    return extras.filter((extra) => extra && Number(extra.id) > 0);
};

const getCartExtrasTotal = (item) => {
    const productQty = Math.max(1, Number(item?.qty) || 1);

    return getCartExtras(item).reduce(
        (total, extra) =>
            total +
            Number(extra.price || 0) *
                Math.max(1, Number(extra.qty) || 1) *
                productQty,
        0
    );
};

export default function Index({
    carts = [],
    carts_total = 0,
    heldCarts = [],
    customers = [],
    products = [],
    categories = [],
    promotions = [],
    paymentGateways = [],
    defaultPaymentGateway = "cash",
}) {
    const { errors } = usePage().props;

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    const [addingProductId, setAddingProductId] = useState(null);
    const [removingItemId, setRemovingItemId] = useState(null);

    // EXTRA PRODUCT
    const [extraProduct, setExtraProduct] = useState(null);
    const [selectedExtras, setSelectedExtras] = useState({});
    const [extraQty, setExtraQty] = useState(1);

    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [discountInput, setDiscountInput] = useState("");
    const [cashInput, setCashInput] = useState("");

    // PROMOTION - tambahan tanpa menghapus logic POS yang sudah ada
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [promotionCode, setPromotionCode] = useState("");
    const [promotionDiscount, setPromotionDiscount] = useState(0);
    const [promotionError, setPromotionError] = useState("");
    const [promotionMessage, setPromotionMessage] = useState("");

    const [paymentMethod, setPaymentMethod] = useState(
        defaultPaymentGateway ?? "cash"
    );

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mobileView, setMobileView] = useState("products");
    const [numpadOpen, setNumpadOpen] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);

    const [isHolding, setIsHolding] = useState(false);
    const [updatingCartId, setUpdatingCartId] = useState(null);

    const [instantpayPayment, setInstantpayPayment] = useState(null);
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);

    // Setelah QRIS berhasil dibayar, tampilkan print di modal yang sama.
    // Tidak redirect / pindah halaman browser.
    const [printInvoice, setPrintInvoice] = useState(null);

    const [payLaterLabel, setPayLaterLabel] = useState("");

    // Draft quantity untuk input
    const [qtyDrafts, setQtyDrafts] = useState({});

    const searchInputRef = useRef(null);

    useEffect(() => {
        setPaymentMethod(defaultPaymentGateway ?? "cash");
    }, [defaultPaymentGateway]);

    /*
     * ============================================================
     * POLLING STATUS PEMBAYARAN INSTANTPAY
     * ============================================================
     */
    useEffect(() => {
        if (!instantpayPayment?.transaction_id) {
            return;
        }

        let cancelled = false;
        let timer = null;

        const clearPollingTimer = () => {
            if (timer) {
                window.clearTimeout(timer);
                timer = null;
            }
        };

        const finishPayment = (
            message,
            type = "success"
        ) => {
            clearPollingTimer();

            if (cancelled) {
                return;
            }

            setIsCheckingPayment(false);
            setInstantpayPayment(null);
            setIsSubmitting(false);

            if (type === "success") {
                toast.success(message);
            } else {
                toast.error(message);
            }
        };

        const checkPaymentStatus = async () => {
            if (cancelled) {
                return;
            }

            const transactionId =
                instantpayPayment.transaction_id;

            console.log(
                "INSTANTPAY CHECK:",
                transactionId
            );

            try {
                const statusUrl = route(
                    "transactions.paymentStatus",
                    transactionId
                );

                console.log(
                    "INSTANTPAY STATUS URL:",
                    statusUrl
                );

                const response = await axios.get(
                    statusUrl,
                    {
                        headers: {
                            Accept: "application/json",
                            "X-Requested-With":
                                "XMLHttpRequest",
                        },
                        timeout: 15000,
                    }
                );

                if (cancelled) {
                    return;
                }

                console.log(
                    "INSTANTPAY STATUS RESPONSE:",
                    response.data
                );

                const data =
                    response.data || {};

                const status = String(
                    data.status ??
                        data.payment_status ??
                        data.transaction_status ??
                        data.data?.status ??
                        data.data?.payment_status ??
                        data.data?.transaction_status ??
                        "pending"
                ).toLowerCase();

                console.log(
                    "INSTANTPAY NORMALIZED FRONTEND STATUS:",
                    status
                );

                /*
                 * =====================================================
                 * PEMBAYARAN BERHASIL
                 * =====================================================
                 */
                if (
                    [
                        "paid",
                        "success",
                        "successful",
                        "completed",
                        "complete",
                        "settled",
                    ].includes(status)
                ) {
                    console.log(
                        "INSTANTPAY PAYMENT SUCCESS"
                    );

                    clearPollingTimer();

                    const invoice =
                        instantpayPayment.invoice;

                    console.log(
                        "INSTANTPAY SUCCESS TRANSACTION ID:",
                        transactionId
                    );

                    console.log(
                        "INSTANTPAY SUCCESS INVOICE:",
                        invoice
                    );

                    if (!invoice) {
                        console.error(
                            "INSTANTPAY: invoice tidak tersedia untuk redirect print."
                        );

                        setIsCheckingPayment(false);
                        setInstantpayPayment(null);
                        setIsSubmitting(false);

                        toast.error(
                            "Pembayaran berhasil, tetapi invoice transaksi tidak ditemukan."
                        );

                        return;
                    }

                    const printUrl = route(
                        "transactions.print",
                        invoice
                    );

                    console.log(
                        "INSTANTPAY PRINT URL:",
                        printUrl
                    );

                    setIsCheckingPayment(false);
                    setInstantpayPayment(null);
                    setIsSubmitting(false);

                    // Transaksi sudah PAID. Bersihkan keranjang aktif di
                    // server lalu ambil ulang hanya carts/carts_total.
                    // Ini mencegah produk transaksi lama muncul lagi
                    // ketika kembali ke POS.
                    router.reload({
                        only: ["carts", "carts_total"],
                        preserveState: true,
                        preserveScroll: true,
                        onSuccess: () => {
                            setPrintInvoice({
                                invoice,
                                url: printUrl,
                            });

                            toast.success(
                                "Pembayaran Instantpay berhasil!"
                            );
                        },
                        onError: (errors) => {
                            console.error(
                                "Gagal refresh cart setelah Instantpay:",
                                errors
                            );

                            setPrintInvoice({
                                invoice,
                                url: printUrl,
                            });

                            toast.success(
                                "Pembayaran berhasil. Silakan cek keranjang POS."
                            );
                        },
                    });

                    return;
                }

                /*
                 * =====================================================
                 * PEMBAYARAN GAGAL
                 * =====================================================
                 */
                if (
                    [
                        "failed",
                        "failure",
                        "cancelled",
                        "canceled",
                    ].includes(status)
                ) {
                    console.log(
                        "INSTANTPAY PAYMENT FAILED"
                    );

                    finishPayment(
                        "Pembayaran Instantpay gagal.",
                        "error"
                    );

                    return;
                }

                /*
                 * =====================================================
                 * PEMBAYARAN EXPIRED
                 * =====================================================
                 */
                if (
                    [
                        "expired",
                        "expire",
                    ].includes(status)
                ) {
                    console.log(
                        "INSTANTPAY PAYMENT EXPIRED"
                    );

                    finishPayment(
                        "Pembayaran Instantpay sudah expired.",
                        "error"
                    );

                    return;
                }

                /*
                 * =====================================================
                 * STATUS PENDING
                 * =====================================================
                 */
                console.log(
                    "INSTANTPAY masih pending. Cek lagi 3 detik."
                );

                if (!cancelled) {
                    timer = window.setTimeout(
                        checkPaymentStatus,
                        3000
                    );
                }
            } catch (error) {
                console.error(
                    "INSTANTPAY POLLING ERROR:",
                    error
                );

                if (cancelled) {
                    return;
                }

                /*
                 * Jangan langsung tutup modal.
                 * Retry 5 detik.
                 */
                timer = window.setTimeout(
                    checkPaymentStatus,
                    5000
                );
            }
        };

        setIsCheckingPayment(true);

        checkPaymentStatus();

        return () => {
            cancelled = true;
            clearPollingTimer();
        };
    }, [
        instantpayPayment?.transaction_id,
    ]);

    /*
     * ============================================================
     * SYNC DRAFT QTY
     * ============================================================
     */
    useEffect(() => {
        const nextDrafts = {};

        carts.forEach((item) => {
            nextDrafts[item.id] = String(
                Math.max(
                    1,
                    Number(item.qty) || 1
                )
            );
        });

        setQtyDrafts(nextDrafts);
    }, [carts]);

    /*
     * ============================================================
     * ADD PRODUCT - FAST
     * ============================================================
     *
     * Hanya meminta carts dan carts_total dari server.
     *
     * Products, categories, customers, heldCarts,
     * paymentGateways dan data lain tidak diambil ulang.
     */
    const addProductToCart = useCallback(
        (product, extras = [], qty = 1) => {
            if (!product?.id) {
                return;
            }

            if (addingProductId === product.id) {
                return;
            }

            setAddingProductId(product.id);

            router.post(
                route("transactions.addToCart"),
                {
                    product_id: product.id,
                    sell_price: product.sell_price,
                    qty: Math.max(1, Number(qty) || 1),
                    extras: extras.map((extra) => ({
                        id: extra.id,
                        qty: Math.max(1, Number(extra.qty) || 1),
                    })),
                },
                {
                    preserveScroll: true,
                    preserveState: true,
                    only: [
                        "carts",
                        "carts_total",
                    ],
                    onSuccess: () => {
                        setAddingProductId(null);
                        setExtraProduct(null);
                        setSelectedExtras({});
                        setExtraQty(1);
                    },
                    onError: (errs) => {
                        console.error(
                            "ADD TO CART ERROR:",
                            errs
                        );

                        toast.error(
                            errs?.message ||
                                "Gagal menambahkan produk"
                        );

                        setAddingProductId(null);
                    },
                    onFinish: () => {
                        setAddingProductId(null);
                    },
                }
            );
        },
        [addingProductId]
    );

    const getProductExtras = useCallback((product) => {
        const extras =
            product?.extras ??
            product?.product_extras ??
            product?.productExtras ??
            [];

        if (!Array.isArray(extras)) {
            return [];
        }

        return extras.filter(
            (extra) => extra?.is_active !== false
        );
    }, []);

    const handleAddToCart = useCallback(
        (product) => {
            if (!product?.id) {
                return;
            }

            const extras = getProductExtras(product);

            // Produk tanpa extra langsung masuk keranjang.
            if (extras.length === 0) {
                addProductToCart(product, [], 1);
                return;
            }

            const initialExtras = {};

            extras.forEach((extra) => {
                initialExtras[extra.id] = 0;
            });

            setSelectedExtras(initialExtras);
            setExtraQty(1);
            setExtraProduct(product);
        },
        [
            addProductToCart,
            getProductExtras,
        ]
    );

    const toggleExtra = useCallback((extraId) => {
        setSelectedExtras((prev) => ({
            ...prev,
            [extraId]: prev[extraId] ? 0 : 1,
        }));
    }, []);

    const changeExtraQty = useCallback(
        (extraId, qty) => {
            setSelectedExtras((prev) => ({
                ...prev,
                [extraId]: Math.max(
                    0,
                    Number(qty) || 0
                ),
            }));
        },
        []
    );

    const closeExtraModal = useCallback(() => {
        if (addingProductId) {
            return;
        }

        setExtraProduct(null);
        setSelectedExtras({});
        setExtraQty(1);
    }, [addingProductId]);

    const confirmExtraProduct = useCallback(() => {
        if (!extraProduct) {
            return;
        }

        const extras = getProductExtras(extraProduct)
            .filter(
                (extra) =>
                    Number(
                        selectedExtras[extra.id] || 0
                    ) > 0
            )
            .map((extra) => ({
                id: extra.id,
                qty: Number(
                    selectedExtras[extra.id]
                ),
            }));

        addProductToCart(
            extraProduct,
            extras,
            extraQty
        );
    }, [
        extraProduct,
        selectedExtras,
        extraQty,
        addProductToCart,
        getProductExtras,
    ]);

    /*
     * ============================================================
     * BARCODE SCANNER
     * ============================================================
     */
    const handleBarcodeScan =
        useCallback(
            (barcode) => {
                const product =
                    products.find(
                        (p) =>
                            p.barcode?.toLowerCase() ===
                            barcode.toLowerCase()
                    );

                if (product) {
                    if (
                        product.stock > 0
                    ) {
                        addProductToCart(
                            product,
                            [],
                            1
                        );

                        toast.success(
                            `${product.title} ditambahkan (barcode)`
                        );
                    } else {
                        toast.error(
                            `${product.title} stok habis`
                        );
                    }
                } else {
                    toast.error(
                        `Produk tidak ditemukan: ${barcode}`
                    );
                }
            },
            [
                products,
                addProductToCart,
            ]
        );

    useBarcodeScanner(
        handleBarcodeScan,
        {
            enabled: true,
            minLength: 3,
        }
    );

    /*
     * ============================================================
     * SUBTOTAL
     * ============================================================
     */
    const subtotal = useMemo(
        () => carts_total ?? 0,
        [carts_total]
    );

    /*
     * ============================================================
     * PROMOTION
     * ============================================================
     */
    const manualDiscount = useMemo(
        () =>
            Math.max(
                0,
                Number(discountInput) || 0
            ),
        [discountInput]
    );

    const getPromotionProducts = useCallback(
        (promotion, role = null) => {
            if (!promotion) {
                return [];
            }

            const relation =
                promotion.promotion_products ??
                promotion.promotionProducts ??
                promotion.products ??
                [];

            if (!Array.isArray(relation)) {
                return [];
            }

            return relation.filter((item) => {
                if (!role) {
                    return true;
                }

                return (
                    item.role === role ||
                    item.pivot?.role === role
                );
            });
        },
        []
    );

    const getPromotionProductIds = useCallback(
        (promotion, role = null) => {
            return getPromotionProducts(
                promotion,
                role
            )
                .map(
                    (item) =>
                        Number(
                            item.product_id ??
                                item.pivot?.product_id ??
                                item.id
                        )
                )
                .filter(Boolean);
        },
        [getPromotionProducts]
    );

    const calculatePromotionDiscount = useCallback(
        (promotion) => {
            if (!promotion || carts.length === 0) {
                return {
                    discount: 0,
                    error: "",
                    message: "",
                };
            }

            const type = String(
                promotion.type ??
                    promotion.promotion_type ??
                    ""
            ).toLowerCase();

            const minPurchase = Number(
                promotion.min_purchase ??
                    promotion.minimum_purchase ??
                    0
            );

            if (
                minPurchase > 0 &&
                Number(subtotal) < minPurchase
            ) {
                return {
                    discount: 0,
                    error: `Minimum pembelian ${formatPrice(
                        minPurchase
                    )}.`,
                    message: "",
                };
            }

            const now = new Date();

            if (
                promotion.start_at &&
                now < new Date(promotion.start_at)
            ) {
                return {
                    discount: 0,
                    error: "Promotion belum berlaku.",
                    message: "",
                };
            }

            if (
                promotion.end_at &&
                now > new Date(promotion.end_at)
            ) {
                return {
                    discount: 0,
                    error: "Promotion sudah berakhir.",
                    message: "",
                };
            }

            if (
                promotion.valid_from &&
                now < new Date(promotion.valid_from)
            ) {
                return {
                    discount: 0,
                    error: "Promotion belum berlaku.",
                    message: "",
                };
            }

            if (
                promotion.valid_until &&
                now > new Date(promotion.valid_until)
            ) {
                return {
                    discount: 0,
                    error: "Promotion sudah berakhir.",
                    message: "",
                };
            }

            const targetIds =
                getPromotionProductIds(
                    promotion,
                    "target"
                );

            const buyIds =
                getPromotionProductIds(
                    promotion,
                    "buy"
                );

            const getIds =
                getPromotionProductIds(
                    promotion,
                    "get"
                );

            const selectedIds =
                getPromotionProductIds(
                    promotion
                );

            const hasProductRestriction =
                targetIds.length > 0 ||
                buyIds.length > 0 ||
                getIds.length > 0 ||
                selectedIds.length > 0;

            const isInList = (
                item,
                ids
            ) =>
                ids.includes(
                    Number(item.product_id)
                );

            let discount = 0;

            if (
                type === "price_discount" ||
                type === "percentage" ||
                type === "percent"
            ) {
                const percentage = Math.max(
                    0,
                    Number(
                        promotion.discount_percentage ??
                            promotion.discount_percent ??
                            promotion.percentage ??
                            promotion.discount_value ??
                            0
                    )
                );

                const nominal = Number(
                    promotion.discount_nominal ??
                        promotion.discount_amount ??
                        0
                );

                const eligible = carts.filter(
                    (item) =>
                        !hasProductRestriction ||
                        isInList(
                            item,
                            targetIds.length
                                ? targetIds
                                : selectedIds
                        )
                );

                const eligibleSubtotal =
                    eligible.reduce(
                        (total, item) =>
                            total +
                            Number(item.price || 0),
                        0
                    );

                if (percentage > 0) {
                    discount =
                        eligibleSubtotal *
                        (percentage / 100);

                    const maxDiscount = Number(
                        promotion.max_discount ??
                            promotion.maximum_discount ??
                            0
                    );

                    if (
                        maxDiscount > 0
                    ) {
                        discount = Math.min(
                            discount,
                            maxDiscount
                        );
                    }
                } else {
                    discount = Math.min(
                        eligibleSubtotal,
                        nominal
                    );
                }

                return {
                    discount: Math.min(
                        Number(subtotal),
                        Math.max(
                            0,
                            Math.round(
                                discount
                            )
                        )
                    ),
                    error: "",
                    message:
                        "Promotion berhasil digunakan.",
                };
            }

            if (
                type === "voucher_nominal" ||
                type === "voucher"
            ) {
                const requiredCode = String(
                    promotion.code ??
                        promotion.voucher_code ??
                        ""
                )
                    .trim()
                    .toUpperCase();

                if (
                    requiredCode &&
                    String(
                        promotionCode || ""
                    )
                        .trim()
                        .toUpperCase() !==
                        requiredCode
                ) {
                    return {
                        discount: 0,
                        error: "Kode voucher tidak sesuai.",
                        message: "",
                    };
                }

                const nominal = Number(
                    promotion.discount_nominal ??
                        promotion.discount_amount ??
                        promotion.nominal ??
                        0
                );

                if (nominal <= 0) {
                    return {
                        discount: 0,
                        error: "Nominal voucher belum dikonfigurasi.",
                        message: "",
                    };
                }

                return {
                    discount: Math.min(
                        Number(subtotal),
                        nominal
                    ),
                    error: "",
                    message:
                        "Voucher berhasil digunakan.",
                };
            }

            if (
                type === "buy_x_get_y_same" ||
                type === "buyxgety_same" ||
                type === "buy_x_get_y"
            ) {
                const buyQty = Math.max(
                    1,
                    Number(
                        promotion.buy_qty ??
                            promotion.buy_quantity ??
                            promotion.x ??
                            1
                    )
                );

                const getQty = Math.max(
                    1,
                    Number(
                        promotion.get_qty ??
                            promotion.get_quantity ??
                            promotion.y ??
                            1
                    )
                );

                const eligibleIds =
                    buyIds.length
                        ? buyIds
                        : targetIds.length
                        ? targetIds
                        : selectedIds;

                const eligible =
                    eligibleIds.length
                        ? carts.filter((item) =>
                              isInList(
                                  item,
                                  eligibleIds
                              )
                          )
                        : carts;

                const totalQty =
                    eligible.reduce(
                        (total, item) =>
                            total +
                            Number(item.qty || 0),
                        0
                    );

                const freeQty =
                    Math.floor(
                        totalQty / buyQty
                    ) * getQty;

                if (freeQty <= 0) {
                    return {
                        discount: 0,
                        error: `Minimal beli ${buyQty} item.`,
                        message: "",
                    };
                }

                const freeCandidates =
                    getIds.length
                        ? eligible.filter((item) =>
                              isInList(
                                  item,
                                  getIds
                              )
                          )
                        : eligible;

                const availableFreeQty =
                    freeCandidates.reduce(
                        (total, item) =>
                            total +
                            Number(item.qty || 0),
                        0
                    );

                if (
                    availableFreeQty <
                    freeQty
                ) {
                    return {
                        discount: 0,
                        error: `Tambahkan ${freeQty} item promo ke keranjang.`,
                        message: "",
                    };
                }

                let remaining = freeQty;

                freeCandidates
                    .slice()
                    .sort(
                        (a, b) =>
                            Number(
                                a.product
                                    ?.sell_price ??
                                    0
                            ) -
                            Number(
                                b.product
                                    ?.sell_price ??
                                    0
                            )
                    )
                    .forEach((item) => {
                        if (
                            remaining <= 0
                        ) {
                            return;
                        }

                        const take =
                            Math.min(
                                remaining,
                                Number(
                                    item.qty || 0
                                )
                            );

                        discount +=
                            take *
                            Number(
                                item.product
                                    ?.sell_price ??
                                    0
                            );

                        remaining -= take;
                    });

                return {
                    discount: Math.min(
                        Number(subtotal),
                        Math.max(
                            0,
                            Math.round(
                                discount
                            )
                        )
                    ),
                    error: "",
                    message:
                        "Buy X Get Y berhasil digunakan.",
                };
            }

            if (
                type === "buy_x_get_y_diff" ||
                type === "buyxgety_diff"
            ) {
                const buyQty = Math.max(
                    1,
                    Number(
                        promotion.buy_qty ??
                            promotion.buy_quantity ??
                            promotion.x ??
                            1
                    )
                );

                const getQty = Math.max(
                    1,
                    Number(
                        promotion.get_qty ??
                            promotion.get_quantity ??
                            promotion.y ??
                            1
                    )
                );

                const buyCandidates =
                    buyIds.length
                        ? carts.filter((item) =>
                              isInList(
                                  item,
                                  buyIds
                              )
                          )
                        : carts;

                const totalBuyQty =
                    buyCandidates.reduce(
                        (total, item) =>
                            total +
                            Number(item.qty || 0),
                        0
                    );

                const freeQty =
                    Math.floor(
                        totalBuyQty / buyQty
                    ) * getQty;

                if (freeQty <= 0) {
                    return {
                        discount: 0,
                        error: `Minimal beli ${buyQty} item produk promo.`,
                        message: "",
                    };
                }

                const freeCandidates =
                    getIds.length
                        ? carts.filter((item) =>
                              isInList(
                                  item,
                                  getIds
                              )
                          )
                        : carts.filter(
                              (item) =>
                                  !buyIds.includes(
                                      Number(
                                          item.product_id
                                      )
                                  )
                          );

                const availableFreeQty =
                    freeCandidates.reduce(
                        (total, item) =>
                            total +
                            Number(item.qty || 0),
                        0
                    );

                if (
                    availableFreeQty <
                    freeQty
                ) {
                    return {
                        discount: 0,
                        error: `Tambahkan ${freeQty} item produk gratis ke keranjang.`,
                        message: "",
                    };
                }

                let remaining = freeQty;

                freeCandidates
                    .slice()
                    .sort(
                        (a, b) =>
                            Number(
                                a.product
                                    ?.sell_price ??
                                    0
                            ) -
                            Number(
                                b.product
                                    ?.sell_price ??
                                    0
                            )
                    )
                    .forEach((item) => {
                        if (
                            remaining <= 0
                        ) {
                            return;
                        }

                        const take =
                            Math.min(
                                remaining,
                                Number(
                                    item.qty || 0
                                )
                            );

                        discount +=
                            take *
                            Number(
                                item.product
                                    ?.sell_price ??
                                    0
                            );

                        remaining -= take;
                    });

                return {
                    discount: Math.min(
                        Number(subtotal),
                        Math.max(
                            0,
                            Math.round(
                                discount
                            )
                        )
                    ),
                    error: "",
                    message:
                        "Buy X Get Y berhasil digunakan.",
                };
            }

            return {
                discount: 0,
                error: "Jenis promotion belum didukung.",
                message: "",
            };
        },
        [
            carts,
            getPromotionProductIds,
            promotionCode,
            subtotal,
        ]
    );

    useEffect(() => {
        if (!selectedPromotion) {
            setPromotionDiscount(0);
            setPromotionError("");
            setPromotionMessage("");
            return;
        }

        const result =
            calculatePromotionDiscount(
                selectedPromotion
            );

        setPromotionDiscount(
            result.discount
        );
        setPromotionError(
            result.error || ""
        );
        setPromotionMessage(
            result.message || ""
        );
    }, [
        carts,
        selectedPromotion,
        promotionCode,
        subtotal,
        calculatePromotionDiscount,
    ]);

    const discount = useMemo(
        () =>
            Math.min(
                Number(subtotal),
                manualDiscount +
                    Number(
                        promotionDiscount || 0
                    )
            ),
        [
            subtotal,
            manualDiscount,
            promotionDiscount,
        ]
    );

    /*
     * ============================================================
     * PAYABLE
     * ============================================================
     */
    const payable = useMemo(
        () =>
            Math.max(
                subtotal - discount,
                0
            ),
        [
            subtotal,
            discount,
        ]
    );

    /*
     * ============================================================
     * CUSTOMER REQUIRED
     * ============================================================
     */
    const requiresCustomer =
        payable >= 200000;

    useEffect(() => {
        if (
            !requiresCustomer &&
            selectedCustomer
        ) {
            setSelectedCustomer(
                null
            );
        }
    }, [
        requiresCustomer,
        selectedCustomer,
    ]);

    /*
     * ============================================================
     * PAYMENT
     * ============================================================
     */
    const isCashPayment =
        paymentMethod === "cash";

    const isDebitPayment =
        paymentMethod === "debit";

    const cash = useMemo(() => {
        if (isCashPayment) {
            return Math.max(
                0,
                Number(cashInput) || 0
            );
        }

        if (isDebitPayment) {
            return payable;
        }

        return payable;
    }, [
        cashInput,
        isCashPayment,
        isDebitPayment,
        payable,
    ]);

    /*
     * ============================================================
     * CART COUNT
     * ============================================================
     */
    const cartCount = useMemo(
        () =>
            carts.reduce(
                (total, item) =>
                    total +
                    Number(
                        item.qty || 0
                    ),
                0
            ),
        [carts]
    );

    /*
     * ============================================================
     * PAYMENT OPTIONS
     * ============================================================
     */
    const paymentOptions =
        useMemo(
            () => [
                {
                    value: "cash",
                    label: "Tunai",
                    description:
                        "Pembayaran tunai langsung di kasir.",
                },
                {
                    value: "debit",
                    label: "Debit",
                    description:
                        "Pembayaran kartu debit di kasir.",
                },
                {
                    value: "instantpay",
                    label: "QRIS",
                    description:
                        "Pembayaran QRIS melalui Instantpay.",
                },
            ],
            []
        );

    /*
     * ============================================================
     * AUTO CASH INPUT
     * ============================================================
     */
    useEffect(() => {
        if (
            !isCashPayment &&
            payable >= 0
        ) {
            setCashInput(
                String(payable)
            );
        }
    }, [
        isCashPayment,
        payable,
    ]);

    /*
     * ============================================================
     * UPDATE QTY
     * ============================================================
     */
    const handleUpdateQty =
        useCallback(
            (
                cartId,
                newQty
            ) => {
                const qty =
                    Math.max(
                        1,
                        Number(
                            newQty
                        ) || 1
                    );

                setUpdatingCartId(
                    cartId
                );

                setQtyDrafts(
                    (prev) => ({
                        ...prev,
                        [cartId]:
                            String(qty),
                    })
                );

                router.patch(
                    route(
                        "transactions.updateCart",
                        cartId
                    ),
                    {
                        qty,
                    },
                    {
                        preserveScroll:
                            true,

                        preserveState:
                            true,

                        only: [
                            "carts",
                            "carts_total",
                        ],

                        onSuccess:
                            () => {
                                setUpdatingCartId(
                                    null
                                );
                            },

                        onError:
                            (errs) => {
                                toast.error(
                                    errs?.message ||
                                        "Gagal update quantity"
                                );

                                setUpdatingCartId(
                                    null
                                );
                            },

                        onFinish:
                            () => {
                                setUpdatingCartId(
                                    null
                                );
                            },
                    }
                );
            },
            []
        );

    const handleQtyInputChange =
        (
            cartId,
            value
        ) => {
            const sanitized =
                value.replace(
                    /[^\d]/g,
                    ""
                );

            setQtyDrafts(
                (prev) => ({
                    ...prev,
                    [cartId]:
                        sanitized ===
                        ""
                            ? ""
                            : sanitized,
                })
            );
        };

    const commitQtyInput =
        (item) => {
            const raw =
                qtyDrafts[
                    item.id
                ];

            const nextQty =
                Math.max(
                    1,
                    Number(raw) || 1
                );

            if (
                nextQty !==
                Number(
                    item.qty
                )
            ) {
                handleUpdateQty(
                    item.id,
                    nextQty
                );
            } else {
                setQtyDrafts(
                    (prev) => ({
                        ...prev,
                        [item.id]:
                            String(
                                nextQty
                            ),
                    })
                );
            }
        };

    /*
     * ============================================================
     * NUMPAD
     * ============================================================
     */
    const handleNumpadConfirm =
        useCallback(
            (value) => {
                setCashInput(
                    String(value)
                );
            },
            []
        );

    /*
     * ============================================================
     * PAY LATER
     * ============================================================
     */
    const handleHoldCart =
        async (
            label = null
        ) => {
            if (
                carts.length === 0
            ) {
                toast.error(
                    "Keranjang kosong"
                );

                return;
            }

            const finalLabel =
                String(
                    label ??
                        payLaterLabel ??
                        ""
                ).trim() || null;

            setIsHolding(true);

            router.post(
                route(
                    "transactions.hold"
                ),
                {
                    label: finalLabel,
                },
                {
                    preserveScroll:
                        true,

                    preserveState:
                        true,

                    only: [
                        "carts",
                        "carts_total",
                        "heldCarts",
                    ],

                    onSuccess: () => {
                        setPayLaterLabel("");

                        toast.success(
                            finalLabel
                                ? `Pay Later ${finalLabel} disimpan`
                                : "Transaksi disimpan sebagai Pay Later"
                        );

                        setIsHolding(
                            false
                        );
                    },

                    onError: (
                        errs
                    ) => {
                        toast.error(
                            errs?.message ||
                                "Gagal menyimpan Pay Later"
                        );

                        setIsHolding(
                            false
                        );
                    },

                    onFinish: () => {
                        setIsHolding(
                            false
                        );
                    },
                }
            );
        };

    /*
     * ============================================================
     * KEYBOARD SHORTCUTS
     * ============================================================
     */
    useEffect(() => {
        const handleKeyDown =
            (e) => {
                if (
                    e.target.tagName ===
                        "INPUT" ||
                    e.target.tagName ===
                        "TEXTAREA"
                ) {
                    return;
                }

                switch (e.key) {
                    case "/":
                    case "F5":
                        e.preventDefault();

                        searchInputRef.current?.focus();

                        break;

                    case "F1":
                        e.preventDefault();

                        setNumpadOpen(
                            true
                        );

                        break;

                    case "F2":
                        e.preventDefault();

                        if (
                            carts.length >
                                0 &&
                            (
                                !requiresCustomer ||
                                selectedCustomer
                            )
                        ) {
                            handleSubmitTransaction();
                        }

                        break;

                    case "F3":
                        e.preventDefault();

                        setMobileView(
                            (prev) =>
                                prev ===
                                "products"
                                    ? "cart"
                                    : "products"
                        );

                        break;

                    case "F4":
                        e.preventDefault();

                        setShowShortcuts(
                            (prev) =>
                                !prev
                        );

                        break;

                    case "Escape":
                        setNumpadOpen(
                            false
                        );

                        setShowShortcuts(
                            false
                        );

                        setSearchQuery(
                            ""
                        );

                        break;

                    default:
                        break;
                }
            };

        window.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () =>
            window.removeEventListener(
                "keydown",
                handleKeyDown
            );
    }, [
        carts.length,
        requiresCustomer,
        selectedCustomer,
    ]);

    /*
     * ============================================================
     * REMOVE CART ITEM
     * ============================================================
     */
    const handleRemoveFromCart =
        (cartId) => {
            setRemovingItemId(
                cartId
            );

            router.delete(
                route(
                    "transactions.destroyCart",
                    cartId
                ),
                {
                    preserveScroll:
                        true,

                    preserveState:
                        true,

                    only: [
                        "carts",
                        "carts_total",
                    ],

                    onSuccess: () => {
                        toast.success(
                            "Item dihapus dari keranjang"
                        );

                        setRemovingItemId(
                            null
                        );
                    },

                    onError: () => {
                        toast.error(
                            "Gagal menghapus item"
                        );

                        setRemovingItemId(
                            null
                        );
                    },

                    onFinish: () => {
                        setRemovingItemId(
                            null
                        );
                    },
                }
            );
        };

    /*
     * ============================================================
     * RESET TRANSACTION FORM
     * ============================================================
     */
    const resetTransactionForm =
        () => {
            setDiscountInput(
                ""
            );

            setSelectedPromotion(null);
            setPromotionCode("");
            setPromotionDiscount(0);
            setPromotionError("");
            setPromotionMessage("");

            setCashInput(
                ""
            );

            setSelectedCustomer(
                null
            );

            setPaymentMethod(
                defaultPaymentGateway ??
                    "cash"
            );

            setIsSubmitting(
                false
            );
        };

    /*
     * ============================================================
     * SUBMIT TRANSACTION
     * ============================================================
     */
    const handleSubmitTransaction =
        async () => {
            if (
                carts.length === 0
            ) {
                toast.error(
                    "Keranjang masih kosong"
                );

                return;
            }

            if (
                requiresCustomer &&
                !selectedCustomer?.id
            ) {
                toast.error(
                    "Pilih pelanggan terlebih dahulu untuk transaksi di atas Rp200.000"
                );

                return;
            }

            if (
                selectedPromotion &&
                promotionError
            ) {
                toast.error(
                    promotionError
                );

                return;
            }

            if (
                isCashPayment &&
                cash < payable
            ) {
                toast.error(
                    "Jumlah pembayaran kurang dari total"
                );

                return;
            }

            const payload = {
                customer_id:
                    requiresCustomer
                        ? selectedCustomer?.id
                        : null,

                promotion_id:
                    selectedPromotion?.id ||
                    null,

                promotion_code:
                    promotionCode || null,

                discount,

                grand_total:
                    payable,

                cash:
                    isCashPayment
                        ? cash
                        : payable,

                change:
                    isCashPayment
                        ? Math.max(
                              cash -
                                  payable,
                              0
                          )
                        : 0,

                payment_gateway:
                    paymentMethod ===
                    "cash"
                        ? null
                        : paymentMethod,
            };

            setIsSubmitting(
                true
            );

            /*
             * =====================================================
             * INSTANTPAY
             * =====================================================
             */
            if (
                paymentMethod ===
                "instantpay"
            ) {
                try {
                    const response =
                        await axios.post(
                            route(
                                "transactions.store"
                            ),
                            payload,
                            {
                                headers: {
                                    Accept:
                                        "application/json",

                                    "X-Requested-With":
                                        "XMLHttpRequest",
                                },
                            }
                        );

                    const data =
                        response.data ||
                        {};

                    if (
                        !data.transaction_id
                    ) {
                        throw new Error(
                            "Backend tidak mengembalikan transaction_id."
                        );
                    }

                    setInstantpayPayment(
                        {
                            transaction_id:
                                data.transaction_id,

                            invoice:
                                data.invoice ||
                                null,

                            reference:
                                data.payment_reference ||
                                null,

                            payment_url:
                                data.payment_url ||
                                null,

                            qris_string:
                                data.qris_string ||
                                null,

                            status:
                                data.status ||
                                "pending",
                        }
                    );

                    setIsCheckingPayment(
                        true
                    );

                    setIsSubmitting(
                        false
                    );

                    toast.success(
                        "Pembayaran Instantpay dibuat. Menunggu pembayaran..."
                    );

                    return;
                } catch (
                    error
                ) {
                    console.error(
                        "Instantpay create error:",
                        error
                    );

                    setIsSubmitting(
                        false
                    );

                    toast.error(
                        error?.response
                            ?.data
                            ?.message ||
                            error?.message ||
                            "Gagal membuat pembayaran Instantpay"
                    );

                    return;
                }
            }

            /*
             * =====================================================
             * CASH / DEBIT
             * =====================================================
             */
            router.post(
                route(
                    "transactions.store"
                ),
                payload,
                {
                    preserveScroll:
                        true,

                    onSuccess:
                        () => {
                            resetTransactionForm();

                            toast.success(
                                "Transaksi berhasil!"
                            );
                        },

                    onError:
                        (errs) => {
                            setIsSubmitting(
                                false
                            );

                            toast.error(
                                errs?.message ||
                                    "Gagal menyimpan transaksi"
                            );
                        },

                    onFinish:
                        () => {
                            setIsSubmitting(
                                false
                            );
                        },
                }
            );
        };

    /*
     * ============================================================
     * FILTER PRODUCTS
     * ============================================================
     */
    const allProducts =
        useMemo(() => {
            return products.filter(
                (product) => {
                    const matchesCategory =
                        !selectedCategory ||
                        product.category_id ===
                            selectedCategory;

                    const matchesSearch =
                        !searchQuery ||
                        product.title
                            .toLowerCase()
                            .includes(
                                searchQuery.toLowerCase()
                            ) ||
                        product.barcode
                            ?.toLowerCase()
                            .includes(
                                searchQuery.toLowerCase()
                            );

                    return (
                        matchesCategory &&
                        matchesSearch
                    );
                }
            );
        }, [
            products,
            selectedCategory,
            searchQuery,
        ]);

    /*
     * ============================================================
     * RENDER
     * ============================================================
     */
    return (
        <>
            <Head title="Transaksi" />

            <div className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">

                {/* ==================================================
                    MOBILE TAB
                    ================================================== */}
                <div className="lg:hidden flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">

                    <button
                        onClick={() =>
                            setMobileView(
                                "products"
                            )
                        }
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                            mobileView ===
                            "products"
                                ? "text-primary-600 border-b-2 border-primary-500"
                                : "text-slate-500"
                        }`}
                    >
                        <IconShoppingCart
                            size={18}
                        />

                        <span>
                            Produk
                        </span>
                    </button>

                    <button
                        onClick={() =>
                            setMobileView(
                                "cart"
                            )
                        }
                        className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative ${
                            mobileView ===
                            "cart"
                                ? "text-primary-600 border-b-2 border-primary-500"
                                : "text-slate-500"
                        }`}
                    >
                        <IconReceipt
                            size={18}
                        />

                        <span>
                            Keranjang
                        </span>

                        {cartCount >
                            0 && (
                            <span className="absolute top-2 right-1/4 w-5 h-5 flex items-center justify-center text-xs font-bold bg-primary-500 text-white rounded-full">
                                {
                                    cartCount
                                }
                            </span>
                        )}
                    </button>
                </div>

                {/* ==================================================
                    PRODUCT AREA
                    ================================================== */}
                <div
                    className={`flex-1 bg-slate-100 dark:bg-slate-950 overflow-hidden ${
                        mobileView !==
                        "products"
                            ? "hidden lg:flex lg:flex-col"
                            : "flex flex-col"
                    }`}
                >
                    <ProductGrid
                        products={
                            allProducts
                        }
                        categories={
                            categories
                        }
                        selectedCategory={
                            selectedCategory
                        }
                        onCategoryChange={
                            setSelectedCategory
                        }
                        searchQuery={
                            searchQuery
                        }
                        onSearchChange={
                            setSearchQuery
                        }
                        isSearching={
                            isSearching
                        }
                        onAddToCart={
                            handleAddToCart
                        }
                        addingProductId={
                            addingProductId
                        }
                        searchInputRef={
                            searchInputRef
                        }
                    />
                </div>

                {/* ==================================================
                    CART / PAYMENT PANEL
                    ================================================== */}
                <div
                    className={`w-full lg:w-[420px] xl:w-[480px] flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 ${
                        mobileView !==
                        "cart"
                            ? "hidden lg:flex"
                            : "flex"
                    }`}
                    style={{
                        height:
                            "calc(100vh - 4rem)",
                    }}
                >

                    {/* CUSTOMER */}
                    {requiresCustomer && (
                        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
                            <CustomerSelect
                                customers={
                                    customers
                                }
                                selected={
                                    selectedCustomer
                                }
                                onSelect={
                                    setSelectedCustomer
                                }
                                placeholder="Pilih pelanggan..."
                                error={
                                    errors?.customer_id
                                }
                                label="Pelanggan"
                            />
                        </div>
                    )}

                    {/* ==================================================
                        PAY LATER LIST
                        ================================================== */}
                    {heldCarts.length >
                        0 && (
                        <HeldTransactions
                            heldCarts={
                                heldCarts
                            }
                            hasActiveCart={
                                carts.length >
                                0
                            }
                            onResume={(label) => {
                                setPayLaterLabel(
                                    String(
                                        label || ""
                                    ).trim()
                                );
                            }}
                        />
                    )}

                    <div className="flex-1 overflow-y-auto min-h-0">

                        {/* ==================================================
                            PAY LATER BUTTON
                            ================================================== */}
                        {carts.length >
                            0 && (
                            <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                                <HoldButton
                                    hasItems={
                                        carts.length >
                                        0
                                    }
                                    onHold={
                                        handleHoldCart
                                    }
                                    isHolding={
                                        isHolding
                                    }
                                    lastLabel={
                                        payLaterLabel
                                    }
                                />
                            </div>
                        )}

                        {/* ==================================================
                            ACTIVE CART
                            ================================================== */}
                        <div className="p-3 border-b border-slate-200 dark:border-slate-800">

                            <div className="flex items-center justify-between mb-3">

                                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <IconShoppingCart
                                        size={16}
                                    />

                                    Keranjang
                                </h3>

                                {carts.length >
                                    0 && (
                                    <span className="px-2 py-0.5 text-xs font-bold bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 rounded-full">
                                        {
                                            cartCount
                                        }{" "}
                                        item
                                    </span>
                                )}
                            </div>

                            {carts.length >
                            0 ? (
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">

                                    {carts.map(
                                        (
                                            item
                                        ) => {
                                            const draftValue =
                                                qtyDrafts[
                                                    item
                                                        .id
                                                ] ??
                                                String(
                                                    Math.max(
                                                        1,
                                                        Number(
                                                            item.qty
                                                        ) ||
                                                            1
                                                    )
                                                );

                                            const cartExtras =
                                                getCartExtras(item);

                                            const extrasTotal =
                                                getCartExtrasTotal(
                                                    item
                                                );

                                            const itemTotal =
                                                Number(
                                                    item.total ??
                                                        0
                                                ) ||
                                                Number(
                                                    item.price ?? 0
                                                ) +
                                                    extrasTotal;

                                            return (
                                                <div
                                                    key={
                                                        item.id
                                                    }
                                                    className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 group"
                                                >

                                                    {/* IMAGE */}
                                                    <div className="w-10 h-10 mt-0.5 rounded-lg bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">

                                                        {item
                                                            .product
                                                            ?.image ? (
                                                            <img
                                                                src={getProductImageUrl(
                                                                    item
                                                                        .product
                                                                        .image
                                                                )}
                                                                alt={
                                                                    item
                                                                        .product
                                                                        .title
                                                                }
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <IconShoppingCart
                                                                    size={
                                                                        14
                                                                    }
                                                                    className="text-slate-400"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* PRODUCT + EXTRAS */}
                                                    <div className="flex-1 min-w-0">

                                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
                                                            {item
                                                                .product
                                                                ?.title ||
                                                                "Produk"}
                                                        </p>

                                                        <p className="text-xs text-slate-500">
                                                            {formatPrice(
                                                                item
                                                                    .product
                                                                    ?.sell_price ||
                                                                    0
                                                            )}{" "}
                                                            ×{" "}
                                                            {
                                                                item.qty
                                                            }
                                                        </p>

                                                        {cartExtras.length >
                                                            0 && (
                                                            <div className="mt-1 space-y-0.5">
                                                                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                                                                    Extra:
                                                                </p>

                                                                {cartExtras.map(
                                                                    (
                                                                        extra
                                                                    ) => {
                                                                        const extraQty =
                                                                            Math.max(
                                                                                1,
                                                                                Number(
                                                                                    extra.qty
                                                                                ) ||
                                                                                    1
                                                                            );

                                                                        return (
                                                                            <div
                                                                                key={`${item.id}-extra-${extra.id}`}
                                                                                className="flex items-center justify-between gap-2 text-[10px] text-slate-500 dark:text-slate-400"
                                                                            >
                                                                                <span className="truncate">
                                                                                    +{" "}
                                                                                    {extra.name ||
                                                                                        "Extra"}{" "}
                                                                                    ×{" "}
                                                                                    {
                                                                                        extraQty
                                                                                    }
                                                                                </span>

                                                                                <span className="flex-shrink-0">
                                                                                    {formatPrice(
                                                                                        Number(
                                                                                            extra.price ||
                                                                                                0
                                                                                        ) *
                                                                                            extraQty *
                                                                                            Math.max(
                                                                                                1,
                                                                                                Number(
                                                                                                    item.qty
                                                                                                ) ||
                                                                                                    1
                                                                                            )
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    }
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* QTY */}
                                                    <div className="flex items-center gap-1 pt-0.5">

                                                        <button
                                                            onClick={() =>
                                                                handleUpdateQty(
                                                                    item.id,
                                                                    Math.max(
                                                                        1,
                                                                        Number(
                                                                            item.qty
                                                                        ) -
                                                                            1
                                                                    )
                                                                )
                                                            }
                                                            disabled={
                                                                Number(
                                                                    item.qty
                                                                ) <=
                                                                    1 ||
                                                                updatingCartId ===
                                                                    item.id
                                                            }
                                                            className="w-6 h-6 rounded flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 disabled:opacity-50 text-xs"
                                                        >
                                                            -
                                                        </button>

                                                        <input
                                                            type="text"
                                                            inputMode="numeric"
                                                            value={
                                                                draftValue
                                                            }
                                                            onChange={(
                                                                e
                                                            ) =>
                                                                handleQtyInputChange(
                                                                    item.id,
                                                                    e
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            onBlur={() =>
                                                                commitQtyInput(
                                                                    item
                                                                )
                                                            }
                                                            onKeyDown={(
                                                                e
                                                            ) => {
                                                                if (
                                                                    e.key ===
                                                                    "Enter"
                                                                ) {
                                                                    commitQtyInput(
                                                                        item
                                                                    );

                                                                    e.currentTarget.blur();
                                                                }
                                                            }}
                                                            className="w-12 h-6 text-center text-xs font-medium rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 [appearance:textfield]"
                                                        />

                                                        <button
                                                            onClick={() =>
                                                                handleUpdateQty(
                                                                    item.id,
                                                                    Number(
                                                                        item.qty
                                                                    ) +
                                                                        1
                                                                )
                                                            }
                                                            disabled={
                                                                updatingCartId ===
                                                                item.id
                                                            }
                                                            className="w-6 h-6 rounded flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 disabled:opacity-50 text-xs"
                                                        >
                                                            +
                                                        </button>

                                                        <button
                                                            onClick={() =>
                                                                handleRemoveFromCart(
                                                                    item.id
                                                                )
                                                            }
                                                            disabled={
                                                                removingItemId ===
                                                                item.id
                                                            }
                                                            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-950/50 ml-1"
                                                        >
                                                            <IconTrash
                                                                size={
                                                                    12
                                                                }
                                                            />
                                                        </button>

                                                    </div>

                                                    {/* TOTAL ITEM */}
                                                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 w-16 text-right pt-1">
                                                        {formatPrice(
                                                            itemTotal
                                                        )}
                                                    </p>

                                                </div>
                                            );
                                        }
                                    )}

                                </div>
                            ) : (
                                <div className="py-6 text-center">

                                    <IconShoppingCart
                                        size={
                                            32
                                        }
                                        className="mx-auto text-slate-300 dark:text-slate-600 mb-2"
                                    />

                                    <p className="text-sm text-slate-400">
                                        Keranjang kosong
                                    </p>

                                </div>
                            )}
                        </div>

                        {/* ==================================================
                            PAYMENT SETTINGS
                            ================================================== */}
                        <div className="p-3 space-y-4">

                            {/* PAYMENT METHOD */}
                            <div>

                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                                    Metode Pembayaran
                                </label>

                                <div className="grid grid-cols-2 gap-2">

                                    {paymentOptions.map(
                                        (
                                            method
                                        ) => (
                                            <button
                                                type="button"
                                                key={
                                                    method.value
                                                }
                                                onClick={() =>
                                                    setPaymentMethod(
                                                        method.value
                                                    )
                                                }
                                                className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                                                    paymentMethod ===
                                                    method.value
                                                        ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30"
                                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                                }`}
                                            >
                                                <div
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                                        paymentMethod ===
                                                        method.value
                                                            ? "bg-primary-500 text-white"
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                                                    }`}
                                                >
                                                    {method.value ===
                                                    "cash" ? (
                                                        <IconCash
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    ) : method.value ===
                                                      "instantpay" ? (
                                                        <IconQrcode
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    ) : (
                                                        <IconCreditCard
                                                            size={
                                                                16
                                                            }
                                                        />
                                                    )}
                                                </div>

                                                <div className="text-left">
                                                    <p
                                                        className={`text-sm font-semibold ${
                                                            paymentMethod ===
                                                            method.value
                                                                ? "text-primary-700 dark:text-primary-300"
                                                                : "text-slate-700 dark:text-slate-300"
                                                        }`}
                                                    >
                                                        {
                                                            method.label
                                                        }
                                                    </p>
                                                </div>
                                            </button>
                                        )
                                    )}

                                </div>
                            </div>

                            {/* QUICK CASH */}
                            {isCashPayment && (
                                <div>

                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                                        Nominal Cepat
                                    </label>

                                    <div className="grid grid-cols-4 gap-2">

                                        {[
                                            10000,
                                            20000,
                                            50000,
                                            100000,
                                        ].map(
                                            (
                                                amt
                                            ) => (
                                                <button
                                                    key={
                                                        amt
                                                    }
                                                    onClick={() =>
                                                        setCashInput(
                                                            String(
                                                                amt
                                                            )
                                                        )
                                                    }
                                                    className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all ${
                                                        Number(
                                                            cashInput
                                                        ) ===
                                                        amt
                                                            ? "bg-primary-500 text-white"
                                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                                                    }`}
                                                >
                                                    {formatPrice(
                                                        amt
                                                    )}
                                                </button>
                                            )
                                        )}

                                    </div>
                                </div>
                            )}

                            {/* PROMOTION */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
                                        Promotion
                                    </label>

                                    {selectedPromotion && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedPromotion(null);
                                                setPromotionCode("");
                                                setPromotionDiscount(0);
                                                setPromotionError("");
                                                setPromotionMessage("");
                                            }}
                                            className="text-xs font-medium text-danger-500 hover:text-danger-600"
                                        >
                                            Hapus
                                        </button>
                                    )}
                                </div>

                                <select
                                    value={
                                        selectedPromotion?.id ??
                                        ""
                                    }
                                    disabled={
                                        carts.length === 0
                                    }
                                    onChange={(e) => {
                                        const value =
                                            e.target.value;

                                        const promotion =
                                            promotions.find(
                                                (item) =>
                                                    String(
                                                        item.id
                                                    ) ===
                                                    String(
                                                        value
                                                    )
                                            );

                                        setSelectedPromotion(
                                            promotion ||
                                                null
                                        );
                                        setPromotionDiscount(
                                            0
                                        );
                                        setPromotionError(
                                            ""
                                        );
                                        setPromotionMessage(
                                            ""
                                        );

                                        if (
                                            promotion
                                                ?.type ===
                                            "voucher_nominal"
                                        ) {
                                            setPromotionCode(
                                                ""
                                            );
                                        } else {
                                            setPromotionCode(
                                                promotion?.code ||
                                                    ""
                                            );
                                        }
                                    }}
                                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:opacity-50"
                                >
                                    <option value="">
                                        Tidak menggunakan promotion
                                    </option>

                                    {promotions.map(
                                        (promotion) => (
                                            <option
                                                key={
                                                    promotion.id
                                                }
                                                value={
                                                    promotion.id
                                                }
                                            >
                                                {
                                                    promotion.name
                                                }
                                                {promotion.code
                                                    ? ` (${promotion.code})`
                                                    : ""}
                                            </option>
                                        )
                                    )}
                                </select>

                                {selectedPromotion &&
                                    (
                                        selectedPromotion.type ===
                                            "voucher_nominal" ||
                                        selectedPromotion.type ===
                                            "voucher"
                                    ) && (
                                        <input
                                            type="text"
                                            value={
                                                promotionCode
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setPromotionCode(
                                                    e.target.value
                                                        .trim()
                                                        .toUpperCase()
                                                )
                                            }
                                            placeholder="Masukkan kode voucher"
                                            className="w-full h-10 mt-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm uppercase focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                        />
                                    )}

                                {promotionError && (
                                    <p className="mt-2 text-xs text-danger-500">
                                        {
                                            promotionError
                                        }
                                    </p>
                                )}

                                {!promotionError &&
                                    promotionMessage && (
                                        <p className="mt-2 text-xs text-success-600 dark:text-success-400">
                                            {
                                                promotionMessage
                                            }
                                        </p>
                                    )}

                                {promotionDiscount >
                                    0 && (
                                    <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900">
                                        <span className="text-xs text-primary-700 dark:text-primary-300">
                                            Diskon promotion
                                        </span>
                                        <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                                            -
                                            {formatPrice(
                                                promotionDiscount
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* DISCOUNT */}
                            <div>

                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                                    Diskon (Rp)
                                </label>

                                <div className="relative">

                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                        Rp
                                    </span>

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={
                                            discountInput
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setDiscountInput(
                                                e.target.value.replace(
                                                    /[^\d]/g,
                                                    ""
                                                )
                                            )
                                        }
                                        placeholder="0"
                                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                    />

                                </div>
                            </div>

                            {/* CASH */}
                            {isCashPayment && (
                                <div>

                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                                        Jumlah Bayar (Rp)
                                    </label>

                                    <div className="relative">

                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                                            Rp
                                        </span>

                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={
                                                cashInput
                                            }
                                            onChange={(
                                                e
                                            ) =>
                                                setCashInput(
                                                    e.target.value.replace(
                                                        /[^\d]/g,
                                                        ""
                                                    )
                                                )
                                            }
                                            placeholder="0"
                                            className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-base font-semibold focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                                        />

                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* ==================================================
                        TOTAL
                        ================================================== */}
                    <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 p-3">

                        <div className="flex justify-between items-center mb-2 text-sm">

                            <span className="text-slate-500">
                                Subtotal
                            </span>

                            <span className="font-medium">
                                {formatPrice(
                                    subtotal
                                )}
                            </span>

                        </div>

                        {promotionDiscount >
                            0 && (
                            <div className="flex justify-between items-center mb-2 text-sm">
                                <span className="text-slate-500">
                                    Promotion
                                </span>

                                <span className="text-danger-500">
                                    -
                                    {formatPrice(
                                        promotionDiscount
                                    )}
                                </span>
                            </div>
                        )}

                        {manualDiscount >
                            0 && (
                            <div className="flex justify-between items-center mb-2 text-sm">
                                <span className="text-slate-500">
                                    Diskon
                                </span>

                                <span className="text-danger-500">
                                    -
                                    {formatPrice(
                                        manualDiscount
                                    )}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center mb-3">

                            <span className="font-semibold text-slate-800 dark:text-white">
                                Total
                            </span>

                            <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                {formatPrice(
                                    payable
                                )}
                            </span>

                        </div>

                        {isCashPayment &&
                            cash >=
                                payable &&
                            payable > 0 && (
                                <div className="flex justify-between items-center mb-3 p-2 rounded-lg bg-success-50 dark:bg-success-950/30">

                                    <span className="text-sm text-success-700 dark:text-success-400">
                                        Kembalian
                                    </span>

                                    <span className="font-bold text-success-600">
                                        {formatPrice(
                                            cash -
                                                payable
                                        )}
                                    </span>

                                </div>
                            )}

                        {/* SUBMIT */}
                        <button
                            onClick={
                                handleSubmitTransaction
                            }
                            disabled={
                                !carts.length ||
                                (
                                    requiresCustomer &&
                                    !selectedCustomer
                                ) ||
                                (
                                    isCashPayment &&
                                    cash <
                                        payable
                                ) ||
                                isSubmitting ||
                                Boolean(
                                    selectedPromotion &&
                                    promotionError
                                )
                            }
                            className={`w-full h-12 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                                carts.length &&
                                (
                                    !requiresCustomer ||
                                    selectedCustomer
                                ) &&
                                (
                                    !isCashPayment ||
                                    cash >=
                                        payable
                                )
                                    ? "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg shadow-primary-500/30"
                                    : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                            }`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <IconReceipt
                                        size={
                                            18
                                        }
                                    />

                                    <span>
                                        {!carts.length
                                            ? "Keranjang Kosong"
                                            : requiresCustomer &&
                                              !selectedCustomer
                                            ? "Pilih Pelanggan"
                                            : isCashPayment &&
                                              cash <
                                                  payable
                                            ? `Kurang ${formatPrice(
                                                  payable -
                                                      cash
                                              )}`
                                            : paymentMethod ===
                                              "instantpay"
                                            ? "Bayar dengan Instantpay"
                                            : "Selesaikan Transaksi"}
                                    </span>
                                </>
                            )}
                        </button>

                    </div>
                </div>
            </div>

            {/* ============================================================
                EXTRA PRODUCT MODAL
                ============================================================ */}
            {extraProduct && (
                <div className="fixed inset-0 z-[55] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
                        onClick={closeExtraModal}
                    />

                    <div className="relative w-full max-w-lg max-h-[90vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                        {/* HEADER */}
                        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="min-w-0 pr-3">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Pilih Extra
                                </h3>
                                <p className="text-sm text-slate-500 truncate mt-0.5">
                                    {extraProduct.title || "Produk"}
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={Boolean(addingProductId)}
                                onClick={closeExtraModal}
                                className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
                            >
                                <IconX size={20} />
                            </button>
                        </div>

                        {/* QTY PRODUK */}
                        <div className="flex-shrink-0 px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                                        Jumlah produk
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {formatPrice(
                                            extraProduct.sell_price || 0
                                        )} / item
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={Boolean(addingProductId)}
                                        onClick={() =>
                                            setExtraQty((prev) =>
                                                Math.max(
                                                    1,
                                                    Number(prev) - 1
                                                )
                                            )
                                        }
                                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-50"
                                    >
                                        <IconMinus size={16} />
                                    </button>

                                    <span className="w-8 text-center font-bold text-slate-800 dark:text-white">
                                        {extraQty}
                                    </span>

                                    <button
                                        type="button"
                                        disabled={Boolean(addingProductId)}
                                        onClick={() =>
                                            setExtraQty((prev) =>
                                                Number(prev) + 1
                                            )
                                        }
                                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-50"
                                    >
                                        <IconPlus size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* EXTRAS */}
                        <div className="flex-1 min-h-0 overflow-y-auto p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    Tambahan
                                </p>
                                <span className="text-xs text-slate-400">
                                    Opsional
                                </span>
                            </div>

                            <div className="space-y-2">
                                {getProductExtras(extraProduct).map(
                                    (extra) => {
                                        const qty = Number(
                                            selectedExtras[extra.id] || 0
                                        );
                                        const selected = qty > 0;

                                        return (
                                            <div
                                                key={extra.id}
                                                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                                                    selected
                                                        ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30"
                                                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                                                }`}
                                            >
                                                <button
                                                    type="button"
                                                    disabled={Boolean(addingProductId)}
                                                    onClick={() =>
                                                        toggleExtra(
                                                            extra.id
                                                        )
                                                    }
                                                    className={`w-6 h-6 flex-shrink-0 rounded-md border-2 flex items-center justify-center transition-all ${
                                                        selected
                                                            ? "bg-primary-500 border-primary-500 text-white"
                                                            : "border-slate-300 dark:border-slate-600"
                                                    }`}
                                                >
                                                    {selected && (
                                                        <span className="text-xs font-bold">
                                                            ✓
                                                        </span>
                                                    )}
                                                </button>

                                                <div
                                                    className="flex-1 min-w-0 cursor-pointer"
                                                    onClick={() =>
                                                        toggleExtra(
                                                            extra.id
                                                        )
                                                    }
                                                >
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                                                        {extra.name ||
                                                            extra.title ||
                                                            extra.product?.title ||
                                                            "Extra"}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        +
                                                        {formatPrice(
                                                            extra.price ??
                                                                extra.sell_price ??
                                                                0
                                                        )}
                                                    </p>
                                                </div>

                                                {selected && (
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            disabled={Boolean(addingProductId)}
                                                            onClick={() =>
                                                                changeExtraQty(
                                                                    extra.id,
                                                                    qty - 1
                                                                )
                                                            }
                                                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-50"
                                                        >
                                                            <IconMinus size={14} />
                                                        </button>

                                                        <span className="w-7 text-center text-sm font-bold text-slate-700 dark:text-slate-200">
                                                            {qty}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            disabled={Boolean(addingProductId)}
                                                            onClick={() =>
                                                                changeExtraQty(
                                                                    extra.id,
                                                                    qty + 1
                                                                )
                                                            }
                                                            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 disabled:opacity-50"
                                                        >
                                                            <IconPlus size={14} />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex-shrink-0 p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs text-slate-500">
                                    Extra terpilih
                                </span>
                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    {getProductExtras(extraProduct).reduce(
                                        (total, extra) =>
                                            total +
                                            Number(
                                                selectedExtras[extra.id] || 0
                                            ),
                                        0
                                    )} item
                                </span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    disabled={Boolean(addingProductId)}
                                    onClick={closeExtraModal}
                                    className="flex-1 h-11 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold disabled:opacity-50"
                                >
                                    Batal
                                </button>

                                <button
                                    type="button"
                                    disabled={Boolean(addingProductId)}
                                    onClick={confirmExtraProduct}
                                    className="flex-1 h-11 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {addingProductId ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <IconShoppingCart size={18} />
                                            Tambahkan
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================
                INSTANTPAY MODAL
                ============================================================ */}
            {instantpayPayment && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />

                    <div className="relative w-full max-w-lg h-[90vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
                        {/* HEADER */}
                        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Pembayaran QRIS
                                </h3>

                                {instantpayPayment.invoice && (
                                    <p className="mt-0.5 text-xs text-slate-500">
                                        {instantpayPayment.invoice}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                {isCheckingPayment && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30">
                                        <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                                            Menunggu
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* PAYMENT PAGE */}
                        <div className="flex-1 min-h-0 bg-slate-100 dark:bg-slate-950">
                            {instantpayPayment.payment_url ? (
                                <iframe
                                    src={instantpayPayment.payment_url}
                                    title="Pembayaran Instantpay"
                                    className="w-full h-full border-0 bg-white"
                                    allow="payment *; clipboard-write"
                                />
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center p-6 text-center">
                                    <IconQrcode
                                        size={48}
                                        className="text-primary-500 mb-4"
                                    />

                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        QRIS pembayaran tersedia, tetapi
                                        halaman pembayaran tidak tersedia.
                                    </p>

                                    {instantpayPayment.qris_string && (
                                        <div className="mt-4 w-full max-w-md">
                                            <div className="max-h-32 overflow-y-auto break-all rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 text-left text-xs text-slate-600 dark:text-slate-300">
                                                {instantpayPayment.qris_string}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* FOOTER */}
                        <div className="flex-shrink-0 p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
                                <div
                                    className={`w-2.5 h-2.5 rounded-full ${
                                        isCheckingPayment
                                            ? "bg-amber-500 animate-pulse"
                                            : "bg-slate-300"
                                    }`}
                                />

                                <span>
                                    Status pembayaran dicek otomatis setiap
                                    3 detik.
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsCheckingPayment(false);
                                    setInstantpayPayment(null);
                                    setIsSubmitting(false);
                                }}
                                className="w-full h-10 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================
                PRINT MODAL - TETAP DI HALAMAN POS
                ============================================================ */}
            {printInvoice?.url && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" />

                    <div className="relative w-full max-w-5xl h-[92vh] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col">
                        <div className="flex-shrink-0 h-14 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                            <div>
                                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                                    Cetak Struk
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {printInvoice.invoice}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setPrintInvoice(null)}
                                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium"
                            >
                                Kembali ke POS
                            </button>
                        </div>

                        <div className="flex-1 min-h-0 bg-slate-100 dark:bg-slate-950">
                            <iframe
                                src={printInvoice.url}
                                title={`Print ${printInvoice.invoice}`}
                                className="w-full h-full border-0 bg-white"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* ============================================================
                NUMPAD
                ============================================================ */}
            <NumpadModal
                isOpen={
                    numpadOpen
                }
                onClose={() =>
                    setNumpadOpen(
                        false
                    )
                }
                onConfirm={
                    handleNumpadConfirm
                }
                title="Jumlah Bayar"
                initialValue={
                    Number(
                        cashInput
                    ) || 0
                }
                isCurrency={
                    true
                }
            />

            {/* ============================================================
                KEYBOARD SHORTCUTS
                ============================================================ */}
            {showShortcuts && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

                    <div
                        className="absolute inset-0 bg-slate-900/60"
                        onClick={() =>
                            setShowShortcuts(
                                false
                            )
                        }
                    />

                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 max-w-sm w-full">

                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <IconKeyboard
                                size={
                                    24
                                }
                            />

                            Keyboard
                            Shortcuts
                        </h3>

                        <div className="space-y-3">

                            {[
                                [
                                    "F1",
                                    "Buka Numpad",
                                ],
                                [
                                    "F2",
                                    "Selesaikan Transaksi",
                                ],
                                [
                                    "F3",
                                    "Toggle Produk/Keranjang",
                                ],
                                [
                                    "F4",
                                    "Tampilkan Bantuan",
                                ],
                                [
                                    "Esc",
                                    "Tutup Modal",
                                ],
                            ].map(
                                ([
                                    key,
                                    desc,
                                ]) => (
                                    <div
                                        key={
                                            key
                                        }
                                        className="flex items-center justify-between"
                                    >
                                        <span className="text-slate-600 dark:text-slate-400">
                                            {
                                                desc
                                            }
                                        </span>

                                        <kbd className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono font-bold text-slate-700 dark:text-slate-300">
                                            {
                                                key
                                            }
                                        </kbd>
                                    </div>
                                )
                            )}

                        </div>

                        <button
                            onClick={() =>
                                setShowShortcuts(
                                    false
                                )
                            }
                            className="mt-6 w-full py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium"
                        >
                            Tutup
                        </button>

                    </div>
                </div>
            )}
        </>
    );
}

Index.layout = (
    page
) => (
    <POSLayout
        children={page}
    />
);