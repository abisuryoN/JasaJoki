<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'subtitle',
        'price',
        'features',
        'is_popular',
        'sort_order',
    ];

    protected $casts = [
        'features' => 'array',
        'is_popular' => 'boolean',
    ];
}
