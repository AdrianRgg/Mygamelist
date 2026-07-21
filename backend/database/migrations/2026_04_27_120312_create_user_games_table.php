<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_games', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('game_igdb_id');
            $table->string('game_name');
            $table->string('game_cover')->nullable();
            $table->enum('status', ['playing', 'completed', 'dropped', 'pending']);
            $table->timestamps();

            $table->unique(['user_id', 'game_igdb_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_games');
    }
};