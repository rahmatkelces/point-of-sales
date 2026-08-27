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

class SalesExport implements
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
     * Query data export.
     */
    public function query(): Builder
    {
        $query = Transaction::query()
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
            );

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
        | START DATE
        |--------------------------------------------------------------------------
        */

        $query->when(
            $this->filters['start_date'] ?? null,
            function (
                $q,
                $start
            ) {
                $q->whereDate(
                    'created_at',
                    '>=',
                    $start
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | END DATE
        |--------------------------------------------------------------------------
        */

        $query->when(
            $this->filters['end_date'] ?? null,
            function (
                $q,
                $end
            ) {
                $q->whereDate(
                    'created_at',
                    '<=',
                    $end
                );
            }
        );

        /*
        |--------------------------------------------------------------------------
        | ORDER
        |--------------------------------------------------------------------------
        */

        return $query->orderByDesc(
            'created_at'
        );
    }

    /**
     * Header Excel.
     */
    public function headings(): array
    {
        return [
            'No',
            'Invoice',
            'Tanggal',
            'Pelanggan',
            'Kasir',
            'Item',
            'Total',
            'Profit',
        ];
    }

    /**
     * Mapping data.
     */
    public function map(
        $transaction
    ): array {
        $this->number++;

        /*
        |--------------------------------------------------------------------------
        | CREATED AT
        |--------------------------------------------------------------------------
        |
        | created_at bisa berupa string atau Carbon,
        | jadi kita normalisasi terlebih dahulu.
        |
        */

        $createdAt = $transaction->created_at;

        if ($createdAt) {
            try {
                $createdAt = Carbon::parse(
                    $createdAt
                )->format(
                    'd-m-Y H:i:s'
                );
            } catch (\Throwable $e) {
                $createdAt = (string) $createdAt;
            }
        } else {
            $createdAt = '-';
        }

        /*
        |--------------------------------------------------------------------------
        | RETURN ROW
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

            (int) (
                $transaction->total_items
                ?? 0
            ),

            (float) (
                $transaction->grand_total
                ?? 0
            ),

            (float) (
                $transaction->total_profit
                ?? 0
            ),
        ];
    }

    /**
     * Excel style.
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