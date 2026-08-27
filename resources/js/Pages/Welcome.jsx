import { Head, Link } from "@inertiajs/react";
import { getProductImageUrl } from "@/Utils/imageUrl";
import {
    IconArrowRight,
    IconClock,
    IconCoffee,
    IconMapPin,
    IconPhone,
    IconSoup,
    IconStar,
    IconFlame,
    IconHeart,
    IconPlus,
} from "@tabler/icons-react";

export default function Welcome({ products = [] }) {
    const menu = Array.isArray(products) ? products.slice(0, 8) : [];

    const fallbackMenu = [
        {
            id: "mie-rebus",
            title: "Mie Rebus Spesial",
            sell_price: 12000,
            image: null,
            category: { name: "Mie" },
        },
        {
            id: "mie-goreng",
            title: "Mie Goreng Spesial",
            sell_price: 12000,
            image: null,
            category: { name: "Mie" },
        },
        {
            id: "mie-tek-tek",
            title: "Mie Tek-Tek",
            sell_price: 13000,
            image: null,
            category: { name: "Mie" },
        },
        {
            id: "indomie-kuah",
            title: "Indomie Kuah Telur",
            sell_price: 10000,
            image: null,
            category: { name: "Mie" },
        },
    ];

    const displayedMenu = menu.length > 0 ? menu : fallbackMenu;

    const categories = ["Semua", "Mie", "Minuman", "Topping", "Snack"];

    return (
        <>
            <Head title="Sample Warmindo — Mie Enak, Harga Bersahabat" />

            <div className="min-h-screen overflow-x-hidden bg-[#fff9ed] text-[#3b2417]">
                {/* NAVBAR */}
                <nav className="fixed left-0 right-0 top-0 z-50 px-3 pt-3 sm:px-5 md:px-8">
                    <div className="mx-auto flex max-w-7xl items-center justify-between rounded-[1.5rem] border border-[#f1d68e] bg-[#fff9e9]/95 px-4 py-3 shadow-[0_12px_35px_rgba(72,42,14,.10)] backdrop-blur-xl sm:px-6">
                        <a href="#" className="flex items-center gap-2.5">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ef3b22] text-white shadow-lg shadow-[#ef3b22]/20">
                                <IconSoup size={25} stroke={2} />
                            </div>
                            <div>
                                <div className="text-[17px] font-black leading-none">
                                    Sample <span className="text-[#ef3b22]">Warmindo</span>
                                </div>
                                <div className="mt-1 text-[9px] font-bold uppercase tracking-[.16em] text-[#95745c]">
                                    Mie Enak • Harga Bersahabat
                                </div>
                            </div>
                        </a>

                        <div className="hidden items-center gap-8 lg:flex">
                            <a href="#home" className="text-sm font-black text-[#ef3b22]">Beranda</a>
                            <a href="#menu" className="text-sm font-bold text-[#634833] transition hover:text-[#ef3b22]">Menu</a>
                            <a href="#tentang" className="text-sm font-bold text-[#634833] transition hover:text-[#ef3b22]">Tentang Kami</a>
                            <a href="#promo" className="text-sm font-bold text-[#634833] transition hover:text-[#ef3b22]">Promo</a>
                            <a href="#lokasi" className="text-sm font-bold text-[#634833] transition hover:text-[#ef3b22]">Lokasi</a>
                        </div>

                        <a
                            href="#menu"
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#ef3b22] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-[#ef3b22]/20 transition hover:-translate-y-0.5 hover:bg-[#d9311b]"
                        >
                            Lihat Menu
                            <IconArrowRight size={16} />
                        </a>
                    </div>
                </nav>

                {/* HERO */}
                <section id="home" className="relative overflow-hidden px-5 pb-20 pt-32 md:px-8 md:pb-24 md:pt-40">
                    <div className="absolute inset-0 -z-10 bg-[#ffd449]" />
                    <div className="absolute inset-0 -z-10 opacity-40 bg-[radial-gradient(circle_at_15%_20%,#fff7c9,transparent_25%),radial-gradient(circle_at_90%_30%,#f08b2e,transparent_28%)]" />

                    <div className="absolute left-[7%] top-32 hidden rotate-12 text-[#f0ad29]/50 md:block">
                        <IconSoup size={75} stroke={1.2} />
                    </div>
                    <div className="absolute right-[35%] top-28 hidden -rotate-12 text-[#ef8b24]/40 lg:block">
                        <IconFlame size={55} />
                    </div>
                    <div className="absolute bottom-12 left-[42%] hidden rotate-12 text-[#ef8b24]/40 md:block">
                        <IconSoup size={48} />
                    </div>

                    <div className="mx-auto max-w-7xl">
                        <div className="grid items-center gap-10 lg:grid-cols-[.95fr_1.05fr]">
                            <div className="relative z-10">
                                <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#ef3b22] px-4 py-2 text-xs font-black text-white shadow-lg">
                                    <IconFlame size={14} />
                                    WARMINDO FAVORIT ANAK NONGKRONG
                                </div>

                                <h1 className="max-w-2xl text-5xl font-black leading-[.94] tracking-[-.045em] text-[#3b2417] sm:text-6xl md:text-7xl">
                                    Mie Enak,
                                    <span className="block">
                                        Harga <span className="text-[#ef3b22]">Bersahabat!</span>
                                    </span>
                                </h1>

                                <p className="mt-7 max-w-xl text-base font-medium leading-8 text-[#68472e] md:text-lg">
                                    Mau mie kuah, mie goreng, topping melimpah,
                                    atau sekadar nongkrong sambil ngopi?
                                    <strong className="font-black text-[#3b2417]"> Semua ada di sini.</strong>
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                    <a
                                        href="#menu"
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ef3b22] px-7 py-4 text-sm font-black text-white shadow-xl shadow-[#ef3b22]/25 transition hover:-translate-y-1"
                                    >
                                        Lihat Menu Kami
                                        <IconArrowRight size={18} />
                                    </a>

                                    <a
                                        href="#lokasi"
                                        className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[#3b2417]/10 bg-[#fff8df] px-7 py-4 text-sm font-black text-[#3b2417] transition hover:-translate-y-1 hover:bg-white"
                                    >
                                        <IconMapPin size={18} className="text-[#ef3b22]" />
                                        Cari Lokasi
                                    </a>
                                </div>

                                <div className="mt-8 flex flex-wrap gap-5 text-xs font-black text-[#60442e]">
                                    <span className="flex items-center gap-1.5">
                                        <IconStar size={16} className="fill-[#ef3b22] text-[#ef3b22]" />
                                        Rasa Mantap
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <IconHeart size={16} className="fill-[#ef3b22] text-[#ef3b22]" />
                                        Porsi Kenyang
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <IconFlame size={16} className="text-[#ef3b22]" />
                                        Selalu Fresh
                                    </span>
                                </div>
                            </div>

                            {/* HERO FOOD ILLUSTRATION */}
                            <div className="relative mx-auto w-full max-w-2xl">
                                <div className="absolute -inset-8 rounded-full bg-white/30 blur-3xl" />

                                <div className="relative min-h-[390px] md:min-h-[500px]">
                                    <div className="absolute right-3 top-3 z-20 rotate-3 rounded-2xl border-2 border-[#8e602c]/20 bg-[#fff4ce] px-5 py-4 text-center shadow-xl md:right-10">
                                        <div className="text-3xl font-black leading-none text-[#298047]">MIE</div>
                                        <div className="text-3xl font-black leading-none text-[#ef3b22]">ENAK</div>
                                        <div className="mt-1 text-[11px] font-black text-[#3b2417]">
                                            HARGA BERSAHABAT
                                        </div>
                                    </div>

                                    <div className="absolute left-0 top-4 z-20 rounded-2xl border border-[#e3c475] bg-[#fff7dc] p-5 shadow-xl md:left-4 md:top-10">
                                        <div className="text-[11px] font-black uppercase tracking-wider text-[#ef3b22]">
                                            Daftar Menu
                                        </div>
                                        <div className="mt-2 space-y-1.5 text-sm font-black">
                                            <div className="flex w-40 justify-between"><span>Mie Rebus</span><span>8K</span></div>
                                            <div className="flex w-40 justify-between"><span>Mie Goreng</span><span>9K</span></div>
                                            <div className="flex w-40 justify-between"><span>Mie Tek-Tek</span><span>10K</span></div>
                                            <div className="flex w-40 justify-between"><span>Indomie Kuah</span><span>10K</span></div>
                                        </div>
                                        <div className="mt-3 text-[10px] font-black text-[#ef3b22]">
                                            Tambah topping sesuka kamu!
                                        </div>
                                    </div>

                                    {/* Decorative bowl */}
                                    <div className="absolute bottom-1 left-1/2 h-[285px] w-[285px] -translate-x-1/2 rounded-[50%] bg-white shadow-[0_25px_45px_rgba(71,39,14,.25)] sm:h-[340px] sm:w-[340px]">
                                        <div className="absolute inset-7 rounded-[50%] bg-[#d59a2a]" />
                                        <div className="absolute inset-12 overflow-hidden rounded-[48%] bg-[#c97726]">
                                            <div className="absolute left-[17%] top-[30%] h-28 w-32 rotate-[-18deg] rounded-[50%] bg-[#e4a33c]" />
                                            <div className="absolute right-[12%] top-[18%] h-24 w-24 rounded-full bg-[#fff3bd] shadow-[inset_0_0_0_7px_#f1d56d]" />
                                            <div className="absolute right-[23%] top-[31%] h-8 w-8 rounded-full bg-[#ef6b22]" />
                                            <div className="absolute bottom-[18%] left-[14%] h-10 w-20 rotate-[-12deg] rounded-full bg-[#3f9848]" />
                                            <div className="absolute bottom-[14%] left-[42%] h-8 w-20 rotate-[8deg] rounded-full bg-[#f1d13d]" />
                                            <div className="absolute bottom-[23%] right-[8%] h-9 w-16 rotate-[-15deg] rounded-full bg-[#3f9848]" />
                                            <div className="absolute left-[35%] top-[16%] h-10 w-24 rotate-[28deg] rounded-full bg-[#c67a25]" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-5 left-0 z-30 rounded-2xl bg-[#ef3b22] px-5 py-3 text-white shadow-xl md:left-8">
                                        <div className="flex items-center gap-2">
                                            <IconFlame size={18} />
                                            <span className="text-xs font-black">NAMPOL BANGET!</span>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-6 right-0 z-30 rounded-2xl border border-[#ebd49b] bg-white p-3 shadow-xl md:right-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf6df] text-[#298047]">
                                                <IconCoffee size={18} />
                                            </div>
                                            <div>
                                                <div className="text-[9px] font-bold text-[#9b8068]">MINUMAN</div>
                                                <div className="text-sm font-black">Es Teh Manis</div>
                                                <div className="text-xs font-black text-[#ef3b22]">3K</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* MENU */}
                <section id="menu" className="bg-[#fffdf7] px-5 py-20 md:px-8 md:py-28">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <div className="text-xs font-black uppercase tracking-[.22em] text-[#ef3b22]">
                                Menu Andalan
                            </div>
                            <h2 className="mt-3 text-4xl font-black tracking-tight text-[#3b2417] md:text-5xl">
                                Pilih Favoritmu
                            </h2>
                            <p className="mx-auto mt-4 max-w-xl leading-7 text-[#80634e]">
                                Dari mie sederhana sampai topping yang bikin nagih,
                                pilih sesukamu.
                            </p>
                        </div>

                        <div className="mt-8 flex flex-wrap justify-center gap-2">
                            {categories.map((category, index) => (
                                <button
                                    key={category}
                                    className={`rounded-full px-5 py-2.5 text-xs font-black transition ${
                                        index === 0
                                            ? "bg-[#ef3b22] text-white shadow-md"
                                            : "border border-[#ead6a2] bg-[#fff9ed] text-[#6d5039] hover:border-[#ef3b22] hover:text-[#ef3b22]"
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                            {displayedMenu.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="group overflow-hidden rounded-[1.5rem] border border-[#efdfb9] bg-white shadow-[0_8px_25px_rgba(84,48,17,.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(84,48,17,.13)]"
                                >
                                    <div className="relative aspect-square overflow-hidden bg-[#f5e9ca]">
                                        {product.image ? (
                                            <img
                                                src={getProductImageUrl(product.image)}
                                                alt={product.title || "Menu"}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-[#c7a776]">
                                                <IconSoup size={55} stroke={1.3} />
                                            </div>
                                        )}

                                        <span className="absolute left-3 top-3 rounded-full bg-[#ef3b22] px-3 py-1.5 text-[9px] font-black uppercase text-white shadow-sm">
                                            {index === 0 ? "Favorit" : index === 1 ? "Terlaris" : product.category?.name || "Menu"}
                                        </span>
                                    </div>

                                    <div className="p-4">
                                        <h3 className="truncate text-sm font-black text-[#3b2417] sm:text-base">
                                            {product.title || "Menu Warmindo"}
                                        </h3>

                                        <div className="mt-2 flex items-center justify-between gap-2">
                                            <span className="text-base font-black text-[#ef3b22]">
                                                {Number(product.sell_price || 0).toLocaleString("id-ID", {
                                                    style: "currency",
                                                    currency: "IDR",
                                                    minimumFractionDigits: 0,
                                                })}
                                            </span>

                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff0d4] text-[#ef3b22]">
                                                <IconPlus size={17} stroke={3} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ABOUT */}
                <section id="tentang" className="px-5 py-20 md:px-8 md:py-28">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid items-center gap-12 lg:grid-cols-2">
                            <div className="relative overflow-hidden rounded-[2.5rem] bg-[#ef3b22] p-8 text-white md:p-12">
                                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#ffd449]/30 blur-2xl" />
                                <div className="relative">
                                    <div className="text-xs font-black uppercase tracking-[.2em] text-[#ffd449]">
                                        Cerita Kami
                                    </div>
                                    <h2 className="mt-4 text-4xl font-black leading-tight md:text-5xl">
                                        Bukan cuma tempat makan mie.
                                    </h2>
                                    <p className="mt-5 leading-7 text-white/80">
                                        Sample Warmindo hadir buat jadi tempat
                                        makan, tempat nongkrong, tempat cerita,
                                        dan tempat mengisi perut tanpa bikin dompet
                                        ikut nangis.
                                    </p>
                                    <div className="mt-8 grid grid-cols-3 gap-3">
                                        <div className="rounded-2xl bg-white/10 p-4">
                                            <div className="text-2xl font-black">10+</div>
                                            <div className="mt-1 text-[10px] font-bold text-white/65">Menu</div>
                                        </div>
                                        <div className="rounded-2xl bg-white/10 p-4">
                                            <div className="text-2xl font-black">4.9</div>
                                            <div className="mt-1 text-[10px] font-bold text-white/65">Rating</div>
                                        </div>
                                        <div className="rounded-2xl bg-white/10 p-4">
                                            <div className="text-2xl font-black">24H</div>
                                            <div className="mt-1 text-[10px] font-bold text-white/65">Nongkrong</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <div className="text-xs font-black uppercase tracking-[.2em] text-[#ef3b22]">
                                    Kenapa ke Sini?
                                </div>
                                <h2 className="mt-4 text-4xl font-black tracking-tight text-[#3b2417] md:text-5xl">
                                    Makan enak,
                                    <span className="block text-[#ef3b22]">nggak perlu mahal.</span>
                                </h2>

                                <div className="mt-8 space-y-5">
                                    {[
                                        ["🍜", "Mie dibuat saat dipesan", "Disajikan hangat dan fresh setiap saat."],
                                        ["🥚", "Topping bebas pilih", "Mau telur, kornet, sosis, bakso? Tinggal tambah."],
                                        ["☕", "Teman nongkrong", "Ada minuman dan suasana santai buat ngobrol."],
                                        ["❤️", "Harga bersahabat", "Porsi kenyang dengan harga yang tetap nyaman."],
                                    ].map(([emoji, title, desc]) => (
                                        <div key={title} className="flex gap-4">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0d4] text-xl">
                                                {emoji}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-[#3b2417]">{title}</h3>
                                                <p className="mt-1 text-sm leading-6 text-[#80634e]">{desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PROMO */}
                <section id="promo" className="px-5 py-4 md:px-8">
                    <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] bg-[#3b2417] px-7 py-12 text-white md:px-14 md:py-14">
                        <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-[#ef3b22] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider">
                                    <IconFlame size={13} />
                                    Promo Hari Ini
                                </div>
                                <h2 className="mt-4 text-3xl font-black md:text-4xl">
                                    Mie + Telur + Es Teh
                                    <span className="block text-[#ffd449]">Mulai 15 Ribuan!</span>
                                </h2>
                                <p className="mt-3 max-w-xl text-sm leading-6 text-[#d7c2aa]">
                                    Cocok buat makan siang, makan malam, atau
                                    nongkrong sampai lupa waktu.
                                </p>
                            </div>

                            <a
                                href="#menu"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ffd449] px-7 py-4 text-sm font-black text-[#3b2417] transition hover:-translate-y-1"
                            >
                                Cek Menu
                                <IconArrowRight size={18} />
                            </a>
                        </div>
                    </div>
                </section>

                {/* LOCATION */}
                <section id="lokasi" className="px-5 py-20 md:px-8 md:py-28">
                    <div className="mx-auto max-w-7xl">
                        <div className="text-center">
                            <div className="text-xs font-black uppercase tracking-[.2em] text-[#ef3b22]">
                                Datang & Nongkrong
                            </div>
                            <h2 className="mt-3 text-4xl font-black tracking-tight text-[#3b2417] md:text-5xl">
                                Yuk, Mampir!
                            </h2>
                        </div>

                        <div className="mt-10 grid gap-5 md:grid-cols-3">
                            <div className="rounded-3xl border border-[#efdfb9] bg-white p-7 shadow-sm">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0d4] text-[#ef3b22]">
                                    <IconMapPin size={23} />
                                </div>
                                <h3 className="mt-5 font-black">Lokasi</h3>
                                <p className="mt-2 text-sm leading-6 text-[#80634e]">
                                    Jl. Contoh No. 123, Indonesia
                                    <br />
                                    Mudah ditemukan, parkir aman.
                                </p>
                            </div>

                            <div className="rounded-3xl border border-[#efdfb9] bg-white p-7 shadow-sm">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0d4] text-[#ef3b22]">
                                    <IconClock size={23} />
                                </div>
                                <h3 className="mt-5 font-black">Jam Buka</h3>
                                <p className="mt-2 text-sm leading-6 text-[#80634e]">
                                    Setiap hari
                                    <br />
                                    10.00 — 24.00 WIB
                                </p>
                            </div>

                            <div className="rounded-3xl border border-[#efdfb9] bg-white p-7 shadow-sm">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0d4] text-[#ef3b22]">
                                    <IconPhone size={23} />
                                </div>
                                <h3 className="mt-5 font-black">Hubungi Kami</h3>
                                <p className="mt-2 text-sm leading-6 text-[#80634e]">
                                    08xx-xxxx-xxxx
                                    <br />
                                    WhatsApp tersedia.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FOOTER */}
                <footer className="bg-[#241811] px-5 py-10 text-[#cdb9a3] md:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ef3b22] text-white">
                                    <IconSoup size={22} />
                                </div>
                                <div>
                                    <div className="font-black text-white">
                                        Sample <span className="text-[#ef3b22]">Warmindo</span>
                                    </div>
                                    <div className="text-[9px] font-bold uppercase tracking-wider text-[#89715d]">
                                        Mie Enak • Harga Bersahabat
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-center gap-5 text-xs font-bold md:justify-end">
                                <a href="#menu" className="hover:text-white">Menu</a>
                                <a href="#tentang" className="hover:text-white">Tentang</a>
                                <a href="#promo" className="hover:text-white">Promo</a>
                                <a href="#lokasi" className="hover:text-white">Lokasi</a>
                            </div>
                        </div>

                        <div className="mt-7 border-t border-white/10 pt-5 text-center text-[11px] text-[#806b57]">
                            © {new Date().getFullYear()} Sample Warmindo. Mie enak, nongkrong nyaman.
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
