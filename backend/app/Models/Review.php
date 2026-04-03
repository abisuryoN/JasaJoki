<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'rating',
        'comment',
        'status',
    ];

    /**
     * Scope: only approved reviews (for public display)
     */
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
