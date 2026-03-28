<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageRead implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomId;
    public $messageIds;

    public function __construct($roomId, $messageIds)
    {
        $this->roomId = $roomId;
        $this->messageIds = $messageIds;
    }

    public function broadcastOn()
    {
        return new \Illuminate\Broadcasting\PrivateChannel('chat.' . $this->roomId);
    }
}
