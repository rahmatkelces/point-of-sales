<?php

use App\Http\Controllers\Apps\CategoryController;
use App\Http\Controllers\Apps\CustomerController;
use App\Http\Controllers\Apps\PaymentSettingController;
use App\Http\Controllers\Apps\ProductController;
use App\Http\Controllers\Apps\ExtraController;
use App\Http\Controllers\Apps\PromotionController;
use App\Http\Controllers\Apps\TransactionController;
use App\Http\Controllers\Apps\WithdrawalController;
use App\Http\Controllers\Apps\StoreSettingController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Reports\ProfitReportController;
use App\Http\Controllers\Reports\SalesReportController;
use App\Http\Controllers\Reports\PaymentReportController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

Route::group([
    'prefix' => 'dashboard',
    'middleware' => ['auth'],
], function () {

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get('/', [
        DashboardController::class,
        'index',
    ])
        ->middleware([
            'auth',
            'verified',
            'permission:dashboard-access',
        ])
        ->name('dashboard');

    /*
    |--------------------------------------------------------------------------
    | Permissions
    |--------------------------------------------------------------------------
    */

    Route::get('/permissions', [
        PermissionController::class,
        'index',
    ])
        ->middleware(
            'permission:permissions-access'
        )
        ->name('permissions.index');

    /*
    |--------------------------------------------------------------------------
    | Roles
    |--------------------------------------------------------------------------
    */

    Route::resource(
        '/roles',
        RoleController::class
    )
        ->except([
            'create',
            'edit',
            'show',
        ])
        ->middlewareFor(
            'index',
            'permission:roles-access'
        )
        ->middlewareFor(
            'store',
            'permission:roles-create'
        )
        ->middlewareFor(
            'update',
            'permission:roles-update'
        )
        ->middlewareFor(
            'destroy',
            'permission:roles-delete'
        );

    /*
    |--------------------------------------------------------------------------
    | Users
    |--------------------------------------------------------------------------
    */

    Route::resource(
        '/users',
        UserController::class
    )
        ->except('show')
        ->middlewareFor(
            'index',
            'permission:users-access'
        )
        ->middlewareFor(
            ['create', 'store'],
            'permission:users-create'
        )
        ->middlewareFor(
            ['edit', 'update'],
            'permission:users-update'
        )
        ->middlewareFor(
            'destroy',
            'permission:users-delete'
        );

    /*
    |--------------------------------------------------------------------------
    | Categories
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'categories',
        CategoryController::class
    )
        ->middlewareFor(
            ['index', 'show'],
            'permission:categories-access'
        )
        ->middlewareFor(
            ['create', 'store'],
            'permission:categories-create'
        )
        ->middlewareFor(
            ['edit', 'update'],
            'permission:categories-edit'
        )
        ->middlewareFor(
            'destroy',
            'permission:categories-delete'
        );

    /*
    |--------------------------------------------------------------------------
    | Products
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'products',
        ProductController::class
    )
        ->middlewareFor(
            ['index', 'show'],
            'permission:products-access'
        )
        ->middlewareFor(
            ['create', 'store'],
            'permission:products-create'
        )
        ->middlewareFor(
            ['edit', 'update'],
            'permission:products-edit'
        )
        ->middlewareFor(
            'destroy',
            'permission:products-delete'
        );

    /*
    |--------------------------------------------------------------------------
    | Extras
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'extras',
        ExtraController::class
    )
        ->middlewareFor(
            ['index', 'show'],
            'permission:extras-access'
        )
        ->middlewareFor(
            ['create', 'store'],
            'permission:extras-create'
        )
        ->middlewareFor(
            ['edit', 'update'],
            'permission:extras-edit'
        )
        ->middlewareFor(
            'destroy',
            'permission:extras-delete'
        );

    /*
    |--------------------------------------------------------------------------
    | Promotions
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'promotions',
        PromotionController::class
    )
        ->middlewareFor(
            ['index', 'show'],
            'permission:promotions-access'
        )
        ->middlewareFor(
            ['create', 'store'],
            'permission:promotions-create'
        )
        ->middlewareFor(
            ['edit', 'update'],
            'permission:promotions-edit'
        )
        ->middlewareFor(
            'destroy',
            'permission:promotions-delete'
        );

    /*
    |--------------------------------------------------------------------------
    | Customers
    |--------------------------------------------------------------------------
    */

    Route::resource(
        'customers',
        CustomerController::class
    )
        ->middlewareFor(
            ['index', 'show'],
            'permission:customers-access'
        )
        ->middlewareFor(
            ['create', 'store'],
            'permission:customers-create'
        )
        ->middlewareFor(
            ['edit', 'update'],
            'permission:customers-edit'
        )
        ->middlewareFor(
            'destroy',
            'permission:customers-delete'
        );

    /*
    |--------------------------------------------------------------------------
    | Customer History
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/customers/{customer}/history',
        [
            CustomerController::class,
            'getHistory',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name('customers.history');

    /*
    |--------------------------------------------------------------------------
    | Customer AJAX
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/customers/store-ajax',
        [
            CustomerController::class,
            'storeAjax',
        ]
    )
        ->middleware(
            'permission:customers-create'
        )
        ->name('customers.storeAjax');

    /*
    |--------------------------------------------------------------------------
    | Transactions
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | POS Index
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/transactions',
        [
            TransactionController::class,
            'index',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name('transactions.index');

    /*
    |--------------------------------------------------------------------------
    | Search Product
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/transactions/searchProduct',
        [
            TransactionController::class,
            'searchProduct',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name('transactions.searchProduct');

    /*
    |--------------------------------------------------------------------------
    | Add To Cart
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/transactions/addToCart',
        [
            TransactionController::class,
            'addToCart',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name('transactions.addToCart');

    /*
    |--------------------------------------------------------------------------
    | Destroy Cart
    |--------------------------------------------------------------------------
    */

    Route::delete(
        '/transactions/{cart_id}/destroyCart',
        [
            TransactionController::class,
            'destroyCart',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name('transactions.destroyCart');

    /*
    |--------------------------------------------------------------------------
    | Update Cart
    |--------------------------------------------------------------------------
    */

    Route::patch(
        '/transactions/{cart_id}/updateCart',
        [
            TransactionController::class,
            'updateCart',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name('transactions.updateCart');

    /*
    |--------------------------------------------------------------------------
    | Hold Transaction
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/transactions/hold',
        [
            TransactionController::class,
            'holdCart',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name('transactions.hold');

    /*
    |--------------------------------------------------------------------------
    | Resume Transaction
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/transactions/{holdId}/resume',
        [
            TransactionController::class,
            'resumeCart',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name('transactions.resume');

    /*
    |--------------------------------------------------------------------------
    | Clear Held Transaction
    |--------------------------------------------------------------------------
    */

    Route::delete(
        '/transactions/{holdId}/clearHold',
        [
            TransactionController::class,
            'clearHold',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name('transactions.clearHold');

    /*
    |--------------------------------------------------------------------------
    | Get Held Transactions
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/transactions/held',
        [
            TransactionController::class,
            'getHeldCarts',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name('transactions.held');

    /*
    |--------------------------------------------------------------------------
    | Store Transaction
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/transactions/store',
        [
            TransactionController::class,
            'store',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name('transactions.store');

    /*
    |--------------------------------------------------------------------------
    | Instantpay Payment Status
    |--------------------------------------------------------------------------
    |
    | Browser akan melakukan polling ke endpoint ini setiap
    | beberapa detik untuk mengecek apakah pembayaran
    | Instantpay sudah PAID.
    |
    */

    Route::get(
        '/transactions/{transaction}/payment-status',
        [
            TransactionController::class,
            'paymentStatus',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name(
            'transactions.paymentStatus'
        );

    /*
    |--------------------------------------------------------------------------
    | Withdrawals / Penarikan Saldo Instantpay
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/withdrawals',
        [
            WithdrawalController::class,
            'index',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name(
            'withdrawals.index'
        );

    Route::post(
        '/withdrawals',
        [
            WithdrawalController::class,
            'store',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name(
            'withdrawals.store'
        );

    /*
    |--------------------------------------------------------------------------
    | Print Transaction
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/transactions/{invoice}/print',
        [
            TransactionController::class,
            'print',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name(
            'transactions.print'
        );

    /*
    |--------------------------------------------------------------------------
    | Transaction History
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/transactions/history',
        [
            TransactionController::class,
            'history',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name(
            'transactions.history'
        );

    /*
    |--------------------------------------------------------------------------
    | Apply Promotion
    |--------------------------------------------------------------------------
    */

    Route::post(
        '/transactions/apply-promotion',
        [
            TransactionController::class,
            'applyPromotion',
        ]
    )
        ->middleware(
            'permission:transactions-access'
        )
        ->name(
            'transactions.applyPromotion'
        );

    /*
    |--------------------------------------------------------------------------
    | Payment Settings
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/settings/payments',
        [
            PaymentSettingController::class,
            'edit',
        ]
    )
        ->middleware(
            'permission:payment-settings-access'
        )
        ->name(
            'settings.payments.edit'
        );

    Route::put(
        '/settings/payments',
        [
            PaymentSettingController::class,
            'update',
        ]
    )
        ->middleware(
            'permission:payment-settings-access'
        )
        ->name(
            'settings.payments.update'
        );

    /*
    |--------------------------------------------------------------------------
    | Store Settings
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/settings/store',
        [
            StoreSettingController::class,
            'edit',
        ]
    )
        ->middleware(
            'permission:store-settings-access'
        )
        ->name(
            'settings.store.edit'
        );

    Route::put(
        '/settings/store',
        [
            StoreSettingController::class,
            'update',
        ]
    )
        ->middleware(
            'permission:store-settings-update'
        )
        ->name(
            'settings.store.update'
        );

    Route::delete(
        '/settings/store/logo',
        [
            StoreSettingController::class,
            'destroyLogo',
        ]
    )
        ->middleware(
            'permission:store-settings-update'
        )
        ->name(
            'settings.store.logo.destroy'
        );

    /*
    |--------------------------------------------------------------------------
    | Reports
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | Sales Report
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/reports/sales',
        [
            SalesReportController::class,
            'index',
        ]
    )
        ->middleware(
            'permission:reports-access'
        )
        ->name(
            'reports.sales.index'
        );

    /*
    |--------------------------------------------------------------------------
    | Sales Report - Export Excel
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/reports/sales/export',
        [
            SalesReportController::class,
            'export',
        ]
    )
        ->middleware(
            'permission:reports-access'
        )
        ->name(
            'reports.sales.export'
        );

    /*
    |--------------------------------------------------------------------------
    | Payment Report
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/reports/payments',
        [
            PaymentReportController::class,
            'index',
        ]
    )
        ->middleware(
            'permission:reports-access'
        )
        ->name(
            'reports.payments.index'
        );

    /*
    |--------------------------------------------------------------------------
    | Payment Report - Export Excel
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/reports/payments/export',
        [
            PaymentReportController::class,
            'export',
        ]
    )
        ->middleware(
            'permission:reports-access'
        )
        ->name(
            'reports.payments.export'
        );

    /*
    |--------------------------------------------------------------------------
    | Profit Report
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/reports/profits',
        [
            ProfitReportController::class,
            'index',
        ]
    )
        ->middleware(
            'permission:profits-access'
        )
        ->name(
            'reports.profits.index'
        );

    /*
    |--------------------------------------------------------------------------
    | Profile
    |--------------------------------------------------------------------------
    */

    Route::get(
        '/profile',
        [
            ProfileController::class,
            'edit',
        ]
    )
        ->name(
            'profile.edit'
        );

    Route::patch(
        '/profile',
        [
            ProfileController::class,
            'update',
        ]
    )
        ->name(
            'profile.update'
        );

    Route::delete(
        '/profile',
        [
            ProfileController::class,
            'destroy',
        ]
    )
        ->name(
            'profile.destroy'
        );
});

require __DIR__ . '/auth.php';