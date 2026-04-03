<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Revision;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Notifications\RevisionNotification;
use App\Services\WhatsAppService;
use Illuminate\Support\Facades\Log;

class RevisionController extends Controller
{
    public function index()
    {
        $user = Auth::guard('api')->user();
        if ($user->role === 'admin') {
            return Revision::with('order.user')->latest()->get();
        }
        
        return Revision::whereHas('order', function($q) use ($user) {
            $q->where('user_id', $user->id);
        })->with('order')->latest()->get();
    }

    public function store(Request $request)
    {
        $user = Auth::guard('api')->user();
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'description' => 'required|string',
            'deadline' => 'nullable|date',
            'file' => 'nullable|file|max:2048',
        ]);


        $order = Order::findOrFail($request->order_id);

        if ($order->user_id !== $user->id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($order->revisions_left <= 0) {
            return response()->json(['error' => 'No revisions left'], 400);
        }

        $order->decrement('revisions_left');
        $order->update(['status' => 'revision']);

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('revisions', 'public');
        }

        $revision = Revision::create([
            'order_id' => $order->id,
            'user_id' => $user->id,
            'description' => $request->description,
            'deadline' => $request->deadline,
            'file_path' => $filePath,
            'status' => 'pending',
        ]);

        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $admin->notify(new RevisionNotification([
                'title' => 'Permintaan Revisi!',
                'message' => "Revisi baru untuk Order #{$order->id} telah masuk.",
                'url' => "/admin/revisions",
                'type' => 'revision_new'
            ]));
        }

        // WhatsApp Gateway -> notify admins
        try {
            $wa = new WhatsAppService();
            $waMessage = WhatsAppService::formatNewRevisionMessage($order, $revision, $user);
            $wa->notifyAdmins($waMessage);
        } catch (\Exception $e) {
            Log::error('WhatsApp revision notification failed', ['error' => $e->getMessage()]);
        }

        return response()->json($revision, 201);
    }

    public function update(Request $request, $id)
    {
        $user = Auth::guard('api')->user();
        if ($user->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $revision = Revision::findOrFail($id);
        $request->validate([
            'status' => 'required|in:pending,process,done',
        ]);


        $revision->update(['status' => $request->status]);

        if ($request->status === 'done') {
            $revision->order->update(['status' => 'done']);

            if($revision->order->user) {
                $revision->order->user->notify(new RevisionNotification([
                    'title' => 'Revisi Selesai!',
                    'message' => "Revisi untuk Order #{$revision->order_id} telah diselesaikan.",
                    'url' => "/dashboard",
                    'type' => 'revision_done'
                ]));
            }
        }

        return response()->json($revision);
    }
}
