import { useEffect, useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    IconArrowRight,
    IconEye,
    IconEyeOff,
    IconLock,
    IconMail,
    IconShoppingCart,
    IconLoader2,
    IconSparkles,
    IconShieldCheck,
    IconChartBar,
} from "@tabler/icons-react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        return () => reset("password");
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    return (
        <>
            <Head title="Masuk" />

            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-300/40 border border-slate-200">
                    <div className="grid min-h-[680px] lg:grid-cols-[1.05fr_.95fr]">
                        <div className="relative hidden lg:flex overflow-hidden bg-slate-950 p-12 text-white">
                            <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
                            <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
                            <div className="absolute right-10 bottom-10 h-40 w-40 rounded-full border border-white/10" />
                            <div className="absolute right-20 bottom-20 h-20 w-20 rounded-full border border-white/10" />

                            <div className="relative z-10 flex w-full flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/30">
                                            <IconShoppingCart size={25} />
                                        </div>
                                        <div>
                                            <div className="text-xl font-bold tracking-tight">Aplikasi Kasir</div>
                                            <div className="text-xs text-slate-400">Point of Sale System</div>
                                        </div>
                                    </div>

                                    <div className="mt-24 max-w-lg">
                                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur">
                                            <IconSparkles size={16} className="text-indigo-400" />
                                            Sistem kasir modern
                                        </div>

                                        <h2 className="text-5xl font-bold leading-[1.08] tracking-tight">
                                            Kelola toko.
                                            <br />
                                            <span className="text-indigo-400">Lebih cepat.</span>
                                        </h2>

                                        <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                                            Kelola transaksi, produk, stok, pembayaran, promotion,
                                            dan laporan bisnis dalam satu sistem yang sederhana.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                                        <IconShoppingCart size={21} className="mb-3 text-indigo-400" />
                                        <div className="text-sm font-semibold">Transaksi</div>
                                        <div className="mt-1 text-xs text-slate-500">Cepat & praktis</div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                                        <IconChartBar size={21} className="mb-3 text-indigo-400" />
                                        <div className="text-sm font-semibold">Laporan</div>
                                        <div className="mt-1 text-xs text-slate-500">Real-time</div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                                        <IconShieldCheck size={21} className="mb-3 text-indigo-400" />
                                        <div className="text-sm font-semibold">Aman</div>
                                        <div className="mt-1 text-xs text-slate-500">Multi user</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-14">
                            <div className="w-full max-w-md">
                                <div className="mb-10 flex items-center gap-3 lg:hidden">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
                                        <IconShoppingCart size={23} />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">Aplikasi Kasir</div>
                                        <div className="text-xs text-slate-400">Point of Sale System</div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <p className="mb-2 text-sm font-semibold text-indigo-600">SELAMAT DATANG</p>
                                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                        Masuk ke akun Anda
                                    </h1>
                                    <p className="mt-3 text-sm leading-6 text-slate-500">
                                        Silakan masuk untuk melanjutkan ke sistem kasir Anda.
                                    </p>
                                </div>

                                {status && (
                                    <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                                        {status}
                                    </div>
                                )}

                                <form onSubmit={submit} className="space-y-5">
                                    <div>
                                        <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <IconMail size={20} />
                                            </div>
                                            <input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                autoFocus
                                                value={data.email}
                                                onChange={(e) => setData("email", e.target.value)}
                                                placeholder="Masukkan email Anda"
                                                className={`h-14 w-full rounded-2xl border bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                                                    errors.email
                                                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                                        : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                                }`}
                                            />
                                        </div>
                                        {errors.email && <p className="mt-2 text-xs font-medium text-red-500">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <div className="mb-2 flex items-center justify-between">
                                            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                                                Password
                                            </label>
                                            {canResetPassword && (
                                                <Link
                                                    href={route("password.request")}
                                                    className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
                                                >
                                                    Lupa password?
                                                </Link>
                                            )}
                                        </div>

                                        <div className="relative">
                                            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <IconLock size={20} />
                                            </div>
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                autoComplete="current-password"
                                                value={data.password}
                                                onChange={(e) => setData("password", e.target.value)}
                                                placeholder="Masukkan password"
                                                className={`h-14 w-full rounded-2xl border bg-slate-50 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                                                    errors.password
                                                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                                        : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                                }`}
                                            />
                                            <button
                                                type="button"
                                                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                                                onClick={() => setShowPassword((value) => !value)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                            >
                                                {showPassword ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                                            </button>
                                        </div>
                                        {errors.password && <p className="mt-2 text-xs font-medium text-red-500">{errors.password}</p>}
                                    </div>

                                    <label className="flex cursor-pointer select-none items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData("remember", e.target.checked)}
                                            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-sm text-slate-500">Ingat saya di perangkat ini</span>
                                    </label>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/25 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {processing ? (
                                            <>
                                                <IconLoader2 size={20} className="animate-spin" />
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                Masuk ke Dashboard
                                                <IconArrowRight size={19} className="transition-transform group-hover:translate-x-1" />
                                            </>
                                        )}
                                    </button>

                                    {/* <div className="pt-2 text-center">
                                        <p className="text-sm text-slate-500">
                                            Belum punya akun?{" "}
                                            <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
                                                Daftar sekarang
                                            </Link>
                                        </p>
                                    </div> */}
                                </form>

                                <div className="mt-10 border-t border-slate-100 pt-5 text-center">
                                    <p className="text-xs text-slate-400">
                                        © {new Date().getFullYear()} Aplikasi Kasir. Semua hak dilindungi.
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
