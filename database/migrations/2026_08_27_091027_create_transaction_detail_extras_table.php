<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaction_detail_extras', function (Blueprint $table) {
            $table->id();

            $table->foreignId('transaction_detail_id')
                ->constrained('transaction_details')
                ->cascadeOnDelete();

            $table->foreignId('extra_id')
                ->constrained('extras')
                ->restrictOnDelete();

            $table->unsignedInteger('qty')
                ->default(1);

            $table->decimal('price', 15, 2);

            $table->timestamps();

            $table->index([
                'transaction_detail_id',
                'extra_id',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists(
            'transaction_detail_extras'
        );
    }
};