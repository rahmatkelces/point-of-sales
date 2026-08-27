<?php

namespace App\Http\Controllers\Apps;

use App\Exceptions\PaymentGatewayException;
use App\Http\Controllers\Controller;
use App\Services\Payments\InstantpayGateway;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    protected InstantpayGateway $instantpay;

    public function __construct(
        InstantpayGateway $instantpay
    ) {
        $this->instantpay = $instantpay;
    }

    /**
     * Halaman penarikan.
     */
    public function index()
    {
        $config = $this->getConfig();

        $balance = [
            'balance' => 0,
            'currency' => 'IDR',
            'mode' => null,
        ];

        $withdrawals = [];

        $balanceError = null;

        try {
            $balance = $this->instantpay->getBalance($config);
        } catch (PaymentGatewayException $e) {
            $balanceError = $e->getMessage();
        }

        try {
            $withdrawals =
                $this->instantpay->getWithdrawals($config);
        } catch (PaymentGatewayException $e) {
            // Riwayat gagal tidak membuat halaman gagal total.
            $withdrawals = [];
        }

        return Inertia::render(
            'Dashboard/Withdrawals/Index',
            [
                'balance' => $balance,
                'balanceError' => $balanceError,

                'withdrawals' => $withdrawals,

                'withdrawalConfig' => [
                    'minimum' =>
                        (int) config(
                            'services.instantpay.withdrawal_minimum',
                            25000
                        ),

                    'fee_percent' =>
                        (float) config(
                            'services.instantpay.withdrawal_fee_percent',
                            1
                        ),

                    'fee_fixed' =>
                        (int) config(
                            'services.instantpay.withdrawal_fee_fixed',
                            4000
                        ),
                ],
            ]
        );
    }

    /**
     * Ajukan penarikan.
     */
    public function store(Request $request)
    {
        $minimum =
            (int) config(
                'services.instantpay.withdrawal_minimum',
                25000
            );

        $validated = $request->validate([
            'amount' => [
                'required',
                'integer',
                'min:' . $minimum,
            ],
        ], [
            'amount.required' =>
                'Nominal penarikan wajib diisi.',

            'amount.integer' =>
                'Nominal penarikan harus berupa angka.',

            'amount.min' =>
                'Minimal penarikan Rp '
                . number_format(
                    $minimum,
                    0,
                    ',',
                    '.'
                )
                . '.',
        ]);

        $amount = (int) $validated['amount'];

        $config = $this->getConfig();

        /**
         * Cek saldo terbaru sebelum withdrawal.
         */
        try {
            $balance =
                $this->instantpay->getBalance($config);
        } catch (PaymentGatewayException $e) {
            return back()->withErrors([
                'amount' =>
                    $e->getMessage(),
            ]);
        }

        $availableBalance =
            (int) ($balance['balance'] ?? 0);

        if ($amount > $availableBalance) {
            return back()->withErrors([
                'amount' =>
                    'Saldo tidak cukup. Saldo tersedia Rp '
                    . number_format(
                        $availableBalance,
                        0,
                        ',',
                        '.'
                    )
                    . '.',
            ]);
        }

        /**
         * Ref unik.
         *
         * Jika request yang sama di-retry,
         * ref yang berbeda berarti transaksi berbeda.
         */
        $reference =
            'WD-'
            . now()->format('YmdHis')
            . '-'
            . strtoupper(
                Str::random(6)
            );

        try {
            $result =
                $this->instantpay->withdraw(
                    $amount,
                    $reference,
                    $config
                );

            return redirect()
                ->route('withdrawals.index')
                ->with(
                    'success',
                    'Penarikan berhasil diajukan.'
                );
        } catch (PaymentGatewayException $e) {
            return back()->withErrors([
                'amount' =>
                    $e->getMessage(),
            ]);
        }
    }

    /**
     * Ambil konfigurasi Instantpay.
     */
    private function getConfig(): array
    {
        return [
            'base_url' =>
                config(
                    'services.instantpay.base_url'
                ),

            'api_key' =>
                config(
                    'services.instantpay.api_key'
                ),
        ];
    }
}