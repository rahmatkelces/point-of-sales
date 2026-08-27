import { Head, Link } from "@inertiajs/react";
import { getProductImageUrl } from "@/Utils/imageUrl";
import {
    IconShoppingCart,
    IconReceipt,
    IconUsers,
    IconChartBar,
    IconBox,
    IconArrowRight,
    IconCheck,
    IconDeviceMobile,
    IconCloudLock,
    IconReportMoney,
    IconBolt,
    IconDatabase,
    IconCreditCard,
} from "@tabler/icons-react";

export default function Welcome({ products = [] }) {
    const featuredProducts = Array.isArray(products)
        ? products.slice(0, 8)
        : [];
    const features = [
        {
            icon: IconShoppingCart,
            number: "01",
            title: "Transaksi Super Cepat",
            desc: "Checkout lebih singkat dengan alur kasir yang sederhana dan responsif.",
        },
        {
            icon: IconBox,
            number: "02",
            title: "Inventory Terintegrasi",
            desc: "Pantau stok, produk, kategori, dan barcode dari satu tempat.",
        },
        {
            icon: IconChartBar,
            number: "03",
            title: "Laporan Real-time",
            desc: "Lihat penjualan, keuntungan, dan performa bisnis kapan saja.",
        },
        {
            icon: IconUsers,
            number: "04",
            title: "Pelanggan & Riwayat",
            desc: "Simpan data pelanggan dan akses histori transaksi dengan mudah.",
        },
        {
            icon: IconReceipt,
            number: "05",
            title: "Struk Profesional",
            desc: "Siap untuk thermal printer 58mm, 80mm, maupun invoice.",
        },
        {
            icon: IconCreditCard,
            number: "06",
            title: "Multi Payment",
            desc: "Mendukung tunai, QRIS, dan pembayaran digital untuk kebutuhan bisnis.",
        },
    ];

    const stats = [
        ["01", "Kasir", "Transaksi lebih cepat"],
        ["02", "Inventory", "Stok lebih terkontrol"],
        ["03", "Analytics", "Data lebih mudah dibaca"],
    ];

    return (
        <>
            <Head title="GemilangPro — Point of Sale Modern" />

            <div className="min-h-screen overflow-x-hidden bg-[#f7f8fc] text-slate-900 dark:bg-[#080b12] dark:text-white">
                {/* NAVBAR */}
                <nav className="fixed left-0 right-0 top-0 z-50 px-4 pt-4 md:px-8">
                    <div className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/70 bg-white/80 px-5 py-3 shadow-xl shadow-slate-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/80">
                        <Link href="/" className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950">
                                <IconShoppingCart size={21} stroke={2.2} />
                            </div>
                            <div>
                                <div className="text-base font-black tracking-tight">GemilangPro</div>
                                <div className="hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:block">
                                    Point of Sale
                                </div>
                            </div>
                        </Link>

                        <div className="hidden items-center gap-8 md:flex">
                            <a href="#products" className="text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
                                Produk
                            </a>
                            <a href="#features" className="text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
                                Fitur
                            </a>
                            <a href="#showcase" className="text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
                                Showcase
                            </a>
                            <a href="#tech" className="text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white">
                                Teknologi
                            </a>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                href="/login"
                                className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 sm:block dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                                Masuk
                            </Link>
                            <Link
                                href="/register"
                                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                            >
                                Mulai Gratis
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* HERO */}
                <section className="relative px-5 pb-24 pt-36 md:px-8 md:pb-32 md:pt-44">
                    <div className="absolute left-1/2 top-20 -z-0 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-primary-200/40 blur-[120px] dark:bg-primary-900/20" />
                    <div className="absolute right-[-180px] top-[420px] -z-0 h-[380px] w-[380px] rounded-full bg-violet-200/40 blur-[110px] dark:bg-violet-900/20" />

                    <div className="relative z-10 mx-auto max-w-7xl">
                        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
                            <div>
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                                    <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
                                    POS MODERN UNTUK BISNIS MODERN
                                </div>

                                <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.045em] text-slate-950 sm:text-6xl md:text-7xl dark:text-white">
                                    Kasir lebih cepat.
                                    <span className="mt-2 block text-primary-600 dark:text-primary-400">
                                        Bisnis lebih terkontrol.
                                    </span>
                                </h1>

                                <p className="mt-7 max-w-xl text-base leading-8 text-slate-600 md:text-lg dark:text-slate-400">
                                    Platform Point of Sale yang membantu Anda mengelola
                                    transaksi, inventory, pelanggan, pembayaran, dan laporan
                                    dalam satu sistem yang rapi.
                                </p>

                                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                                    <Link
                                        href="/register"
                                        className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-primary-600 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-primary-600/25 transition hover:-translate-y-1 hover:bg-primary-700"
                                    >
                                        Mulai Sekarang
                                        <IconArrowRight size={18} className="transition group-hover:translate-x-1" />
                                    </Link>
                                    <a
                                        href="#showcase"
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    >
                                        Lihat Preview
                                    </a>
                                </div>

                                <div className="mt-9 grid max-w-xl grid-cols-3 gap-4 border-t border-slate-200 pt-7 dark:border-slate-800">
                                    {stats.map(([num, title, desc]) => (
                                        <div key={num}>
                                            <div className="text-xs font-black text-primary-600">{num}</div>
                                            <div className="mt-1 text-sm font-bold">{title}</div>
                                            <div className="mt-1 text-[11px] leading-4 text-slate-400">{desc}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* EXISTING IMAGE — tetap dipakai */}
                            <div className="relative">
                                <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-primary-500/20 via-violet-500/10 to-transparent blur-2xl" />
                                <div className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_35px_100px_-35px_rgba(15,23,42,0.45)] dark:border-slate-700 dark:bg-slate-900">
                                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
                                        <div className="flex gap-1.5">
                                            <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                                            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                                            <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-400">
                                            gemilangpro.local/dashboard
                                        </span>
                                        <span className="w-8" />
                                    </div>
                                    <img
                                        src="/media/revamp-pos.png"
                                        alt="Preview POS Dashboard"
                                        className="block w-full"
                                    />
                                </div>

                                <div className="absolute -bottom-7 -left-5 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:block dark:border-slate-700 dark:bg-slate-900">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40">
                                            <IconBolt size={20} />
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-slate-400">Performa</div>
                                            <div className="text-sm font-black">Fast & Responsive</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* LOGO / TRUST STRIP */}
                <section className="border-y border-slate-200 bg-white/70 px-5 py-7 dark:border-slate-800 dark:bg-slate-900/50">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 md:flex-row">
                        <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                            Dibangun untuk operasional sehari-hari
                        </div>
                        <div className="flex flex-wrap justify-center gap-3">
                            {["TRANSAKSI", "INVENTORY", "CUSTOMER", "REPORT", "PAYMENT"].map((item) => (
                                <span
                                    key={item}
                                    className="rounded-full border border-slate-200 px-4 py-2 text-[10px] font-black tracking-wider text-slate-500 dark:border-slate-700 dark:text-slate-400"
                                >
                                    {item}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PRODUCTS */}
                {featuredProducts.length > 0 && (
                    <section id="products" className="px-5 py-24 md:px-8 md:py-32">
                        <div className="mx-auto max-w-7xl">
                            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                                <div className="max-w-2xl">
                                    <div className="text-xs font-black uppercase tracking-[0.2em] text-primary-600">
                                        Produk Unggulan
                                    </div>
                                    <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                                        Produk siap dijual.
                                    </h2>
                                    <p className="mt-5 leading-7 text-slate-500 dark:text-slate-400">
                                        Kelola produk, harga, kategori, stok, dan barcode
                                        langsung dari sistem GemilangPro.
                                    </p>
                                </div>

                                <Link
                                    href="/login"
                                    className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:text-primary-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                >
                                    Kelola Produk
                                    <IconArrowRight size={17} />
                                </Link>
                            </div>

                            <div className="mt-12 grid gap-5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                                {featuredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900"
                                    >
                                        <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                                            {product.image ? (
                                                <img
                                                    src={getProductImageUrl(product.image)}
                                                    alt={product.title || "Produk"}
                                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
                                                    <IconBox size={42} />
                                                </div>
                                            )}

                                            {product.category?.name && (
                                                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 shadow-sm backdrop-blur dark:bg-slate-950/90 dark:text-slate-300">
                                                    {product.category.name}
                                                </span>
                                            )}
                                        </div>

                                        <div className="p-4">
                                            <h3 className="truncate text-sm font-black text-slate-900 dark:text-white">
                                                {product.title || "Produk"}
                                            </h3>

                                            <div className="mt-2 flex items-center justify-between gap-2">
                                                <span className="text-base font-black text-primary-600 dark:text-primary-400">
                                                    {Number(product.sell_price || 0).toLocaleString("id-ID", {
                                                        style: "currency",
                                                        currency: "IDR",
                                                        minimumFractionDigits: 0,
                                                    })}
                                                </span>

                                                {product.stock !== undefined && (
                                                    <span className="text-[10px] font-semibold text-slate-400">
                                                        Stok {product.stock}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* FEATURES */}
                <section id="features" className="px-5 py-24 md:px-8 md:py-32">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr]">
                            <div className="lg:sticky lg:top-28 lg:self-start">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-primary-600">
                                    Powerful Features
                                </div>
                                <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                                    Semua yang bisnis Anda butuhkan.
                                </h2>
                                <p className="mt-5 max-w-md leading-7 text-slate-500 dark:text-slate-400">
                                    Dirancang agar tim bisa bekerja lebih cepat tanpa harus
                                    berhadapan dengan sistem yang rumit.
                                </p>

                                <div className="mt-8 flex items-center gap-3 text-sm font-semibold">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-950/50">
                                        <IconCheck size={17} />
                                    </div>
                                    Satu dashboard untuk semuanya
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                {features.map((feature) => (
                                    <div
                                        key={feature.number}
                                        className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-2xl hover:shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-primary-800"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white transition group-hover:bg-primary-600 dark:bg-white dark:text-slate-950 dark:group-hover:bg-primary-500 dark:group-hover:text-white">
                                                <feature.icon size={23} />
                                            </div>
                                            <span className="text-xs font-black text-slate-300 dark:text-slate-700">
                                                {feature.number}
                                            </span>
                                        </div>
                                        <h3 className="mt-7 text-lg font-black">{feature.title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                            {feature.desc}
                                        </p>
                                        <div className="mt-6 h-px w-10 bg-primary-500 transition-all group-hover:w-20" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* SHOWCASE */}
                <section id="showcase" className="bg-slate-950 px-5 py-24 text-white md:px-8 md:py-32">
                    <div className="mx-auto max-w-7xl">
                        <div className="max-w-2xl">
                            <div className="text-xs font-black uppercase tracking-[0.2em] text-primary-400">
                                Product Showcase
                            </div>
                            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                                Dari kasir sampai dashboard.
                            </h2>
                            <p className="mt-5 leading-7 text-slate-400">
                                Lihat bagaimana tampilan POS dan dashboard dirancang agar
                                informasi penting selalu mudah ditemukan.
                            </p>
                        </div>

                        <div className="mt-14 grid gap-6 lg:grid-cols-2">
                            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-2xl">
                                <div className="border-b border-white/10 px-5 py-4">
                                    <span className="text-sm font-bold">POS Interface</span>
                                </div>
                                <img
                                    src="/media/revamp-pos.png"
                                    alt="POS Revamp"
                                    className="block w-full"
                                />
                            </div>

                            <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-2xl">
                                <div className="border-b border-white/10 px-5 py-4">
                                    <span className="text-sm font-bold">Dashboard Analytics</span>
                                </div>
                                <img
                                    src="/media/revamp-dashboard.png"
                                    alt="Dashboard Revamp"
                                    className="block w-full"
                                />
                            </div>
                        </div>

                        <div className="mt-16 grid gap-4 md:grid-cols-3">
                            {[
                                [IconDeviceMobile, "Mobile Friendly", "Tetap nyaman digunakan di berbagai ukuran layar."],
                                [IconCloudLock, "Secure by Design", "Struktur aplikasi siap untuk kebutuhan bisnis."],
                                [IconDatabase, "Data Terpusat", "Informasi operasional tersimpan dalam satu sistem."],
                            ].map(([Icon, title, desc]) => (
                                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                                    <Icon size={22} className="text-primary-400" />
                                    <h3 className="mt-5 font-bold">{title}</h3>
                                    <p className="mt-2 text-sm leading-6 text-slate-400">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* BEFORE AFTER */}
                <section className="px-5 py-24 md:px-8 md:py-32">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <div className="text-xs font-black uppercase tracking-[0.2em] text-primary-600">
                                Evolution
                            </div>
                            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
                                Evolusi tampilan, pengalaman yang lebih baik.
                            </h2>
                        </div>

                        <div className="mt-14 grid gap-6 lg:grid-cols-2">
                            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                                <div className="flex items-center justify-between px-3 py-3">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Version 1.0</span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800">OLD</span>
                                </div>
                                <div className="space-y-3 overflow-hidden rounded-xl">
                                    <img src="/media/readme-pos.png" alt="POS V1" className="block w-full" />
                                    <img src="/media/readme-dashboard.png" alt="Dashboard V1" className="block w-full" />
                                </div>
                            </div>

                            <div className="rounded-[1.5rem] border-2 border-primary-500/50 bg-white p-3 shadow-2xl shadow-primary-500/10 dark:bg-slate-900">
                                <div className="flex items-center justify-between px-3 py-3">
                                    <span className="text-xs font-black uppercase tracking-widest text-primary-600">Revamp 2.0</span>
                                    <span className="rounded-full bg-primary-50 px-3 py-1 text-[10px] font-bold text-primary-600 dark:bg-primary-950/50">NEW</span>
                                </div>
                                <div className="space-y-3 overflow-hidden rounded-xl">
                                    <img src="/media/revamp-pos.png" alt="POS Revamp" className="block w-full" />
                                    <img src="/media/revamp-dashboard.png" alt="Dashboard Revamp" className="block w-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* TECH */}
                <section id="tech" className="border-y border-slate-200 bg-white px-5 py-20 dark:border-slate-800 dark:bg-slate-900 md:px-8">
                    <div className="mx-auto max-w-7xl text-center">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-primary-600">
                            Technology
                        </div>
                        <h2 className="mt-4 text-3xl font-black tracking-tight md:text-4xl">
                            Dibangun dengan stack modern.
                        </h2>

                        <div className="mt-10 flex flex-wrap justify-center gap-3">
                            {["Laravel 12", "Inertia.js", "React", "TailwindCSS", "MySQL"].map((tech) => (
                                <div
                                    key={tech}
                                    className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                >
                                    {tech}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="px-5 py-24 md:px-8 md:py-32">
                    <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-primary-600 px-7 py-14 text-center text-white shadow-2xl shadow-primary-600/25 md:px-14 md:py-20">
                        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-3xl" />
                        <div className="relative">
                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                                <IconShoppingCart size={26} />
                            </div>
                            <h2 className="mt-7 text-4xl font-black tracking-tight md:text-5xl">
                                Siap membuat bisnis lebih rapi?
                            </h2>
                            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/80">
                                Mulai gunakan sistem kasir modern untuk mengelola operasional
                                bisnis dengan lebih cepat dan terukur.
                            </p>
                            <Link
                                href="/register"
                                className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-sm font-black text-primary-700 shadow-xl transition hover:-translate-y-1"
                            >
                                Daftar Gratis Sekarang
                                <IconArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="border-t border-slate-200 px-5 py-8 dark:border-slate-800 md:px-8">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                <IconShoppingCart size={17} />
                            </div>
                            <div>
                                <div className="text-sm font-black">GemilangPro</div>
                                <div className="text-[10px] text-slate-400">Point of Sale Modern</div>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400">
                            © {new Date().getFullYear()} GemilangPro. Built for modern business.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}
