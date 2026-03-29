<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RevisionController;
use App\Http\Controllers\HelpPageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReviewController;

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

    // ✅ FIX: upload & view payment proof pakai route yang sama (/payment-proof)
    // sebelumnya upload pakai /payment — tidak match dengan frontend
    Route::post('/{id}/payment-proof', [OrderController::class, 'uploadPaymentProof']);
    Route::get('/{id}/payment-proof', [OrderController::class, 'showPaymentProof']);
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
// PUBLIC
// ==========================================
Route::get('help-pages/slug/{slug}', [HelpPageController::class, 'show']);
Route::get('reviews', [ReviewController::class, 'index']);
Route::post('reviews', [ReviewController::class, 'store'])->middleware('auth:api');