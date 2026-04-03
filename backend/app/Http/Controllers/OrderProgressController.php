<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\OrderProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

class OrderProgressController extends Controller
{
    /**
     * List progress entries for an order.
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

        $progress = $order->progress()->orderBy('created_at', 'desc')->get();

        return response()->json($progress);
    }

    /**
     * Admin upload progress (image + description).
     */
    public function store(Request $request, $orderId)
    {
        $user = Auth::guard('api')->user();
        if ($user?->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $order = Order::findOrFail($orderId);

        $request->validate([
            'image' => 'required|file|mimes:jpg,jpeg,png,gif,webp|max:2048',
            'description' => 'nullable|string|max:1000',
        ]);

        $file = $request->file('image');
        $fileName = 'progress_' . uniqid() . '.jpg';
        $path = 'order_progress/' . $fileName;

        // Kompresi image max ~1MB (resize width 1920px max, quality 75)
        $manager = new ImageManager(new Driver());
        $image = $manager->read($file->getRealPath());
        $image->scaleDown(width: 1920);
        $encoded = $image->toJpeg(75);
        
        Storage::disk('public')->put($path, $encoded->toString());

        $progress = OrderProgress::create([
            'order_id' => $order->id,
            'image_url' => $path,
            'description' => $request->description,
        ]);

        return response()->json([
            'message' => 'Progress berhasil ditambahkan.',
            'data' => $progress,
        ], 201);
    }

    /**
     * Admin delete a progress entry.
     */
    public function destroy($orderId, $progressId)
    {
        $user = Auth::guard('api')->user();
        if ($user?->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $progress = OrderProgress::where('order_id', $orderId)->findOrFail($progressId);

        // Delete image file
        if ($progress->image_url && Storage::disk('public')->exists($progress->image_url)) {
            Storage::disk('public')->delete($progress->image_url);
        }

        $progress->delete();

        return response()->json(['message' => 'Progress berhasil dihapus.']);
    }

    /**
     * Serve progress image (protected).
     */
    public function showImage($orderId, $progressId)
    {
        $user = Auth::guard('api')->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $progress = OrderProgress::where('order_id', $orderId)->findOrFail($progressId);
        $order = $progress->order;

        if ($user->role !== 'admin' && $order->user_id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        if (!$progress->image_url) {
            return response()->json(['error' => 'No image'], 404);
        }

        $fullPath = storage_path('app/public/' . $progress->image_url);

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
