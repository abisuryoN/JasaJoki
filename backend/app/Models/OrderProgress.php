<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderProgress extends Model
{
    protected $table = 'order_progress';

    protected $fillable = [
        'order_id',
        'image_url',
        'description',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }
}
