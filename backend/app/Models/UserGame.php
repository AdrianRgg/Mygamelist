<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserGame extends Model
{
    protected $fillable = [
        'user_id',
        'game_igdb_id',
        'game_name',
        'game_cover',
        'status',
        'rating',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}