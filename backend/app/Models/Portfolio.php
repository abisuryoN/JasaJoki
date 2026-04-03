<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'category',
        'description',
        'tech_stack',
        'icon',
        'is_published',
        'sort_order',
    ];

    protected $casts = [
        'tech_stack' => 'array',
        'is_published' => 'boolean',
    ];

    /**
     * Scope: only published portfolios (for public display)
     */
    public function scopePublished($query)
    {
        return $query->where('is_published', true);
    }
}
