<?php

namespace App\Services\Payments;

use App\Exceptions\PaymentGatewayException;
use App\Models\PaymentSetting;
use App\Models\Transaction;

class PaymentGatewayManager
{
    public function __construct(
        private MidtransGateway $midtransGateway,
        private XenditGateway $xenditGateway,
        private InstantpayGateway $instantpayGateway
    ) {
    }

    public function createPayment(
        Transaction $transaction,
        string $gateway,
        PaymentSetting $setting
    ): array {
        return match ($gateway) {
            PaymentSetting::GATEWAY_MIDTRANS =>
                $this->midtransGateway->createCharge(
                    $transaction,
                    $setting->midtransConfig()
                ),

            PaymentSetting::GATEWAY_XENDIT =>
                $this->xenditGateway->createInvoice(
                    $transaction,
                    $setting->xenditConfig()
                ),

            PaymentSetting::GATEWAY_INSTANTPAY =>
                $this->instantpayGateway->createPayment(
                    $transaction,
                    $setting->instantpayConfig()
                ),

            default =>
                throw new PaymentGatewayException(
                    "Gateway {$gateway} belum didukung."
                ),
        };
    }

    public function getPaymentStatus(
        Transaction $transaction,
        string $gateway,
        PaymentSetting $setting
    ): array {
        return match ($gateway) {
            PaymentSetting::GATEWAY_INSTANTPAY =>
                $this->instantpayGateway->getPaymentStatus(
                    $transaction,
                    $setting->instantpayConfig()
                ),

            default =>
                throw new PaymentGatewayException(
                    "Status gateway {$gateway} belum didukung."
                ),
        };
    }
}