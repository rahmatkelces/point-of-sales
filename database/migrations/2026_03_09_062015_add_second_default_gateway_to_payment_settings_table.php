<?php

use App\Models\PaymentSetting;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->string('second_default_gateway')
                ->default(PaymentSetting::GATEWAY_DEBIT)
                ->after('default_gateway');
        });
    }

    public function down(): void
    {
        Schema::table('payment_settings', function (Blueprint $table) {
            $table->dropColumn('second_default_gateway');
        });
    }
};