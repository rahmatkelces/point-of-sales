<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('promotions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->nullable()->unique();

            $table->enum('type', [
                'price_discount',
                'buy_x_get_y_same',
                'buy_x_get_y_diff',
                'voucher_nominal',
            ]);

            $table->boolean('is_active')->default(true);

            $table->dateTime('start_at')->nullable();
            $table->dateTime('end_at')->nullable();

            $table->decimal('discount_nominal', 15, 2)->nullable();
            $table->decimal('min_purchase', 15, 2)->nullable();

            $table->unsignedInteger('buy_qty')->nullable();
            $table->unsignedInteger('get_qty')->nullable();

            $table->text('description')->nullable();
            $table->timestamps();

            $table->index(['type', 'is_active']);
            $table->index(['start_at', 'end_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('promotions');
    }
};