<?php

namespace App\Http\Controllers\Reports;

use App\Exports\SalesExport;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Profit;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class SalesReportController extends Controller
{
    /**
     * Display the sales report.
     */
    public function index(Request $request)
    {
        $filters = [
            'start_date' => $request->input('start_date'),
            'end_date' => $request->input('end_date'),
            'invoice' => $request->input('invoice'),
            'cashier_id' => $request->input('cashier_id'),
            'customer_id' => $request->input('customer_id'),
        ];

        /*
        |--------------------------------------------------------------------------
        | TRANSACTION LIST
        |--------------------------------------------------------------------------
        */

        $baseListQuery = $this->applyFilters(
            Transaction::query()
                ->with([
                    'cashier:id,name',
                    'customer:id,name',
                ])
                ->withSum(
                    'details as total_items',
                    'qty'
                )
                ->withSum(
                    'profits as total_profit',
                    'total'
                ),
            $filters
        )->orderByDesc('created_at');

        $transactions = (clone $baseListQuery)
            ->paginate(10)
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | AGGREGATE
        |--------------------------------------------------------------------------
        */

        $aggregateQuery = $this->applyFilters(
            Transaction::query(),
            $filters
        );

        $totals = (clone $aggregateQuery)
            ->selectRaw('
                COUNT(*) as orders_count,
                COALESCE(SUM(grand_total), 0) as revenue_total,
                COALESCE(SUM(discount), 0) as discount_total
            ')
            ->first();

        /*
        |--------------------------------------------------------------------------
        | TRANSACTION IDS
        |--------------------------------------------------------------------------
        */

        $transactionIds = (clone $aggregateQuery)
            ->pluck('id');

        /*
        |--------------------------------------------------------------------------
        | TOTAL ITEMS SOLD
        |--------------------------------------------------------------------------
        */

        $itemsSold = $transactionIds->isNotEmpty()
            ? TransactionDetail::whereIn(
                'transaction_id',
                $transactionIds
            )->sum('qty')
            : 0;

        /*
        |--------------------------------------------------------------------------
        | TOTAL PROFIT
        |--------------------------------------------------------------------------
        */

        $profitTotal = $transactionIds->isNotEmpty()
            ? Profit::whereIn(
                'transaction_id',
                $transactionIds
            )->sum('total')
            : 0;

        /*
        |--------------------------------------------------------------------------
        | SUMMARY
        |--------------------------------------------------------------------------
        */

        $summary = [
            'orders_count' => (int) (
                $totals->orders_count ?? 0
            ),

            'revenue_total' => (int) (
                $totals->revenue_total ?? 0
            ),

            'discount_total' => (int) (
                $totals->discount_total ?? 0
            ),

            'items_sold' => (int) $itemsSold,

            'profit_total' => (int) $profitTotal,

            'average_order' =>
                ($totals->orders_count ?? 0) > 0
                    ? (int) round(
                        $totals->revenue_total
                        / $totals->orders_count
                    )
                    : 0,
        ];

        /*
        |--------------------------------------------------------------------------
        | RENDER
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Dashboard/Reports/Sales',
            [
                'transactions' => $transactions,

                'summary' => $summary,

                'filters' => $filters,

                'cashiers' => User::select(
                    'id',
                    'name'
                )
                    ->orderBy('name')
                    ->get(),

                'customers' => Customer::select(
                    'id',
                    'name'
                )
                    ->orderBy('name')
                    ->get(),
            ]
        );
    }

    /**
     * Export sales report to Excel.
     *
     * Filter yang digunakan sama dengan
     * filter pada laporan penjualan.
     */
    public function export(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | FILTER
        |--------------------------------------------------------------------------
        */

        $filters = [
            'start_date' => $request->input(
                'start_date'
            ),

            'end_date' => $request->input(
                'end_date'
            ),

            'invoice' => $request->input(
                'invoice'
            ),

            'cashier_id' => $request->input(
                'cashier_id'
            ),

            'customer_id' => $request->input(
                'customer_id'
            ),
        ];

        /*
        |--------------------------------------------------------------------------
        | FILE NAME
        |--------------------------------------------------------------------------
        */

        $filename =
            'laporan-penjualan-'
            . now()->format('Y-m-d-His')
            . '.xlsx';

        /*
        |--------------------------------------------------------------------------
        | EXPORT
        |--------------------------------------------------------------------------
        */

        return Excel::download(
            new SalesExport($filters),
            $filename
        );
    }

    /**
     * Apply table filters.
     */
    protected function applyFilters(
        $query,
        array $filters
    ) {
        return $query

            /*
            |--------------------------------------------------------------------------
            | INVOICE
            |--------------------------------------------------------------------------
            */

            ->when(
                $filters['invoice'] ?? null,
                fn (
                    $q,
                    $invoice
                ) => $q->where(
                    'invoice',
                    'like',
                    '%' . $invoice . '%'
                )
            )

            /*
            |--------------------------------------------------------------------------
            | CASHIER
            |--------------------------------------------------------------------------
            */

            ->when(
                $filters['cashier_id'] ?? null,
                fn (
                    $q,
                    $cashier
                ) => $q->where(
                    'cashier_id',
                    $cashier
                )
            )

            /*
            |--------------------------------------------------------------------------
            | CUSTOMER
            |--------------------------------------------------------------------------
            */

            ->when(
                $filters['customer_id'] ?? null,
                fn (
                    $q,
                    $customer
                ) => $q->where(
                    'customer_id',
                    $customer
                )
            )

            /*
            |--------------------------------------------------------------------------
            | START DATE
            |--------------------------------------------------------------------------
            */

            ->when(
                $filters['start_date'] ?? null,
                fn (
                    $q,
                    $start
                ) => $q->whereDate(
                    'created_at',
                    '>=',
                    $start
                )
            )

            /*
            |--------------------------------------------------------------------------
            | END DATE
            |--------------------------------------------------------------------------
            */

            ->when(
                $filters['end_date'] ?? null,
                fn (
                    $q,
                    $end
                ) => $q->whereDate(
                    'created_at',
                    '<=',
                    $end
                )
            );
    }
}