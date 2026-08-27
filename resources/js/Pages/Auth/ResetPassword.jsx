import { useEffect, useState } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import {
    IconArrowLeft,
    IconArrowRight,
    IconEye,
    IconEyeOff,
    IconKey,
    IconLock,
    IconMail,
    IconShieldCheck,
    IconSparkles,
    IconLoader2,
    IconShoppingCart,
} from "@tabler/icons-react";

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: "",
        password_confirmation: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    useEffect(() => {
        return () => {
            reset("password", "password_confirmation");
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route("password.store"));
    };

    return (
        <>
            <Head title="Reset Password" />

            <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                <div className="w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-slate-300/40 border border-slate-200">
                    <div className="grid min-h-[680px] lg:grid-cols-[1.05fr_.95fr]">

                        {/* =====================================================
                            LEFT - BRANDING
                        ====================================================== */}
                        <div className="relative hidden lg:flex overflow-hidden bg-slate-950 p-12 text-white">
                            {/* Decorative background */}
                            <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
                            <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />

                            <div className="absolute right-10 bottom-10 h-40 w-40 rounded-full border border-white/10" />
                            <div className="absolute right-20 bottom-20 h-20 w-20 rounded-full border border-white/10" />

                            <div className="relative z-10 flex w-full flex-col justify-between">

                                {/* Logo */}
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

                                {/* Main branding */}
                                <div className="max-w-lg">
                                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur">
                                        <IconShieldCheck
                                            size={16}
                                            className="text-indigo-400"
                                        />

                                        Keamanan akun
                                    </div>

                                    <h2 className="text-5xl font-bold leading-[1.08] tracking-tight">
                                        Buat password
                                        <br />

                                        <span className="text-indigo-400">
                                            baru yang aman.
                                        </span>
                                    </h2>

                                    <p className="mt-6 max-w-md text-base leading-7 text-slate-400">
                                        Gunakan password baru yang kuat untuk
                                        menjaga keamanan akun dan data bisnis
                                        Anda.
                                    </p>

                                    {/* Security info */}
                                    <div className="mt-8 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                                                <IconKey
                                                    size={18}
                                                    className="text-indigo-400"
                                                />
                                            </div>

                                            <span className="text-sm text-slate-300">
                                                Gunakan password yang sulit
                                                ditebak
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
                                                Jangan gunakan password yang
                                                sama di tempat lain
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom */}
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

                                {/* Mobile Logo */}
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

                                {/* Header */}
                                <div className="mb-8">
                                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                                        <IconLock size={27} />
                                    </div>

                                    <p className="mb-2 text-sm font-semibold text-indigo-600">
                                        PEMULIHAN AKUN
                                    </p>

                                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                        Reset Password
                                    </h1>

                                    <p className="mt-3 text-sm leading-6 text-slate-500">
                                        Buat password baru untuk akun Anda.
                                        Pastikan password cukup kuat dan mudah
                                        Anda ingat.
                                    </p>
                                </div>

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
                                                autoComplete="username"
                                                onChange={(e) =>
                                                    setData(
                                                        "email",
                                                        e.target.value
                                                    )
                                                }
                                                className={`h-14 w-full rounded-2xl border bg-slate-50 pl-12 pr-4 text-sm text-slate-900 outline-none transition ${
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

                                    {/* PASSWORD */}
                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Password Baru
                                        </label>

                                        <div className="relative">
                                            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <IconLock size={20} />
                                            </div>

                                            <input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password"
                                                value={data.password}
                                                autoComplete="new-password"
                                                autoFocus
                                                onChange={(e) =>
                                                    setData(
                                                        "password",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Masukkan password baru"
                                                className={`h-14 w-full rounded-2xl border bg-slate-50 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                                                    errors.password
                                                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                                        : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                                }`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        (value) => !value
                                                    )
                                                }
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                            >
                                                {showPassword ? (
                                                    <IconEyeOff size={20} />
                                                ) : (
                                                    <IconEye size={20} />
                                                )}
                                            </button>
                                        </div>

                                        {errors.password && (
                                            <p className="mt-2 text-xs font-medium text-red-500">
                                                {errors.password}
                                            </p>
                                        )}
                                    </div>

                                    {/* CONFIRM PASSWORD */}
                                    <div>
                                        <label
                                            htmlFor="password_confirmation"
                                            className="mb-2 block text-sm font-semibold text-slate-700"
                                        >
                                            Konfirmasi Password
                                        </label>

                                        <div className="relative">
                                            <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                <IconLock size={20} />
                                            </div>

                                            <input
                                                id="password_confirmation"
                                                type={
                                                    showPasswordConfirmation
                                                        ? "text"
                                                        : "password"
                                                }
                                                name="password_confirmation"
                                                value={
                                                    data.password_confirmation
                                                }
                                                autoComplete="new-password"
                                                onChange={(e) =>
                                                    setData(
                                                        "password_confirmation",
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Ulangi password baru"
                                                className={`h-14 w-full rounded-2xl border bg-slate-50 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
                                                    errors.password_confirmation
                                                        ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                                                        : "border-slate-200 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                                                }`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPasswordConfirmation(
                                                        (value) => !value
                                                    )
                                                }
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                                            >
                                                {showPasswordConfirmation ? (
                                                    <IconEyeOff size={20} />
                                                ) : (
                                                    <IconEye size={20} />
                                                )}
                                            </button>
                                        </div>

                                        {errors.password_confirmation && (
                                            <p className="mt-2 text-xs font-medium text-red-500">
                                                {errors.password_confirmation}
                                            </p>
                                        )}
                                    </div>

                                    {/* PASSWORD INFO */}
                                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                                        <div className="flex gap-3">
                                            <IconShieldCheck
                                                size={19}
                                                className="mt-0.5 shrink-0 text-indigo-600"
                                            />

                                            <div>
                                                <p className="text-xs font-semibold text-indigo-900">
                                                    Tips keamanan
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-indigo-700">
                                                    Gunakan minimal 8 karakter
                                                    dengan kombinasi huruf,
                                                    angka, dan simbol.
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
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                Simpan Password Baru

                                                <IconArrowRight
                                                    size={19}
                                                    className="transition-transform group-hover:translate-x-1"
                                                />
                                            </>
                                        )}
                                    </button>

                                    {/* BACK */}
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