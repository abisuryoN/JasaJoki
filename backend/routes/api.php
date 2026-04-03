<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RevisionController;
use App\Http\Controllers\HelpPageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\PackageController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\OrderProgressController;
use App\Http\Controllers\AdminDashboardController;

// ==========================================
// AUTH
// ==========================================
Route::group(['prefix' => 'auth'], function () {
    Route::post('login', [AuthController::class, 'login']);
    Route::get('google', [AuthController::class, 'redirectToGoogle']);
    Route::get('google/callback', [AuthController::class, 'handleGoogleCallback']);

    Route::middleware('auth:api')->group(function () {
        Route::get('me', [AuthController::class, 'me']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

// ==========================================
// ORDERS
// ==========================================
Route::group(['prefix' => 'orders', 'middleware' => 'auth:api'], function () {
    Route::get('/', [OrderController::class, 'index']);
    Route::get('/draft', [OrderController::class, 'getDraft']);
    Route::post('/', [OrderController::class, 'store']);

    Route::get('/{id}', [OrderController::class, 'show']);
    Route::put('/{id}', [OrderController::class, 'update']);
    Route::post('/{id}/status', [OrderController::class, 'updateStatus']);
    Route::post('/{id}/revision', [OrderController::class, 'requestRevision']);
    Route::post('/{id}/rating', [OrderController::class, 'submitRating']);
    Route::post('/{id}/upload', [OrderController::class, 'uploadResult']);
    Route::get('/{id}/download', [OrderController::class, 'downloadResult']);

    // Legacy payment proof
    Route::post('/{id}/payment-proof', [OrderController::class, 'uploadPaymentProof']);
    Route::get('/{id}/payment-proof', [OrderController::class, 'showPaymentProof']);

    // Admin set price
    Route::post('/{id}/set-price', [OrderController::class, 'setPrice']);

    // Payments (DP, cicilan, pelunasan)
    Route::get('/{id}/payments', [PaymentController::class, 'index']);
    Route::post('/{id}/payments', [PaymentController::class, 'store']);
    Route::put('/{id}/payments/{paymentId}/status', [PaymentController::class, 'updateStatus']);
    Route::get('/{id}/payments/{paymentId}/proof', [PaymentController::class, 'showProofImage']);

    // Order Progress
    Route::get('/{id}/progress', [OrderProgressController::class, 'index']);
    Route::post('/{id}/progress', [OrderProgressController::class, 'store']);
    Route::delete('/{id}/progress/{progressId}', [OrderProgressController::class, 'destroy']);
    Route::get('/{id}/progress/{progressId}/image', [OrderProgressController::class, 'showImage']);
});

// ==========================================
// MISC (auth required)
// ==========================================
Route::group(['middleware' => 'auth:api'], function () {
    Route::apiResource('revisions', RevisionController::class);
    Route::apiResource('help-pages', HelpPageController::class);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('notifications/{id}', [NotificationController::class, 'destroy']);
});

// ==========================================
// PUBLIC ENDPOINTS
// ==========================================
Route::get('help-pages/slug/{slug}', [HelpPageController::class, 'show']);

// Reviews (public: approved only)
Route::get('reviews', [ReviewController::class, 'index']);
Route::get('reviews/stats', [ReviewController::class, 'stats']);

// Reviews (auth: submit)
Route::post('reviews', [ReviewController::class, 'store'])->middleware('auth:api');

// Packages (public)
Route::get('packages', [PackageController::class, 'index']);

// Portfolios (public)
Route::get('portfolios', [PortfolioController::class, 'index']);

// ==========================================
// ADMIN ENDPOINTS (auth + admin check inside controllers)
// ==========================================
Route::group(['prefix' => 'admin', 'middleware' => 'auth:api'], function () {
    // Stats
    Route::get('dashboard-stats', [AdminDashboardController::class, 'stats']);

    // Review moderation
    Route::get('reviews', [ReviewController::class, 'adminIndex']);
    Route::put('reviews/{id}/status', [ReviewController::class, 'updateStatus']);

    // Package CRUD
    Route::post('packages', [PackageController::class, 'store']);
    Route::put('packages/{id}', [PackageController::class, 'update']);
    Route::delete('packages/{id}', [PackageController::class, 'destroy']);

    // Portfolio CRUD
    Route::get('portfolios', [PortfolioController::class, 'adminIndex']);
    Route::post('portfolios', [PortfolioController::class, 'store']);
    Route::put('portfolios/{id}', [PortfolioController::class, 'update']);
    Route::delete('portfolios/{id}', [PortfolioController::class, 'destroy']);
});