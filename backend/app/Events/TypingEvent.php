<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TypingEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $roomId;
    public $user;
    public $isTyping;

    public function __construct($roomId, $user, $isTyping)
    {
        $this->roomId = $roomId;
        $this->user = $user;
        $this->isTyping = $isTyping;
    }

    public function broadcastOn()
    {
        return new \Illuminate\Broadcasting\PrivateChannel('chat.' . $this->roomId);
    }
}
