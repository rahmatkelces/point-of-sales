<?php

namespace App\Services\Payments;

use App\Exceptions\PaymentGatewayException;
use App\Models\Transaction;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InstantpayGateway
{
    /*
    |--------------------------------------------------------------------------
    | CREATE PAYMENT
    |--------------------------------------------------------------------------
    */

    /**
     * Create transaksi pembayaran Instantpay.
     */
    public function createPayment(
        Transaction $transaction,
        array $config
    ): array {
        /*
        |--------------------------------------------------------------------------
        | Base URL
        |--------------------------------------------------------------------------
        |
        | Bisa berupa:
        |
        | https://pay.instanlive.id
        |
        | atau:
        |
        | https://pay.instanlive.id/api/v1
        |
        */

        $baseUrl = rtrim(
            $config['base_url']
                ?? config('services.instantpay.base_url'),
            '/'
        );

        $apiKey =
            $config['api_key']
                ?? config('services.instantpay.api_key');

        if (!$baseUrl || !$apiKey) {
            throw new PaymentGatewayException(
                'Konfigurasi Instantpay belum lengkap.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Normalisasi Base URL
        |--------------------------------------------------------------------------
        */

        $apiBaseUrl = $this->getApiBaseUrl(
            $baseUrl
        );

        try {
            /*
            |--------------------------------------------------------------------------
            | CREATE TRANSACTION
            |--------------------------------------------------------------------------
            */

            $url =
                $apiBaseUrl
                . '/transaction/create';

            Log::info(
                'INSTANTPAY CREATE REQUEST',
                [
                    'url' => $url,
                    'invoice' => $transaction->invoice,
                    'amount' => (int) $transaction->grand_total,
                ]
            );

            $response = Http::timeout(30)
                ->acceptJson()
                ->withHeaders([
                    'X-Api-Key' => $apiKey,
                    'Content-Type' => 'application/json',
                ])
                ->post(
                    $url,
                    [
                        'ref_id' =>
                            $transaction->invoice,

                        'amount' =>
                            (int) $transaction->grand_total,
                    ]
                );

            Log::info(
                'INSTANTPAY CREATE RESPONSE',
                [
                    'invoice' =>
                        $transaction->invoice,

                    'status_code' =>
                        $response->status(),

                    'body' =>
                        $response->body(),
                ]
            );

            if (!$response->successful()) {
                Log::error(
                    'Instantpay create payment failed',
                    [
                        'status' =>
                            $response->status(),

                        'body' =>
                            $response->body(),

                        'invoice' =>
                            $transaction->invoice,
                    ]
                );

                throw new PaymentGatewayException(
                    'Gagal membuat pembayaran Instantpay.'
                );
            }

            $data =
                $response->json();

            $result =
                $data['data']
                ?? $data;

            /*
            |--------------------------------------------------------------------------
            | Transaction ID
            |--------------------------------------------------------------------------
            */

            $txnId =
                $result['txn_id']
                ?? $result['transaction_id']
                ?? null;

            if (!$txnId) {
                Log::error(
                    'INSTANTPAY CREATE MISSING TXN ID',
                    [
                        'invoice' =>
                            $transaction->invoice,

                        'response' =>
                            $data,
                    ]
                );

                throw new PaymentGatewayException(
                    'Instantpay tidak mengembalikan transaction ID.'
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Return
            |--------------------------------------------------------------------------
            */

            return [
                'reference' =>
                    (string) $txnId,

                'transaction_id' =>
                    (int) $txnId,

                'payment_url' =>
                    $result['payment_url']
                    ?? null,

                'qris_string' =>
                    $result['qris_string']
                    ?? null,

                'unique_amount' =>
                    $result['unique_amount']
                    ?? null,

                'status' =>
                    $this->normalizeStatus(
                        $result['status']
                        ?? 'pending'
                    ),

                'raw' =>
                    $data,
            ];

        } catch (
            PaymentGatewayException $e
        ) {
            throw $e;

        } catch (
            \Throwable $e
        ) {
            Log::error(
                'Instantpay create exception',
                [
                    'message' =>
                        $e->getMessage(),

                    'invoice' =>
                        $transaction->invoice,

                    'trace' =>
                        $e->getTraceAsString(),
                ]
            );

            throw new PaymentGatewayException(
                'Tidak dapat terhubung ke Instantpay.'
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | PAYMENT STATUS
    |--------------------------------------------------------------------------
    */

    /**
     * Cek status pembayaran Instantpay.
     *
     * Endpoint:
     *
     * GET /api/v1/transaction/status/{txn_id}
     */
    public function getPaymentStatus(
        Transaction $transaction,
        array $config
    ): array {
        $baseUrl = rtrim(
            $config['base_url']
                ?? config('services.instantpay.base_url'),
            '/'
        );

        $apiKey =
            $config['api_key']
                ?? config('services.instantpay.api_key');

        if (!$baseUrl || !$apiKey) {
            throw new PaymentGatewayException(
                'Konfigurasi Instantpay belum lengkap.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | API Base URL
        |--------------------------------------------------------------------------
        */

        $apiBaseUrl =
            $this->getApiBaseUrl(
                $baseUrl
            );

        /*
        |--------------------------------------------------------------------------
        | Transaction ID
        |--------------------------------------------------------------------------
        |
        | PENTING:
        | Jangan pakai invoice.
        |
        | InstantPay membutuhkan txn_id.
        |
        */

        $reference =
            $transaction->payment_reference
            ?: null;

        if (!$reference) {
            throw new PaymentGatewayException(
                'Transaction ID Instantpay tidak ditemukan.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | URL
        |--------------------------------------------------------------------------
        */

        $url =
            $apiBaseUrl
            . '/transaction/status/'
            . urlencode($reference);

        try {
            Log::info(
                'INSTANTPAY STATUS REQUEST',
                [
                    'url' =>
                        $url,

                    'invoice' =>
                        $transaction->invoice,

                    'transaction_id' =>
                        $reference,
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Request
            |--------------------------------------------------------------------------
            */

            $response =
                Http::timeout(15)
                    ->acceptJson()
                    ->withHeaders([
                        'X-Api-Key' =>
                            $apiKey,

                        'Content-Type' =>
                            'application/json',
                    ])
                    ->get($url);

            /*
            |--------------------------------------------------------------------------
            | Log
            |--------------------------------------------------------------------------
            */

            Log::info(
                'INSTANTPAY STATUS RESPONSE',
                [
                    'invoice' =>
                        $transaction->invoice,

                    'transaction_id' =>
                        $reference,

                    'http_status' =>
                        $response->status(),

                    'body' =>
                        $response->body(),

                    'json' =>
                        $response->json(),
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | HTTP ERROR
            |--------------------------------------------------------------------------
            */

            if (!$response->successful()) {
                throw new PaymentGatewayException(
                    'Instantpay status HTTP '
                    . $response->status()
                    . ': '
                    . $response->body()
                );
            }

            $data =
                $response->json();

            /*
            |--------------------------------------------------------------------------
            | Response
            |--------------------------------------------------------------------------
            */

            $result =
                $data['data']
                ?? $data;

            /*
            |--------------------------------------------------------------------------
            | Status
            |--------------------------------------------------------------------------
            */

            $rawStatus =
                $result['status']
                ?? $result['payment_status']
                ?? $result['transaction_status']
                ?? $result['state']
                ?? null;

            $status =
                $this->normalizeStatus(
                    $rawStatus
                );

            Log::info(
                'INSTANTPAY NORMALIZED STATUS',
                [
                    'invoice' =>
                        $transaction->invoice,

                    'transaction_id' =>
                        $reference,

                    'raw_status' =>
                        $rawStatus,

                    'normalized_status' =>
                        $status,
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Return
            |--------------------------------------------------------------------------
            */

            return [
                'reference' =>
                    $result['txn_id']
                    ?? $result['transaction_id']
                    ?? $reference,

                'transaction_id' =>
                    $result['txn_id']
                    ?? $result['transaction_id']
                    ?? $reference,

                'status' =>
                    $status,

                'payment_url' =>
                    $result['payment_url']
                    ?? null,

                'qris_string' =>
                    $result['qris_string']
                    ?? null,

                'paid_at' =>
                    $result['paid_at']
                    ?? null,

                'raw' =>
                    $data,
            ];

        } catch (
            PaymentGatewayException $e
        ) {
            throw $e;

        } catch (
            \Throwable $e
        ) {
            Log::error(
                'Instantpay status exception',
                [
                    'message' =>
                        $e->getMessage(),

                    'invoice' =>
                        $transaction->invoice,

                    'transaction_id' =>
                        $reference,
                ]
            );

            throw new PaymentGatewayException(
                'Tidak dapat mengecek status Instantpay.'
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | GET BALANCE
    |--------------------------------------------------------------------------
    */

    /**
     * Cek saldo InstantPay.
     *
     * GET /api/v1/balance
     */
    public function getBalance(
        array $config
    ): array {
        $apiBaseUrl =
            $this->getApiBaseUrlFromConfig(
                $config
            );

        $apiKey =
            $config['api_key']
            ?? config('services.instantpay.api_key');

        if (!$apiKey) {
            throw new PaymentGatewayException(
                'API Key Instantpay belum dikonfigurasi.'
            );
        }

        $url =
            $apiBaseUrl . '/balance';

        try {
            Log::info(
                'INSTANTPAY BALANCE REQUEST',
                [
                    'url' =>
                        $url,
                ]
            );

            $response =
                Http::timeout(15)
                    ->acceptJson()
                    ->withHeaders([
                        'X-Api-Key' =>
                            $apiKey,

                        'Content-Type' =>
                            'application/json',
                    ])
                    ->get($url);

            Log::info(
                'INSTANTPAY BALANCE RESPONSE',
                [
                    'status' =>
                        $response->status(),

                    'body' =>
                        $response->body(),
                ]
            );

            if (!$response->successful()) {
                throw new PaymentGatewayException(
                    'Instantpay balance HTTP '
                    . $response->status()
                    . ': '
                    . $response->body()
                );
            }

            $data =
                $response->json();

            $result =
                $data['data']
                ?? $data;

            return [
                'ok' =>
                    (bool) (
                        $data['ok']
                        ?? $data['success']
                        ?? true
                    ),

                'mode' =>
                    $result['mode']
                    ?? null,

                'balance' =>
                    (int) (
                        $result['balance']
                        ?? 0
                    ),

                'currency' =>
                    $result['currency']
                    ?? 'IDR',

                'raw' =>
                    $data,
            ];

        } catch (
            PaymentGatewayException $e
        ) {
            throw $e;

        } catch (
            \Throwable $e
        ) {
            Log::error(
                'Instantpay balance exception',
                [
                    'message' =>
                        $e->getMessage(),

                    'trace' =>
                        $e->getTraceAsString(),
                ]
            );

            throw new PaymentGatewayException(
                'Tidak dapat mengambil saldo Instantpay.'
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | WITHDRAW
    |--------------------------------------------------------------------------
    */

    /**
     * Ajukan penarikan saldo InstantPay.
     *
     * POST /api/v1/withdraw
     *
     * Body:
     *
     * {
     *     "amount": 100000,
     *     "ref": "WD-XXXXXXXX"
     * }
     */
    public function withdraw(
        int|float $amount,
        array $config,
        ?string $ref = null
    ): array {
        $apiBaseUrl =
            $this->getApiBaseUrlFromConfig(
                $config
            );

        $apiKey =
            $config['api_key']
            ?? config('services.instantpay.api_key');

        if (!$apiKey) {
            throw new PaymentGatewayException(
                'API Key Instantpay belum dikonfigurasi.'
            );
        }

        $amount =
            (int) $amount;

        if ($amount <= 0) {
            throw new PaymentGatewayException(
                'Jumlah penarikan harus lebih dari 0.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Generate Reference
        |--------------------------------------------------------------------------
        */

        $ref =
            $ref
            ?: 'WD-'
                . now()->format('YmdHis')
                . '-'
                . strtoupper(
                    substr(
                        bin2hex(
                            random_bytes(4)
                        ),
                        0,
                        8
                    )
                );

        $url =
            $apiBaseUrl . '/withdraw';

        $payload = [
            'amount' =>
                $amount,

            'ref' =>
                $ref,
        ];

        try {
            Log::info(
                'INSTANTPAY WITHDRAW REQUEST',
                [
                    'url' =>
                        $url,

                    'amount' =>
                        $amount,

                    'ref' =>
                        $ref,
                ]
            );

            $response =
                Http::timeout(30)
                    ->acceptJson()
                    ->withHeaders([
                        'X-Api-Key' =>
                            $apiKey,

                        'Content-Type' =>
                            'application/json',
                    ])
                    ->post(
                        $url,
                        $payload
                    );

            Log::info(
                'INSTANTPAY WITHDRAW RESPONSE',
                [
                    'status' =>
                        $response->status(),

                    'body' =>
                        $response->body(),

                    'ref' =>
                        $ref,
                ]
            );

            if (!$response->successful()) {
                throw new PaymentGatewayException(
                    'Instantpay withdrawal HTTP '
                    . $response->status()
                    . ': '
                    . $response->body()
                );
            }

            $data =
                $response->json();

            $result =
                $data['data']
                ?? $data;

            $ok =
                (bool) (
                    $data['ok']
                    ?? $data['success']
                    ?? false
                );

            if (!$ok) {
                throw new PaymentGatewayException(
                    $data['message']
                    ?? $result['message']
                    ?? 'Penarikan Instantpay gagal.'
                );
            }

            return [
                'ok' =>
                    true,

                'id' =>
                    $result['id']
                    ?? null,

                'amount' =>
                    (int) (
                        $result['amount']
                        ?? $amount
                    ),

                'fee' =>
                    (int) (
                        $result['fee']
                        ?? 0
                    ),

                'transfer_amount' =>
                    (int) (
                        $result['transfer_amount']
                        ?? $result['transferAmount']
                        ?? max(
                            0,
                            $amount
                                - (int) (
                                    $result['fee']
                                    ?? 0
                                )
                        )
                    ),

                'status' =>
                    $this->normalizeWithdrawalStatus(
                        $result['status']
                        ?? 'pending'
                    ),

                'bank' =>
                    $result['bank']
                    ?? null,

                'account_number' =>
                    $result['account_number']
                    ?? null,

                'auto_transfer' =>
                    $result['auto_transfer']
                    ?? null,

                'ref' =>
                    $ref,

                'message' =>
                    $result['message']
                    ?? $data['message']
                    ?? null,

                'raw' =>
                    $data,
            ];

        } catch (
            PaymentGatewayException $e
        ) {
            throw $e;

        } catch (
            \Throwable $e
        ) {
            Log::error(
                'Instantpay withdraw exception',
                [
                    'message' =>
                        $e->getMessage(),

                    'amount' =>
                        $amount,

                    'ref' =>
                        $ref,
                ]
            );

            throw new PaymentGatewayException(
                'Tidak dapat melakukan penarikan Instantpay.'
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | WITHDRAWAL LIST
    |--------------------------------------------------------------------------
    */

    /**
     * Ambil riwayat penarikan InstantPay.
     *
     * GET /api/v1/withdrawals
     */
    public function getWithdrawals(
        array $config
    ): array {
        $apiBaseUrl =
            $this->getApiBaseUrlFromConfig(
                $config
            );

        $apiKey =
            $config['api_key']
            ?? config('services.instantpay.api_key');

        if (!$apiKey) {
            throw new PaymentGatewayException(
                'API Key Instantpay belum dikonfigurasi.'
            );
        }

        $url =
            $apiBaseUrl
            . '/withdrawals';

        try {
            Log::info(
                'INSTANTPAY WITHDRAWALS REQUEST',
                [
                    'url' =>
                        $url,
                ]
            );

            $response =
                Http::timeout(15)
                    ->acceptJson()
                    ->withHeaders([
                        'X-Api-Key' =>
                            $apiKey,

                        'Content-Type' =>
                            'application/json',
                    ])
                    ->get($url);

            Log::info(
                'INSTANTPAY WITHDRAWALS RESPONSE',
                [
                    'status' =>
                        $response->status(),

                    'body' =>
                        $response->body(),
                ]
            );

            if (!$response->successful()) {
                throw new PaymentGatewayException(
                    'Instantpay withdrawals HTTP '
                    . $response->status()
                    . ': '
                    . $response->body()
                );
            }

            $data =
                $response->json();

            $result =
                $data['data']
                ?? [];

            /*
            |--------------------------------------------------------------------------
            | Bisa:
            |
            | data: [...]
            |
            | atau:
            |
            | data: {
            |     items: [...]
            | }
            |--------------------------------------------------------------------------
            */

            if (
                is_array($result)
                && isset($result['items'])
                && is_array($result['items'])
            ) {
                $items =
                    $result['items'];

            } elseif (
                is_array($result)
            ) {
                $items =
                    $result;

            } else {
                $items = [];
            }

            $items =
                array_values(
                    array_map(
                        function (
                            $item
                        ) {
                            return [
                                'id' =>
                                    $item['id']
                                    ?? null,

                                'amount' =>
                                    (int) (
                                        $item['amount']
                                        ?? 0
                                    ),

                                'fee' =>
                                    (int) (
                                        $item['fee']
                                        ?? 0
                                    ),

                                'transfer_amount' =>
                                    (int) (
                                        $item['transfer_amount']
                                        ?? $item['transferAmount']
                                        ?? 0
                                    ),

                                'bank' =>
                                    $item['bank']
                                    ?? null,

                                'account_number' =>
                                    $item['account_number']
                                    ?? null,

                                'status' =>
                                    $this->normalizeWithdrawalStatus(
                                        $item['status']
                                        ?? 'pending'
                                    ),

                                'ref' =>
                                    $item['ref']
                                    ?? null,

                                'created_at' =>
                                    $item['created_at']
                                    ?? $item['createdAt']
                                    ?? null,

                                'updated_at' =>
                                    $item['updated_at']
                                    ?? $item['updatedAt']
                                    ?? null,

                                'raw' =>
                                    $item,
                            ];
                        },
                        $items
                    )
                );

            return [
                'ok' =>
                    (bool) (
                        $data['ok']
                        ?? $data['success']
                        ?? true
                    ),

                'data' =>
                    $items,

                'raw' =>
                    $data,
            ];

        } catch (
            PaymentGatewayException $e
        ) {
            throw $e;

        } catch (
            \Throwable $e
        ) {
            Log::error(
                'Instantpay withdrawals exception',
                [
                    'message' =>
                        $e->getMessage(),
                ]
            );

            throw new PaymentGatewayException(
                'Tidak dapat mengambil riwayat penarikan Instantpay.'
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | WITHDRAWAL STATUS
    |--------------------------------------------------------------------------
    */

    /**
     * Cek status satu penarikan.
     *
     * GET /api/v1/withdrawal/status/{id}
     */
    public function getWithdrawalStatus(
        int|string $id,
        array $config
    ): array {
        $apiBaseUrl =
            $this->getApiBaseUrlFromConfig(
                $config
            );

        $apiKey =
            $config['api_key']
            ?? config('services.instantpay.api_key');

        if (!$apiKey) {
            throw new PaymentGatewayException(
                'API Key Instantpay belum dikonfigurasi.'
            );
        }

        if (!$id) {
            throw new PaymentGatewayException(
                'ID penarikan Instantpay tidak ditemukan.'
            );
        }

        $url =
            $apiBaseUrl
            . '/withdrawal/status/'
            . urlencode(
                (string) $id
            );

        try {
            Log::info(
                'INSTANTPAY WITHDRAWAL STATUS REQUEST',
                [
                    'url' =>
                        $url,

                    'withdrawal_id' =>
                        $id,
                ]
            );

            $response =
                Http::timeout(15)
                    ->acceptJson()
                    ->withHeaders([
                        'X-Api-Key' =>
                            $apiKey,

                        'Content-Type' =>
                            'application/json',
                    ])
                    ->get($url);

            Log::info(
                'INSTANTPAY WITHDRAWAL STATUS RESPONSE',
                [
                    'status' =>
                        $response->status(),

                    'body' =>
                        $response->body(),

                    'withdrawal_id' =>
                        $id,
                ]
            );

            if (!$response->successful()) {
                throw new PaymentGatewayException(
                    'Instantpay withdrawal status HTTP '
                    . $response->status()
                    . ': '
                    . $response->body()
                );
            }

            $data =
                $response->json();

            $result =
                $data['data']
                ?? $data;

            return [
                'ok' =>
                    (bool) (
                        $data['ok']
                        ?? $data['success']
                        ?? true
                    ),

                'id' =>
                    $result['id']
                    ?? $id,

                'amount' =>
                    (int) (
                        $result['amount']
                        ?? 0
                    ),

                'fee' =>
                    (int) (
                        $result['fee']
                        ?? 0
                    ),

                'transfer_amount' =>
                    (int) (
                        $result['transfer_amount']
                        ?? $result['transferAmount']
                        ?? 0
                    ),

                'status' =>
                    $this->normalizeWithdrawalStatus(
                        $result['status']
                        ?? 'pending'
                    ),

                'bank' =>
                    $result['bank']
                    ?? null,

                'account_number' =>
                    $result['account_number']
                    ?? null,

                'ref' =>
                    $result['ref']
                    ?? null,

                'created_at' =>
                    $result['created_at']
                    ?? $result['createdAt']
                    ?? null,

                'updated_at' =>
                    $result['updated_at']
                    ?? $result['updatedAt']
                    ?? null,

                'message' =>
                    $result['message']
                    ?? $data['message']
                    ?? null,

                'raw' =>
                    $data,
            ];

        } catch (
            PaymentGatewayException $e
        ) {
            throw $e;

        } catch (
            \Throwable $e
        ) {
            Log::error(
                'Instantpay withdrawal status exception',
                [
                    'message' =>
                        $e->getMessage(),

                    'withdrawal_id' =>
                        $id,
                ]
            );

            throw new PaymentGatewayException(
                'Tidak dapat mengecek status penarikan Instantpay.'
            );
        }
    }

    /*
    |--------------------------------------------------------------------------
    | HELPER
    |--------------------------------------------------------------------------
    */

    /**
     * Normalisasi API Base URL.
     *
     * Hasil:
     *
     * https://pay.instanlive.id/api/v1
     */
    private function getApiBaseUrl(
        string $baseUrl
    ): string {
        $baseUrl =
            rtrim(
                $baseUrl,
                '/'
            );

        if (
            str_ends_with(
                $baseUrl,
                '/api/v1'
            )
        ) {
            return $baseUrl;
        }

        return $baseUrl
            . '/api/v1';
    }

    /**
     * Ambil API Base URL dari config.
     */
    private function getApiBaseUrlFromConfig(
        array $config
    ): string {
        $baseUrl =
            $config['base_url']
            ?? config(
                'services.instantpay.base_url'
            );

        if (!$baseUrl) {
            throw new PaymentGatewayException(
                'Base URL Instantpay belum dikonfigurasi.'
            );
        }

        return $this->getApiBaseUrl(
            $baseUrl
        );
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE PAYMENT STATUS
    |--------------------------------------------------------------------------
    */

    /**
     * Normalisasi status pembayaran.
     *
     * BAGIAN INI DIPERTAHANKAN
     * karena flow QRIS kamu sudah bekerja.
     */
    private function normalizeStatus(
        ?string $status
    ): string {
        $status =
            strtolower(
                trim(
                    (string) $status
                )
            );

        return match ($status) {
            'paid',
            'success',
            'successful',
            'completed',
            'complete',
            'settled'
                => 'paid',

            'failed',
            'failure',
            'cancelled',
            'canceled'
                => 'failed',

            'expired',
            'expire'
                => 'expired',

            'refunded'
                => 'refunded',

            default
                => 'pending',
        };
    }

    /*
    |--------------------------------------------------------------------------
    | NORMALIZE WITHDRAWAL STATUS
    |--------------------------------------------------------------------------
    */

    /**
     * Normalisasi status withdrawal.
     */
    private function normalizeWithdrawalStatus(
        ?string $status
    ): string {
        $status =
            strtolower(
                trim(
                    (string) $status
                )
            );

        return match ($status) {
            'paid',
            'success',
            'successful',
            'completed',
            'complete',
            'settled'
                => 'paid',

            'approved'
                => 'approved',

            'processing',
            'processed',
            'transferring',
            'transfer'
                => 'processing',

            'failed',
            'failure',
            'rejected',
            'reject',
            'cancelled',
            'canceled'
                => 'failed',

            'expired',
            'expire'
                => 'expired',

            default
                => 'pending',
        };
    }
}