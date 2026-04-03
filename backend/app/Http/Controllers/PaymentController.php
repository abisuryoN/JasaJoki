<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\OrderNotification;
use App\Services\WhatsAppService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PaymentController extends Controller
{
    /**
     * List semua pembayaran untuk sebuah order.
     */
    public function index($orderId)
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $order = Order::findOrFail($orderId);

        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $payments = $order->payments()->orderBy('created_at', 'desc')->get();

        return response()->json($payments);
    }

    /**
     * User submit pembayaran (upload bukti).
     *
     * Logic:
     * - Harga ≤ 500.000 → type = pelunasan
     * - Harga > 500.000 → pertama harus dp (≥ 50%), setelahnya cicilan/pelunasan
     */
    public function store(Request $request, $orderId)
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $order = Order::findOrFail($orderId);

        if ($user->id !== $order->user_id && $user->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if (!$order->price) {
            return response()->json(['error' => 'Harga belum ditentukan oleh admin'], 400);
        }

        if ($order->payment_status === 'paid') {
            return response()->json(['error' => 'Order sudah lunas'], 400);
        }

        $request->validate([
            'proof_image' => 'required|file|mimes:jpg,jpeg,png|max:5120',
            'amount' => 'required|numeric|min:1',
        ]);

        $amount = (float) $request->amount;
        $totalPaid = $order->total_paid;
        $remaining = $order->price - $totalPaid;

        // Determine payment type
        if ($order->price <= 500000) {
            // Harga ≤ 500k → harus full payment
            $type = 'pelunasan';
            if ($amount < $remaining) {
                return response()->json([
                    'error' => 'Harga ≤ Rp 500.000 harus dibayar penuh.',
                    'required_amount' => $remaining,
                ], 422);
            }
        } else {
            // Harga > 500k
            if ($totalPaid == 0) {
                // Pembayaran pertama = DP (min 50%)
                $type = 'dp';
                $minDp = ceil($order->price * 0.5);
                if ($amount < $minDp) {
                    return response()->json([
                        'error' => "DP minimal 50% dari harga (Rp " . number_format($minDp, 0, ',', '.') . ")",
                        'minimum_dp' => $minDp,
                    ], 422);
                }
            } else {
                // Sudah bayar DP → cicilan atau pelunasan
                if ($amount >= $remaining) {
                    $type = 'pelunasan';
                } else {
                    $type = 'cicilan';
                }
            }
        }

        // Cap amount to remaining
        if ($amount > $remaining) {
            $amount = $remaining;
        }

        // Store proof image
        $path = $request->file('proof_image')->store('payment_proofs', 'public');

        $payment = Payment::create([
            'order_id' => $order->id,
            'amount' => $amount,
            'type' => $type,
            'status' => 'pending',
            'proof_image' => $path,
        ]);

        // Notify admins
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new OrderNotification([
                'title' => 'Bukti Pembayaran Masuk!',
                'message' => "Pembayaran " . strtoupper($type) . " Rp " . number_format($amount, 0, ',', '.') . " untuk Order #{$order->id}",
                'url' => '/admin/orders',
                'type' => 'payment_submitted',
            ]));
        }

        // WhatsApp Gateway → notify admins
        try {
            $wa = new WhatsAppService();
            $message = WhatsAppService::formatPaymentMessage($order, $payment);
            $wa->notifyAdmins($message);
        } catch (\Exception $e) {
            Log::error('WhatsApp payment notification failed', ['error' => $e->getMessage()]);
        }

        return response()->json([
            'message' => 'Pembayaran berhasil disubmit, menunggu persetujuan admin.',
            'data' => $payment,
        ], 201);
    }

    /**
     * Admin approve / reject pembayaran.
     * Auto-update payment_status dan order status.
     */
    public function updateStatus(Request $request, $orderId, $paymentId)
    {
        $user = Auth::guard('api')->user();
        if ($user?->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $payment = Payment::where('order_id', $orderId)->findOrFail($paymentId);
        $order = $payment->order;

        $request->validate([
            'status' => 'required|in:approved,rejected',
            'admin_note' => 'nullable|string|max:500',
        ]);

        $payment->update([
            'status' => $request->status,
            'admin_note' => $request->admin_note,
        ]);

        // Recalculate payment status if approved
        if ($request->status === 'approved') {
            $this->recalculatePaymentStatus($order);
        }

        // Notify user
        $statusText = $request->status === 'approved' ? 'disetujui ✅' : 'ditolak ❌';
        $order->user->notify(new OrderNotification([
            'title' => 'Update Pembayaran',
            'message' => "Pembayaran Rp " . number_format($payment->amount, 0, ',', '.') . " untuk Order #{$order->id} {$statusText}",
            'url' => '/dashboard',
            'type' => 'payment_status',
        ]));

        return response()->json([
            'message' => 'Status pembayaran diperbarui.',
            'data' => $payment,
            'order' => $order->fresh(),
        ]);
    }

    /**
     * Recalculate order's payment_status and auto-update order status.
     */
    private function recalculatePaymentStatus(Order $order)
    {
        $order->refresh();
        $totalPaid = $order->total_paid;
        $price = $order->price;

        if ($totalPaid <= 0) {
            $order->update(['payment_status' => 'unpaid']);
        } elseif ($totalPaid >= $price) {
            $order->update([
                'payment_status' => 'paid',
                'status' => 'done',
            ]);
        } elseif ($totalPaid >= ($price * 0.5)) {
            // Has paid DP
            $hasMultiplePayments = $order->payments()->where('status', 'approved')->count() > 1;
            $newPaymentStatus = $hasMultiplePayments ? 'partially_paid' : 'dp_paid';

            $updateData = ['payment_status' => $newPaymentStatus];

            // Auto set to progress if currently waiting_payment
            if ($order->status === 'waiting_payment') {
                $updateData['status'] = 'progress';
            }

            $order->update($updateData);
        } else {
            // Less than 50% but something paid (shouldn't happen with min DP rule, but safety)
            $order->update(['payment_status' => 'partially_paid']);
        }
    }

    /**
     * Serve payment proof image (protected).
     */
    public function showProofImage($orderId, $paymentId)
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $payment = Payment::where('order_id', $orderId)->findOrFail($paymentId);
        $order = $payment->order;

        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if (!$payment->proof_image) {
            return response()->json(['error' => 'No proof image'], 404);
        }

        $fullPath = storage_path('app/public/' . $payment->proof_image);

        if (!file_exists($fullPath)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        $mime = mime_content_type($fullPath) ?: 'application/octet-stream';

        return response()->file($fullPath, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline',
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }
}
