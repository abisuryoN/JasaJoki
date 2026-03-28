<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $user = Auth::guard('api')->user();
        return $user->notifications()->latest()->get();
    }

    public function markAsRead($id)
    {
        $user = Auth::guard('api')->user();
        $notification = $user->notifications()->findOrFail($id);
        $notification->markAsRead();
        return response()->json(['message' => 'Read']);
    }

    public function markAllAsRead()
    {
        Auth::guard('api')->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All marked as read']);
    }

    public function destroy($id)
    {
        $user = Auth::guard('api')->user();
        $user->notifications()->findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
