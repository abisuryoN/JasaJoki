<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\ChatRoom;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class ChatController extends Controller
{
    public function index()
    {
        $admin = Auth::guard('api')->user();
        if (!$admin || !in_array($admin->role, ['admin', 'superadmin'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $rooms = ChatRoom::with([
            'user',
            'messages' => function ($query) {
                $query->latest()->limit(1);
            }
        ])
            ->withCount([
                'messages as unread_count' => function ($query) {
                    $query->where('is_read', false)->where('sender_type', '!=', 'admin');
                }
            ])
            ->orderBy('unread_count', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($rooms);
    }

    public function store(Request $request)
    {
        $request->validate([
            'guest_name' => 'nullable|string',
            'guest_phone' => 'nullable|string',
        ]);

        $user = Auth::guard('api')->user();

        $room = ChatRoom::create([
            'user_id' => $user ? $user->id : null,
            'guest_name' => $user ? null : $request->guest_name,
            'guest_phone' => $user ? null : $request->guest_phone,
            'status' => 'open',
        ]);

        return response()->json($room, 201);
    }

    public function getMessages($id)
    {
        $room = ChatRoom::findOrFail($id);

        $messages = $room->messages()
            ->with('sender')
            ->orderBy('created_at', 'desc')
            ->cursorPaginate(30);

        return response()->json($messages);
    }

    public function getUserRoom(Request $request)
    {
        return ChatRoom::firstOrCreate([
            'user_id' => $request->user()->id
        ]);
    }

    public function sendMessage(Request $request, $roomId)
    {
        $request->validate([
            'message' => 'nullable|string',
            'file' => 'nullable|image|max:5120'
        ]);

        if (!$request->message && !$request->hasFile('file')) {
            return response()->json(['error' => 'Pesan atau file wajib diisi'], 422);
        }

        // ✅ Coba ambil user via JWT — guest tidak akan punya token
        $user = Auth::guard('api')->user();
        $room = ChatRoom::findOrFail($roomId);

        // ✅ Tentukan sender_type berdasarkan role, bukan langsung dari role string
        $sender_id = null;
        $sender_type = 'guest';

        if ($user) {
            $sender_id = $user->id;
            $sender_type = in_array($user->role, ['admin', 'superadmin']) ? 'admin' : 'user';
        }

        $message_type = 'text';
        $file_path = null;

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('chat_files', 'public');
            $file_path = asset('storage/' . $path);
            $message_type = 'image';
        }

        $message = ChatMessage::create([
            'chat_room_id' => $roomId,
            'sender_id' => $sender_id,
            'sender_type' => $sender_type,
            'message_type' => $message_type,
            'message' => $request->message,
            'file_path' => $file_path,
            'is_read' => false
        ]);

        if ($user)
            $message->load('sender');

        broadcast(new \App\Events\MessageSent($message))->toOthers();

        return response()->json($message);
    }

    public function markAsRead(Request $request, $roomId)
    {
        $user = Auth::guard('api')->user();
        $userId = $user ? $user->id : null;

        $query = ChatMessage::where('chat_room_id', $roomId)
            ->where('is_read', false);

        if ($userId) {
            // User/admin: baca semua pesan yang bukan dari diri sendiri
            $query->where('sender_id', '!=', $userId);
        } else {
            // Guest: baca pesan dari admin saja
            $query->where('sender_type', 'admin');
        }

        $messageIds = $query->pluck('id');

        if ($messageIds->isNotEmpty()) {
            ChatMessage::whereIn('id', $messageIds)->update(['is_read' => true]);
            broadcast(new \App\Events\MessageRead($roomId, $messageIds))->toOthers();
        }

        return response()->json(['success' => true]);
    }

    public function sendTyping(Request $request, $roomId)
    {
        $request->validate(['is_typing' => 'required|boolean']);

        $user = Auth::guard('api')->user();
        $room = ChatRoom::findOrFail($roomId);

        $userName = $user ? $user->name : ($room->guest_name ?: 'Guest');

        broadcast(new \App\Events\TypingEvent($roomId, $userName, $request->is_typing))->toOthers();

        return response()->json(['success' => true]);
    }

    public function getByUserId($userId)
    {
        $admin = Auth::guard('api')->user();
        if (!$admin || !in_array($admin->role, ['admin', 'superadmin'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $room = ChatRoom::where('user_id', $userId)->first();
        if (!$room) {
            return response()->json(['error' => 'Room not found'], 404);
        }

        return response()->json($room);
    }

    public function destroy($id)
    {
        $admin = Auth::guard('api')->user();
        if (!$admin || !in_array($admin->role, ['admin', 'superadmin'])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $room = ChatRoom::findOrFail($id);
        $room->messages()->delete();
        $room->delete();

        return response()->json(['message' => 'Chat room deleted successfully']);
    }
}