<?php

namespace App\Exports;

use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PaymentReportExport implements
    FromQuery,
    WithHeadings,
    WithMapping,
    ShouldAutoSize,
    WithStyles
{
    protected array $filters;

    protected int $number = 0;

    public function __construct(
        array $filters = []
    ) {
        $this->filters = $filters;
    }

    /**
     * Query.
     */
    public function query(): Builder
    {
        $query = Transaction::query()
            ->with([
                'cashier:id,name',
                'customer:id,name',
            ]);

        /*
        |--------------------------------------------------------------------------
        | INVOICE
        |--------------------------------------------------------------------------
        */

        $query->when(
            $this->filters['invoice'] ?? null,
            function (
                $q,
                $invoice
            ) {
                $q->where(
                    'invoice',
                    'like',
                    '%' . $invoice . '%'
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | CASHIER
        |--------------------------------------------------------------------------
        */

        $query->when(
            $this->filters['cashier_id'] ?? null,
            function (
                $q,
                $cashier
            ) {
                $q->where(
                    'cashier_id',
                    $cashier
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | CUSTOMER
        |--------------------------------------------------------------------------
        */

        $query->when(
            $this->filters['customer_id'] ?? null,
            function (
                $q,
                $customer
            ) {
                $q->where(
                    'customer_id',
                    $customer
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | PAYMENT METHOD
        |--------------------------------------------------------------------------
        */

        if (
            !empty(
                $this->filters['payment_method']
            )
        ) {
            $method =
                strtolower(
                    $this->filters['payment_method']
                );

            if (
                in_array(
                    $method,
                    [
                        'paylater',
                        'pay_later',
                    ]
                )
            ) {
                $query->whereIn(
                    'payment_method',
                    [
                        'paylater',
                        'pay_later',
                    ]
                );
            } else {
                $query->where(
                    'payment_method',
                    $method
                );
            }
        }

        /*
        |--------------------------------------------------------------------------
        | PAYMENT STATUS
        |--------------------------------------------------------------------------
        */

        if (
            !empty(
                $this->filters['payment_status']
            )
        ) {
            $query->where(
                'payment_status',
                $this->filters['payment_status']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | START DATE
        |--------------------------------------------------------------------------
        */

        if (
            !empty(
                $this->filters['start_date']
            )
        ) {
            $query->whereDate(
                'created_at',
                '>=',
                $this->filters['start_date']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | END DATE
        |--------------------------------------------------------------------------
        */

        if (
            !empty(
                $this->filters['end_date']
            )
        ) {
            $query->whereDate(
                'created_at',
                '<=',
                $this->filters['end_date']
            );
        }

        /*
        |--------------------------------------------------------------------------
        | ORDER
        |--------------------------------------------------------------------------
        */

        return $query->orderByDesc(
            'id'
        );
    }

    /**
     * Headings.
     */
    public function headings(): array
    {
        return [
            'No',
            'Invoice',
            'Tanggal',
            'Pelanggan',
            'Kasir',
            'Metode Pembayaran',
            'Status',
            'Total',
            'Cash Dibayar',
            'Kembalian',
            'Reference',
        ];
    }

    /**
     * Mapping.
     */
    public function map(
        $transaction
    ): array {
        $this->number++;

        /*
        |--------------------------------------------------------------------------
        | DATE
        |--------------------------------------------------------------------------
        */

        $createdAt =
            $transaction->created_at;

        if ($createdAt) {
            try {
                $createdAt =
                    Carbon::parse(
                        $createdAt
                    )->format(
                        'd-m-Y H:i:s'
                    );
            } catch (
                \Throwable $e
            ) {
                $createdAt =
                    (string) $createdAt;
            }
        } else {
            $createdAt = '-';
        }

        /*
        |--------------------------------------------------------------------------
        | PAYMENT METHOD
        |--------------------------------------------------------------------------
        */

        $method =
            strtolower(
                trim(
                    (string) (
                        $transaction->payment_method
                        ?? ''
                    )
                )
            );

        $paymentLabel =
            match ($method) {
                'cash',
                'tunai'
                    => 'CASH',

                'qris'
                    => 'QRIS',

                'paylater',
                'pay_later'
                    => 'PAY LATER',

                default
                    => strtoupper(
                        $method ?: '-'
                    ),
            };

        /*
        |--------------------------------------------------------------------------
        | STATUS
        |--------------------------------------------------------------------------
        */

        $status =
            strtolower(
                trim(
                    (string) (
                        $transaction->payment_status
                        ?? ''
                    )
                )
            );

        $statusLabel =
            match ($status) {
                'paid',
                'success',
                'successful',
                'completed',
                'complete'
                    => 'LUNAS',

                'unpaid',
                'pending',
                'waiting'
                    => 'BELUM LUNAS',

                'failed',
                'failure',
                    => 'GAGAL',

                'expired'
                    => 'EXPIRED',

                default
                    => strtoupper(
                        $status ?: '-'
                    ),
            };

        /*
        |--------------------------------------------------------------------------
        | RETURN
        |--------------------------------------------------------------------------
        */

        return [
            $this->number,

            $transaction->invoice,

            $createdAt,

            $transaction->customer?->name
                ?? 'Umum',

            $transaction->cashier?->name
                ?? '-',

            $paymentLabel,

            $statusLabel,

            (float) (
                $transaction->grand_total
                ?? 0
            ),

            (float) (
                $transaction->cash
                ?? 0
            ),

            (float) (
                $transaction->change
                ?? 0
            ),

            $transaction->payment_reference
                ?? '-',
        ];
    }

    /**
     * Styles.
     */
    public function styles(
        Worksheet $sheet
    ) {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                ],
            ],
        ];
    }
}