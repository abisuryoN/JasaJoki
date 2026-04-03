<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Cari order yang statusnya "revision" tapi tidak memiliki record di tabel revisions
$orders = \App\Models\Order::where('status', 'revision')
    ->whereDoesntHave('revisions')
    ->get();

foreach ($orders as $order) {
    \App\Models\Revision::create([
        'order_id' => $order->id,
        'user_id' => $order->user_id,
        'description' => 'Revisi otomatis direcover dari kegagalan sistem sebelumnya.',
        'status' => 'pending' // ini akan membuatnya muncul di Manajemen Revisi admin
    ]);
}

echo 'Successfully recovered ' . $orders->count() . ' stuck revisions.';
