import { Head, Link, useForm } from "@inertiajs/react";
import {
    IconArrowLeft,
    IconArrowRight,
    IconMail,
    IconLoader2,
    IconShieldCheck,
    IconShoppingCart,
    IconKey,
    IconSparkles,
} from "@tabler/icons-react";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("password.email"));
    };

    return (
        <>
            <Head title="Lupa Password" />

            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-300/40 border border-slate-200">
                    <div className="grid min-h-[650px] lg:grid-cols-[1.05fr_.95fr]">

                        {/* =====================================================
                            LEFT - BRANDING
                        ====================================================== */}
                        <div className="relative hidden lg:flex overflow-hidden bg-slate-950 p-12 text-white">
                            <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
                            <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

                            <div className="absolute right-10 bottom-10 h-40 w-40 rounded-full border border-white/10" />
                            <div className="absolute right-20 bottom-20 h-20 w-20 rounded-full border border-white/10" />

                            <div className="relative z-10 flex w-full flex-col justify-between">

                                {/* LOGO */}
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
                                        <IconShoppingCart
                                            size={25}
                                            stroke={2}
                                        />
                                    </div>

                                    <div>
                                        <div className="text-xl font-bold tracking-tight">
                                            Aplikasi Kasir
                                        </div>

                                        <div className="text-xs text-slate-400">
                                            Point of Sale System
                                        </div>
                                    </div>
                                </div>

                                {/* CONTENT */}
                                <div className="max-w-lg">
                                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur">
                                        <IconSparkles
                                            size={16}
                                            className="text-indigo-400"
                                        />

                                        Pemulihan akun
                                    </div>

                                    <h2 className="text-5xl font-bold leading-[1.08] tracking-tight">
                                        Lupa password?
                                        <br />

                                        <span className="text-indigo-400">
                                            Kami bantu.
                                        </span>
                                    </h2>

                                    <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                                        Masukkan email yang terdaftar pada akun
                                        Anda. Kami akan mengirimkan link untuk
                                        membuat password baru.
                                    </p>

                                    {/* SECURITY */}
                                    <div className="mt-8 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                                                <IconMail
                                                    size={18}
                                                    className="text-indigo-400"
                                                />
                                            </div>

                                            <span className="text-sm text-slate-300">
                                                Link reset dikirim ke email Anda
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                                                <IconShieldCheck
                                                    size={18}
                                                    className="text-indigo-400"
                                                />
                                            </div>

                                            <span className="text-sm text-slate-300">
                                                Proses pemulihan tetap aman
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* FOOTER */}
                                <div className="text-xs text-slate-500">
                                    © {new Date().getFullYear()} Aplikasi Kasir.
                                    Semua hak dilindungi.
                                </div>
                            </div>
                        </div>

                        {/* =====================================================
                            RIGHT - FORM
                        ====================================================== */}
                        <div className="flex items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-14">
                            <div className="w-full max-w-md">

                                {/* MOBILE LOGO */}
                                <div className="mb-10 flex items-center gap-3 lg:hidden">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                                        <IconShoppingCart size={23} />
                                    </div>

                                    <div>
                                        <div className="font-bold text-slate-900">
                                            Aplikasi Kasir
                                        </div>

                                        <div className="text-xs text-slate-400">
                                            Point of Sale System
                                        </div>
                                    </div>
                                </div>

                                {/* HEADER */}
                                <div className="mb-8">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                        <IconKey size={27} />
                                    </div>

                                    <p className="mb-2 text-sm font-semibold text-indigo-600">
                                        PEMULIHAN AKUN
                                    </p>

                                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                        Lupa Password
                                    </h1>

                                    <p className="mt-3 text-sm leading-6 text-slate-500">
                                        Tidak masalah. Masukkan email Anda dan
                                        kami akan mengirimkan link untuk
                                        mengatur ulang password.
                                    </p>
                                </div>

                                {/* STATUS */}
                                {status && (
                                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
                                        <div className="flex gap-3">
                                            <IconShieldCheck
                                                size={20}
                                                className="mt-0.5 shrink-0 text-emerald-600"
                                            />

                                            <div>
                                                <p className="text-sm font-semibold text-emerald-800">
                                                    Email berhasil dikirim
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-emerald-700">
                                                    {status}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* FORM */}
                                <form
                                    onSubmit={submit}
                                    className="space-y-5"
                                >
                                    {/* EMAIL */}
                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Email
                                        </label>

                                        <div className="relative">
                                            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <IconMail size={20} />
                                            </div>

                                            <input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                autoComplete="email"
                                                autoFocus
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="nama@email.com"
                                                className={`h-14 w-full rounded-2xl border bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                                                    errors.email
                                                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                                        : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                                }`}
                                            />
                                        </div>

                                        {errors.email && (
                                            <p className="mt-2 text-xs font-medium text-red-500">
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>

                                    {/* INFO */}
                                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-4">
                                        <div className="flex gap-3">
                                            <IconMail
                                                size={19}
                                                className="mt-0.5 shrink-0 text-indigo-600"
                                            />

                                            <div>
                                                <p className="text-xs font-semibold text-indigo-900">
                                                    Periksa inbox email Anda
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-indigo-700">
                                                    Setelah mengirim permintaan,
                                                    periksa inbox atau folder
                                                    spam untuk menemukan link
                                                    reset password.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SUBMIT */}
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/25 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {processing ? (
                                            <>
                                                <IconLoader2
                                                    size={20}
                                                    className="animate-spin"
                                                />

                                                Mengirim...
                                            </>
                                        ) : (
                                            <>
                                                Kirim Link Reset

                                                <IconArrowRight
                                                    size={19}
                                                    className="transition-transform group-hover:translate-x-1"
                                                />
                                            </>
                                        )}
                                    </button>

                                    {/* BACK TO LOGIN */}
                                    <div className="pt-2 text-center">
                                        <Link
                                            href={route("login")}
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-indigo-600"
                                        >
                                            <IconArrowLeft size={17} />

                                            Kembali ke halaman login
                                        </Link>
                                    </div>
                                </form>

                                {/* FOOTER */}
                                <div className="mt-10 border-t border-slate-100 pt-5 text-center">
                                    <p className="text-xs text-slate-400">
                                        © {new Date().getFullYear()} Aplikasi Kasir.
                                        Semua hak dilindungi.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}