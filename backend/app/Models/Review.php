<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'user_id',
        'game_igdb_id',
        'game_name',
        'rating',
        'body',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}