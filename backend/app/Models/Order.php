<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'guest_name',
        'guest_phone',
        'title',
        'description',
        'technology',
        'budget',
        'deadline',
        'status',
        'assigned_to',
        'extra_revisions',
        'revisions_left',
        'file_path',
        'result_path',
        'payment_proof',
        'payment_method',
        'rating',
        'comment',

    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function revisions()
    {
        return $this->hasMany(Revision::class);
    }
}
