<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'package_id',
        'user_id',
        'guest_name',
        'guest_phone',
        'title',
        'description',
        'technology',
        'budget',
        'price',
        'price_note',
        'payment_status',
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

    protected $casts = [
        'price' => 'decimal:2',
        'budget' => 'decimal:2',
    ];

    protected $appends = ['total_paid', 'remaining_amount'];

    // ── Relationships ──

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function package()
    {
        return $this->belongsTo(Package::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function revisions()
    {
        return $this->hasMany(Revision::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function progress()
    {
        return $this->hasMany(OrderProgress::class)->orderBy('created_at', 'desc');
    }

    // ── Computed Attributes ──

    public function getTotalPaidAttribute()
    {
        return $this->payments()
            ->where('status', 'approved')
            ->sum('amount');
    }

    public function getRemainingAmountAttribute()
    {
        if (!$this->price) return null;
        return max(0, $this->price - $this->total_paid);
    }
}
