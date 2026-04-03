<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use App\Notifications\OrderNotification;
use App\Services\WhatsAppService;

class OrderController extends Controller
{
    public function index()
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $perPage = request('per_page', 10);

        if ($user->role === 'admin') {
            $orders = Order::with('user', 'assignedTo', 'payments')->latest()->paginate($perPage);
        } else {
            $orders = Order::where('user_id', $user->id)
                ->where('status', '!=', 'draft')
                ->with('assignedTo', 'payments')
                ->latest()
                ->paginate($perPage);
        }

        return response()->json($orders);
    }

    public function show($id)
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $order = Order::with(['user', 'assignedTo', 'revisions.user', 'payments', 'progress'])->findOrFail($id);

        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        return response()->json($order);
    }

    public function getDraft()
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $draft = Order::where('user_id', $user->id)
            ->where('status', 'draft')
            ->first();

        return response()->json($draft);
    }

    public function store(Request $request)
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $validated = $request->validate([
            'package_id' => 'nullable|exists:packages,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'deadline' => 'nullable|date',
            'status' => 'nullable|in:draft,pending',
            'extra_revisions' => 'nullable|integer|min:0',
            'guest_name' => 'nullable|string|max:255',
            'guest_phone' => 'nullable|string|max:20',
        ]);

        $validated['user_id'] = $user->id;
        $status = $validated['status'] ?? 'pending';

        if ($status === 'pending') {
            $validated['revisions_left'] = 2 + ($validated['extra_revisions'] ?? 0);
        }

        $order = Order::updateOrCreate(
            ['user_id' => $user->id, 'status' => 'draft'],
            $validated
        );

        if ($status === 'pending') {
            $admins = User::where('role', 'admin')->get();
            foreach ($admins as $admin) {
                $admin->notify(new OrderNotification([
                    'title' => 'Order Baru!',
                    'message' => "Order #{$order->id}: {$order->title} telah masuk.",
                    'url' => '/admin/orders',
                    'type' => 'order_new',
                ]));
            }

            // WhatsApp Gateway → notify admins
            try {
                $wa = new WhatsAppService();
                $message = WhatsAppService::formatNewOrderMessage($order, $user);
                $wa->notifyAdmins($message);
            } catch (\Exception $e) {
                Log::error('WhatsApp notification failed', ['error' => $e->getMessage()]);
            }
        }

        return response()->json($order, 201);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $order = Order::findOrFail($id);

        if ($user->id !== $order->user_id && $user->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'package_id' => 'nullable|exists:packages,id',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'deadline' => 'nullable|date',
            'status' => 'nullable|in:draft,pending,contacted,deal,progress,waiting_payment,revision,done',
            'guest_phone' => 'nullable|string|max:20',
            'guest_name' => 'nullable|string|max:255',
        ]);

        $order->update($validated);

        return response()->json([
            'message' => 'Order updated',
            'data' => $order,
        ]);
    }

    /**
     * Admin set harga untuk order.
     * Auto-set status ke waiting_payment.
     */
    public function setPrice(Request $request, $id)
    {
        $user = Auth::guard('api')->user();
        if ($user?->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $order = Order::findOrFail($id);

        $request->validate([
            'price' => 'required|numeric|min:1',
            'price_note' => 'nullable|string|max:1000',
        ]);

        $order->update([
            'price' => $request->price,
            'price_note' => $request->price_note,
            'status' => 'waiting_payment',
        ]);

        // Notify user
        if ($order->user) {
            $order->user->notify(new OrderNotification([
                'title' => 'Harga Order Ditentukan!',
                'message' => "Order #{$order->id} telah diberi harga Rp " . number_format($request->price, 0, ',', '.') . ". Silakan lakukan pembayaran.",
                'url' => '/dashboard',
                'type' => 'price_set',
            ]));
        }

        return response()->json([
            'message' => 'Harga berhasil ditentukan.',
            'data' => $order->fresh(['payments', 'progress']),
        ]);
    }

    public function updateStatus(Request $request, $id)
    {
        $user = Auth::guard('api')->user();
        if ($user?->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $order = Order::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:pending,contacted,deal,progress,waiting_payment,revision,done',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $order->update($validated);

        if ($order->user) {
            $order->user->notify(new OrderNotification([
                'title' => 'Update Status Order',
                'message' => "Order #{$order->id} Anda kini berstatus " . strtoupper($order->status),
                'url' => '/dashboard',
                'type' => 'order_status',
            ]));
        }

        return response()->json($order);
    }

    /**
     * Upload bukti pembayaran (legacy - kept for backward compatibility).
     */
    public function uploadPaymentProof(Request $request, $id)
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $order = Order::findOrFail($id);

        if ($user->id !== $order->user_id && $user->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
            'payment_method' => 'required|string|max:50',
        ]);

        if ($order->payment_proof && Storage::disk('public')->exists($order->payment_proof)) {
            Storage::disk('public')->delete($order->payment_proof);
        }

        $path = $request->file('file')->store('payments', 'public');

        $order->update([
            'payment_proof' => $path,
            'payment_method' => $request->payment_method,
        ]);

        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new OrderNotification([
                'title' => 'Bukti Bayar Masuk!',
                'message' => "Klien telah mengupload bukti bayar untuk Order #{$order->id}.",
                'url' => '/admin/orders',
                'type' => 'payment_proof',
            ]));
        }

        return response()->json([
            'message' => 'Upload berhasil',
            'data' => $order,
        ]);
    }

    /**
     * Tampilkan bukti pembayaran.
     */
    public function showPaymentProof($id)
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        $order = Order::findOrFail($id);

        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if (!$order->payment_proof) {
            return response()->json(['error' => 'No payment proof uploaded'], 404);
        }

        $fullPath = storage_path('app/public/' . $order->payment_proof);

        if (!file_exists($fullPath)) {
            Log::error('Payment proof file missing on disk', [
                'order_id' => $id,
                'db_path' => $order->payment_proof,
                'full_path' => $fullPath,
            ]);
            return response()->json(['error' => 'File not found on disk'], 404);
        }

        $mime = mime_content_type($fullPath) ?: 'application/octet-stream';

        return response()->file($fullPath, [
            'Content-Type' => $mime,
            'Content-Disposition' => 'inline; filename="' . basename($fullPath) . '"',
            'Cache-Control' => 'private, max-age=3600',
        ]);
    }

    public function requestRevision(Request $request, $id)
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $order = Order::findOrFail($id);

        if ($user->id !== $order->user_id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if ($order->revisions_left <= 0) {
            return response()->json(['error' => 'No revisions left'], 400);
        }

        $request->validate([
            'revision_note' => 'required|string',
        ]);

        $order->decrement('revisions_left');
        $order->update(['status' => 'revision']);

        return response()->json($order);
    }

    public function submitRating(Request $request, $id)
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $order = Order::findOrFail($id);

        if ($user->id !== $order->user_id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        $order->update([
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        // Automatically create a review for the moderation system
        \App\Models\Review::create([
            'user_id' => $user->id,
            'name' => $user->name,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'status' => 'pending', // Needs admin approval to show on landing page
        ]);

        return response()->json($order);
    }

    public function uploadResult(Request $request, $id)
    {
        $user = Auth::guard('api')->user();
        if ($user?->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $order = Order::findOrFail($id);

        $request->validate([
            'file' => 'required|file',
        ]);

        $path = $request->file('file')->store('results', 'public');
        $order->update(['result_path' => $path]);

        return response()->json($order);
    }

    public function downloadResult($id)
    {
        $user = Auth::guard('api')->user();
        $order = Order::findOrFail($id);

        if ($user?->role !== 'admin' && $order->user_id !== $user?->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if (!$order->result_path) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return Storage::disk('public')->download($order->result_path);
    }

    public function checkDeadlines()
    {
        $user = Auth::guard('api')->user();
        if ($user?->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $threeDaysFromNow = now()->addDays(3)->toDateString();
        $deadlines = Order::where('deadline', $threeDaysFromNow)
            ->whereNotIn('status', ['done'])
            ->get();

        foreach ($deadlines as $order) {
            $user->notify(new OrderNotification([
                'title' => 'Deadline H-3!',
                'message' => "Order #{$order->id}: {$order->title} tersisa 3 hari.",
                'url' => '/admin/orders',
                'type' => 'deadline_soon',
            ]));
        }

        return response()->json(['message' => count($deadlines) . ' notifications sent']);
    }
}