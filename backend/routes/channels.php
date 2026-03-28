<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('chat.{roomId}', function ($user = null, $roomId) {
    if ($user && in_array(strtolower($user->role), ['admin', 'superadmin'])) return true;
    
    // For Guests or Users: verify from room ownership
    $room = \App\Models\ChatRoom::find($roomId);
    if (!$room) return false;

    // If room belongs to a registered user, they must be the one logged in
    if ($room->user_id) {
        return $user && (int)$room->user_id === (int)$user->id;
    }

    return true; 
});

Broadcast::channel('chat-room.{roomId}', function ($user, $roomId) {
    if ($user) {
        if (in_array(strtolower($user->role), ['admin', 'superadmin'])) {
            return ['id' => $user->id, 'name' => $user->name, 'role' => $user->role, 'last_seen' => $user->last_seen];
        }
        $room = \App\Models\ChatRoom::find($roomId);
        if ($room && (int)$room->user_id === (int)$user->id) {
            return ['id' => $user->id, 'name' => $user->name, 'role' => $user->role, 'last_seen' => $user->last_seen];
        }
    }
    return false;
});

Broadcast::channel('chat.presence', function ($user) {
    if ($user) {
        return ['id' => $user->id, 'name' => $user->name, 'role' => $user->role, 'last_seen' => $user->last_seen];
    }
    return false;
});

Broadcast::channel('admin.notifications', function ($user) {
    return $user && in_array(strtolower($user->role), ['admin', 'superadmin']);
});

Broadcast::channel('admin-orders', function ($user) {
    return $user && in_array(strtolower($user->role), ['admin', 'superadmin']);
});
