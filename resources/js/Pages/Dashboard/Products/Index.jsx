import React, { useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/Layouts/DashboardLayout";
import { Head, Link, router } from "@inertiajs/react";
import Button from "@/Components/Dashboard/Button";
import InputSelect from "@/Components/Dashboard/InputSelect";
import Pagination from "@/Components/Dashboard/Pagination";
import {
    IconCirclePlus,
    IconDatabaseOff,
    IconPencilCog,
    IconTrash,
    IconLayoutGrid,
    IconList,
    IconPhoto,
    IconPackage,
    IconFilter,
    IconX,
    IconSearch,
} from "@tabler/icons-react";
import Table from "@/Components/Dashboard/Table";
import { getProductImageUrl } from "@/Utils/imageUrl";

const formatCurrency = (value = 0) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);

const defaultFilterState = {
    search: "",
    category_id: "",
    stock_filter: "",
    per_page: 15,
};

const castFilterString = (value) =>
    typeof value === "number" ? String(value) : value ?? "";

function ProductCard({ product }) {
    const lowStock = product.stock > 0 && product.stock <= 5;
    const outOfStock = product.stock === 0;

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200">
            <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
                {product.image ? (
                    <img
                        src={getProductImageUrl(product.image)}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <IconPhoto
                            size={48}
                            className="text-slate-300 dark:text-slate-600"
                            strokeWidth={1}
                        />
                    </div>
                )}

                <div className="absolute top-2 right-2">
                    {outOfStock ? (
                        <span className="px-2 py-1 text-xs font-semibold bg-danger-500 text-white rounded-full">
                            Habis
                        </span>
                    ) : lowStock ? (
                        <span className="px-2 py-1 text-xs font-semibold bg-warning-500 text-white rounded-full">
                            Stok: {product.stock}
                        </span>
                    ) : (
                        <span className="px-2 py-1 text-xs font-medium bg-slate-900/60 text-white rounded-full">
                            Stok: {product.stock}
                        </span>
                    )}
                </div>

                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Link
                        href={route("products.edit", product.id)}
                        className="p-2.5 rounded-xl bg-white text-warning-600 hover:bg-warning-50 shadow-lg transition-colors"
                    >
                        <IconPencilCog size={18} />
                    </Link>
                    <Button
                        type={"delete"}
                        icon={<IconTrash size={18} />}
                        className="p-2.5 rounded-xl bg-white text-danger-600 hover:bg-danger-50 shadow-lg"
                        url={route("products.destroy", product.id)}
                    />
                </div>
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 text-xs font-medium bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-400 rounded-md">
                        {product.category?.name || "Kategori"}
                    </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 mb-1">
                    {product.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">
                    {product.barcode}
                </p>

                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Harga Beli
                        </p>
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            {formatCurrency(product.buy_price)}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                            Harga Jual
                        </p>
                        <p className="text-base font-bold text-primary-600 dark:text-primary-400">
                            {formatCurrency(product.sell_price)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Index({
    products,
    categories = [],
    filters = {},
    perPageOptions = [],
}) {
    const [viewMode, setViewMode] = useState("grid");
    const [showFilters, setShowFilters] = useState(false);

    const [filterData, setFilterData] = useState({
        ...defaultFilterState,
        search: castFilterString(filters?.search),
        category_id: castFilterString(filters?.category_id),
        stock_filter: castFilterString(filters?.stock_filter),
        per_page: filters?.per_page || 15,
    });

    const categoryFromFilters = useMemo(
        () =>
            categories.find(
                (c) => castFilterString(c.id) === filterData.category_id
            ) ?? null,
        [categories, filterData.category_id]
    );

    const [selectedCategory, setSelectedCategory] = useState(
        categoryFromFilters
    );

    useEffect(() => {
        setSelectedCategory(categoryFromFilters);
    }, [categoryFromFilters]);

    useEffect(() => {
        setFilterData({
            ...defaultFilterState,
            search: castFilterString(filters?.search),
            category_id: castFilterString(filters?.category_id),
            stock_filter: castFilterString(filters?.stock_filter),
            per_page: filters?.per_page || 15,
        });
    }, [filters]);

    const handleChange = (field, value) =>
        setFilterData((prev) => ({ ...prev, [field]: value }));

    const handleSelectCategory = (value) => {
        setSelectedCategory(value);
        handleChange("category_id", value ? String(value.id) : "");
    };

    const applyFilters = (e) => {
        e.preventDefault();

        router.get(route("products.index"), filterData, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });

        setShowFilters(false);
    };

    const resetFilters = () => {
        setFilterData(defaultFilterState);
        setSelectedCategory(null);

        router.get(route("products.index"), defaultFilterState, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const rows = products?.data ?? [];
    const paginationLinks = products?.links ?? [];
    const currentPage = products?.current_page ?? 1;
    const perPage = products?.per_page
        ? Number(products?.per_page)
        : rows.length || 1;

    const hasActiveFilters =
        filterData.search ||
        filterData.category_id ||
        filterData.stock_filter ||
        Number(filterData.per_page) !== 15;

    return (
        <>
            <Head title="Produk" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Produk
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {products.total} produk terdaftar
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2.5 rounded-lg transition-colors ${
                                viewMode === "grid"
                                    ? "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
                                    : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                            title="Grid View"
                        >
                            <IconLayoutGrid size={20} />
                        </button>

                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2.5 rounded-lg transition-colors ${
                                viewMode === "list"
                                    ? "bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-400"
                                    : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                            title="List View"
                        >
                            <IconList size={20} />
                        </button>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                                showFilters || hasActiveFilters
                                    ? "bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-950/50 dark:border-primary-800 dark:text-primary-400"
                                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                            }`}
                        >
                            <IconFilter size={18} />
                            <span>Filter</span>
                            {hasActiveFilters && (
                                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                            )}
                        </button>

                        <Button
                            type={"link"}
                            icon={
                                <IconCirclePlus size={18} strokeWidth={1.5} />
                            }
                            className="bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30"
                            label={"Tambah Produk"}
                            href={route("products.create")}
                        />
                    </div>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 animate-slide-up">
                        <form onSubmit={applyFilters}>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Cari Produk
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Cari title atau barcode..."
                                            value={filterData.search}
                                            onChange={(e) =>
                                                handleChange(
                                                    "search",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                        />
                                        <IconSearch
                                            size={18}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                    </div>
                                </div>

                                <InputSelect
                                    label="Kategori"
                                    data={categories}
                                    selected={selectedCategory}
                                    setSelected={handleSelectCategory}
                                    placeholder="Semua kategori"
                                    searchable
                                />

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Filter Stok
                                    </label>
                                    <select
                                        value={filterData.stock_filter}
                                        onChange={(e) =>
                                            handleChange(
                                                "stock_filter",
                                                e.target.value
                                            )
                                        }
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    >
                                        <option value="">Semua stok</option>
                                        <option value="lt3">
                                            Stok di bawah 3
                                        </option>
                                        <option value="lt5">
                                            Stok di bawah 5
                                        </option>
                                        <option value="lt10">
                                            Stok di bawah 10
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Tampilkan
                                    </label>
                                    <select
                                        value={filterData.per_page}
                                        onChange={(e) =>
                                            handleChange(
                                                "per_page",
                                                Number(e.target.value)
                                            )
                                        }
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                    >
                                        <option value={15}>15</option>
                                        {perPageOptions.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-4">
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={resetFilters}
                                        className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <IconX size={18} />
                                    </button>
                                )}

                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                                >
                                    <IconSearch size={18} />
                                    Terapkan
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Content */}
                {rows.length > 0 ? (
                    viewMode === "grid" ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {rows.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                />
                            ))}
                        </div>
                    ) : (
                        <Table.Card title={"Data Produk"}>
                            <Table>
                                <Table.Thead>
                                    <tr>
                                        <Table.Th className="w-10">No</Table.Th>
                                        <Table.Th>Produk</Table.Th>
                                        <Table.Th>Kategori</Table.Th>
                                        <Table.Th>Harga Beli</Table.Th>
                                        <Table.Th>Harga Jual</Table.Th>
                                        <Table.Th>Stok</Table.Th>
                                        <Table.Th></Table.Th>
                                    </tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {rows.map((product, i) => (
                                        <tr
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            key={product.id}
                                        >
                                            <Table.Td className="text-center">
                                                {i + 1 + (currentPage - 1) * perPage}
                                            </Table.Td>

                                            <Table.Td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                                                        {product.image ? (
                                                            <img
                                                                src={getProductImageUrl(
                                                                    product.image
                                                                )}
                                                                alt={product.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <IconPackage
                                                                    size={16}
                                                                    className="text-slate-400"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                            {product.title}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {product.barcode}
                                                        </p>
                                                    </div>
                                                </div>
                                            </Table.Td>

                                            <Table.Td>
                                                <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                                                    {product.category?.name}
                                                </span>
                                            </Table.Td>

                                            <Table.Td>
                                                {formatCurrency(product.buy_price)}
                                            </Table.Td>

                                            <Table.Td className="font-semibold text-primary-600 dark:text-primary-400">
                                                {formatCurrency(product.sell_price)}
                                            </Table.Td>

                                            <Table.Td>
                                                <span
                                                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                                                        product.stock === 0
                                                            ? "bg-danger-100 text-danger-700 dark:bg-danger-900/50 dark:text-danger-400"
                                                            : product.stock <= 5
                                                            ? "bg-warning-100 text-warning-700 dark:bg-warning-900/50 dark:text-warning-400"
                                                            : "bg-success-100 text-success-700 dark:bg-success-900/50 dark:text-success-400"
                                                    }`}
                                                >
                                                    {product.stock}
                                                </span>
                                            </Table.Td>

                                            <Table.Td>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type={"edit"}
                                                        icon={
                                                            <IconPencilCog
                                                                size={16}
                                                                strokeWidth={1.5}
                                                            />
                                                        }
                                                        className="border bg-warning-100 border-warning-200 text-warning-600 hover:bg-warning-200 dark:bg-warning-900/50 dark:border-warning-800 dark:text-warning-400"
                                                        href={route(
                                                            "products.edit",
                                                            product.id
                                                        )}
                                                    />
                                                    <Button
                                                        type={"delete"}
                                                        icon={
                                                            <IconTrash
                                                                size={16}
                                                                strokeWidth={1.5}
                                                            />
                                                        }
                                                        className="border bg-danger-100 border-danger-200 text-danger-600 hover:bg-danger-200 dark:bg-danger-900/50 dark:border-danger-800 dark:text-danger-400"
                                                        url={route(
                                                            "products.destroy",
                                                            product.id
                                                        )}
                                                    />
                                                </div>
                                            </Table.Td>
                                        </tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Table.Card>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <IconDatabaseOff
                                size={32}
                                className="text-slate-400"
                                strokeWidth={1.5}
                            />
                        </div>
                        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-1">
                            Belum Ada Produk
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                            Tidak ada produk sesuai filter.
                        </p>
                        <Button
                            type={"link"}
                            icon={<IconCirclePlus size={18} />}
                            className="bg-primary-500 hover:bg-primary-600 text-white"
                            label={"Tambah Produk"}
                            href={route("products.create")}
                        />
                    </div>
                )}

                {paginationLinks.length > 3 && (
                    <Pagination links={paginationLinks} />
                )}
            </div>
        </>
    );
}

Index.layout = (page) => <DashboardLayout children={page} />;