<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AdminDashboardController extends Controller
{
    public function stats()
    {
        $user = Auth::guard('api')->user();
        if ($user?->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $perPage = request('per_page', 10);

        // Include drafts to match the management panel list
        $totalOrders = Order::count(); 
        $pendingOrders = Order::where('status', 'pending')->count();
        $activeChats = 0; 

        // Paginated orders including drafts
        $orders = Order::with('user')
            ->latest()
            ->paginate($perPage);

        return response()->json([
            'stats' => [
                'total_orders' => $totalOrders,
                'pending_orders' => $pendingOrders,
                'active_chats' => $activeChats,
            ],
            'orders' => $orders,
        ]);
    }
}
