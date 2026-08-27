<?php

namespace App\Http\Controllers\Reports;

use App\Exports\PaymentReportExport;
use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class PaymentReportController extends Controller
{
    /**
     * Display payment report.
     */
    public function index(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | FILTERS
        |--------------------------------------------------------------------------
        */

        $filters = [
            'start_date'     => $request->input('start_date'),
            'end_date'       => $request->input('end_date'),
            'invoice'        => $request->input('invoice'),
            'cashier_id'     => $request->input('cashier_id'),
            'payment_method' => $request->input('payment_method'),
            'payment_status' => $request->input('payment_status'),
            'customer_id'    => $request->input('customer_id'),
        ];

        /*
        |--------------------------------------------------------------------------
        | BASE QUERY
        |--------------------------------------------------------------------------
        */

        $baseQuery = $this->applyFilters(
            Transaction::query()
                ->with([
                    'cashier:id,name',
                    'customer:id,name',
                ]),
            $filters
        );

        /*
        |--------------------------------------------------------------------------
        | TRANSACTIONS
        |--------------------------------------------------------------------------
        */

        $transactions = (clone $baseQuery)
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | SUMMARY QUERY
        |--------------------------------------------------------------------------
        */

        $summaryQuery = $this->applyFilters(
            Transaction::query(),
            $filters
        );

        /*
        |--------------------------------------------------------------------------
        | TOTAL TRANSACTIONS
        |--------------------------------------------------------------------------
        */

        $totalTransactions = (clone $summaryQuery)
            ->count();

        /*
        |--------------------------------------------------------------------------
        | TOTAL PAYMENT
        |--------------------------------------------------------------------------
        */

        $totalPayment = (clone $summaryQuery)
            ->sum('grand_total');

        /*
        |--------------------------------------------------------------------------
        | CASH
        |--------------------------------------------------------------------------
        |
        | payment_method = cash
        |
        */

        $cashQuery = $this->applyFilters(
            Transaction::query(),
            array_merge(
                $filters,
                [
                    'payment_method' => 'cash',
                ]
            )
        );

        $cashTotal = (clone $cashQuery)
            ->sum('grand_total');

        $cashCount = (clone $cashQuery)
            ->count();

        /*
        |--------------------------------------------------------------------------
        | QRIS
        |--------------------------------------------------------------------------
        |
        | Di sistem ini:
        |
        | InstantPay = QRIS
        |
        | Support data lama:
        |
        | qris
        |
        */

        $qrisQuery = $this->applyFilters(
            Transaction::query(),
            array_merge(
                $filters,
                [
                    'payment_method' => 'qris',
                ]
            )
        );

        $qrisTotal = (clone $qrisQuery)
            ->sum('grand_total');

        $qrisCount = (clone $qrisQuery)
            ->count();

        /*
        |--------------------------------------------------------------------------
        | PAY LATER
        |--------------------------------------------------------------------------
        |
        | Support:
        | - paylater
        | - pay_later
        |
        */

        $payLaterQuery = $this->applyPayLaterFilter(
            $this->applyFilters(
                Transaction::query(),
                $filters
            )
        );

        $payLaterTotal = (clone $payLaterQuery)
            ->sum('grand_total');

        $payLaterCount = (clone $payLaterQuery)
            ->count();

        /*
        |--------------------------------------------------------------------------
        | PAID / LUNAS
        |--------------------------------------------------------------------------
        |
        | Support beberapa kemungkinan status pembayaran.
        |
        */

        $paidQuery = $this->applyPaymentStatusFilter(
            $this->applyFilters(
                Transaction::query(),
                $filters
            ),
            'paid'
        );

        $paidTotal = (clone $paidQuery)
            ->sum('grand_total');

        $paidCount = (clone $paidQuery)
            ->count();

        /*
        |--------------------------------------------------------------------------
        | UNPAID / PENDING / BELUM LUNAS
        |--------------------------------------------------------------------------
        |
        | InstantPay yang belum dibayar biasanya:
        |
        | payment_status = pending
        |
        | Jadi jangan hanya mencari unpaid.
        |
        | Status yang dianggap BELUM LUNAS:
        |
        | - unpaid
        | - pending
        | - waiting
        | - menunggu
        |
        */

        $unpaidQuery = $this->applyPaymentStatusFilter(
            $this->applyFilters(
                Transaction::query(),
                $filters
            ),
            'unpaid'
        );

        $unpaidTotal = (clone $unpaidQuery)
            ->sum('grand_total');

        $unpaidCount = (clone $unpaidQuery)
            ->count();

        /*
        |--------------------------------------------------------------------------
        | SUMMARY
        |--------------------------------------------------------------------------
        */

        $summary = [
            'total_transactions' => (int) $totalTransactions,

            'total_payment' => (int) $totalPayment,

            'cash' => [
                'count' => (int) $cashCount,
                'total' => (int) $cashTotal,
            ],

            'qris' => [
                'count' => (int) $qrisCount,
                'total' => (int) $qrisTotal,
            ],

            'paylater' => [
                'count' => (int) $payLaterCount,
                'total' => (int) $payLaterTotal,
            ],

            'paid' => [
                'count' => (int) $paidCount,
                'total' => (int) $paidTotal,
            ],

            'unpaid' => [
                'count' => (int) $unpaidCount,
                'total' => (int) $unpaidTotal,
            ],
        ];

        /*
        |--------------------------------------------------------------------------
        | RENDER
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Dashboard/Reports/Payments',
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
     * Export payment report to Excel.
     */
    public function export(Request $request)
    {
        /*
        |--------------------------------------------------------------------------
        | FILTERS
        |--------------------------------------------------------------------------
        */

        $filters = [
            'start_date'     => $request->input('start_date'),
            'end_date'       => $request->input('end_date'),
            'invoice'        => $request->input('invoice'),
            'cashier_id'     => $request->input('cashier_id'),
            'payment_method' => $request->input('payment_method'),
            'payment_status' => $request->input('payment_status'),
            'customer_id'    => $request->input('customer_id'),
        ];

        /*
        |--------------------------------------------------------------------------
        | FILE NAME
        |--------------------------------------------------------------------------
        */

        $filename =
            'laporan-pembayaran-'
            . now()->format('Y-m-d-His')
            . '.xlsx';

        /*
        |--------------------------------------------------------------------------
        | EXPORT
        |--------------------------------------------------------------------------
        */

        return Excel::download(
            new PaymentReportExport($filters),
            $filename
        );
    }

    /**
     * Apply general filters.
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
            | PAYMENT METHOD
            |--------------------------------------------------------------------------
            */

            ->when(
                $filters['payment_method'] ?? null,
                function (
                    $q,
                    $method
                ) {
                    $method = strtolower(
                        trim(
                            (string) $method
                        )
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | QRIS
                    |--------------------------------------------------------------------------
                    |
                    | InstantPay = QRIS
                    |
                    | Support:
                    | - instantpay
                    | - qris
                    |
                    */

                    if (
                        in_array(
                            $method,
                            [
                                'qris',
                                'instantpay',
                            ],
                            true
                        )
                    ) {
                        return $q->whereIn(
                            'payment_method',
                            [
                                'instantpay',
                                'qris',
                            ]
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | PAY LATER
                    |--------------------------------------------------------------------------
                    */

                    if (
                        in_array(
                            $method,
                            [
                                'paylater',
                                'pay_later',
                            ],
                            true
                        )
                    ) {
                        return $q->whereIn(
                            'payment_method',
                            [
                                'paylater',
                                'pay_later',
                            ]
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | CASH
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $method === 'cash'
                    ) {
                        return $q->where(
                            'payment_method',
                            'cash'
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | DEBIT
                    |--------------------------------------------------------------------------
                    */

                    if (
                        $method === 'debit'
                    ) {
                        return $q->where(
                            'payment_method',
                            'debit'
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | DEFAULT
                    |--------------------------------------------------------------------------
                    */

                    return $q->where(
                        'payment_method',
                        $method
                    );
                }
            )

            /*
            |--------------------------------------------------------------------------
            | PAYMENT STATUS
            |--------------------------------------------------------------------------
            |
            | Jangan menggunakan where biasa karena status di database
            | bisa mempunyai beberapa variasi.
            |
            */

            ->when(
                $filters['payment_status'] ?? null,
                function (
                    $q,
                    $status
                ) {
                    $status = strtolower(
                        trim(
                            (string) $status
                        )
                    );

                    /*
                    |--------------------------------------------------------------------------
                    | LUNAS
                    |--------------------------------------------------------------------------
                    */

                    if (
                        in_array(
                            $status,
                            [
                                'paid',
                                'success',
                                'successful',
                                'completed',
                                'complete',
                                'settled',
                                'lunas',
                            ],
                            true
                        )
                    ) {
                        return $q->whereIn(
                            'payment_status',
                            [
                                'paid',
                                'success',
                                'successful',
                                'completed',
                                'complete',
                                'settled',
                            ]
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | BELUM LUNAS
                    |--------------------------------------------------------------------------
                    |
                    | Termasuk InstantPay yang masih pending.
                    |
                    */

                    if (
                        in_array(
                            $status,
                            [
                                'unpaid',
                                'pending',
                                'waiting',
                                'menunggu',
                                'belum_lunas',
                            ],
                            true
                        )
                    ) {
                        return $q->whereIn(
                            'payment_status',
                            [
                                'unpaid',
                                'pending',
                                'waiting',
                                'menunggu',
                            ]
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | GAGAL
                    |--------------------------------------------------------------------------
                    */

                    if (
                        in_array(
                            $status,
                            [
                                'failed',
                                'failure',
                                'gagal',
                            ],
                            true
                        )
                    ) {
                        return $q->whereIn(
                            'payment_status',
                            [
                                'failed',
                                'failure',
                            ]
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | EXPIRED
                    |--------------------------------------------------------------------------
                    */

                    if (
                        in_array(
                            $status,
                            [
                                'expired',
                                'expire',
                                'kedaluwarsa',
                            ],
                            true
                        )
                    ) {
                        return $q->whereIn(
                            'payment_status',
                            [
                                'expired',
                                'expire',
                            ]
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | CANCELLED
                    |--------------------------------------------------------------------------
                    */

                    if (
                        in_array(
                            $status,
                            [
                                'cancelled',
                                'canceled',
                                'dibatalkan',
                            ],
                            true
                        )
                    ) {
                        return $q->whereIn(
                            'payment_status',
                            [
                                'cancelled',
                                'canceled',
                            ]
                        );
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | DEFAULT
                    |--------------------------------------------------------------------------
                    */

                    return $q->where(
                        'payment_status',
                        $status
                    );
                }
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

    /**
     * Apply payment status filter.
     *
     * LUNAS:
     * - paid
     * - success
     * - successful
     * - completed
     * - complete
     * - settled
     *
     * BELUM LUNAS:
     * - unpaid
     * - pending
     * - waiting
     * - menunggu
     */
    protected function applyPaymentStatusFilter(
        $query,
        string $status
    ) {
        $status = strtolower(
            trim(
                $status
            )
        );

        /*
        |--------------------------------------------------------------------------
        | PAID
        |--------------------------------------------------------------------------
        */

        if (
            $status === 'paid'
        ) {
            return $query->whereIn(
                'payment_status',
                [
                    'paid',
                    'success',
                    'successful',
                    'completed',
                    'complete',
                    'settled',
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | UNPAID / PENDING
        |--------------------------------------------------------------------------
        */

        if (
            $status === 'unpaid'
        ) {
            return $query->whereIn(
                'payment_status',
                [
                    'unpaid',
                    'pending',
                    'waiting',
                    'menunggu',
                ]
            );
        }

        /*
        |--------------------------------------------------------------------------
        | DEFAULT
        |--------------------------------------------------------------------------
        */

        return $query->where(
            'payment_status',
            $status
        );
    }

    /**
     * Apply Pay Later filter.
     *
     * Support:
     * - paylater
     * - pay_later
     */
    protected function applyPayLaterFilter(
        $query
    ) {
        return $query->whereIn(
            'payment_method',
            [
                'paylater',
                'pay_later',
            ]
        );
    }
}