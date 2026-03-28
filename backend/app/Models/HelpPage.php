<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HelpPage extends Model
{
    protected $fillable = [
        'title',
        'slug',
        'content',
        'type',
    ];
}
