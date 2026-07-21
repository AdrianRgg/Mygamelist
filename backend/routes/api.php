<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\UserGameController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FriendshipController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;

// Rutas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Rutas protegidas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
Route::get('/home', [HomeController::class, 'index']);
    // Perfil
    Route::get('/profile',         [ProfileController::class, 'me']);
    Route::post('/profile/avatar', [ProfileController::class, 'update']);

    // Juegos
    Route::get('/games/search/{query}/{page?}', [GameController::class, 'search']);
    Route::get('/games/random', [GameController::class, 'random']);

    Route::get('/games/{id}',                   [GameController::class, 'show']);

    // Lista personal
    Route::get('/user-games',               [UserGameController::class, 'index']);
    Route::post('/user-games',              [UserGameController::class, 'store']);
    Route::patch('/user-games/{id}',        [UserGameController::class, 'update']);
    Route::delete('/user-games/{id}',       [UserGameController::class, 'destroy']);
    Route::get('/user-games/igdb/{igdbId}', [UserGameController::class, 'getByIgdbId']);

    // Reseñas
    Route::get('/reviews/{igdbId}',      [ReviewController::class, 'index']);
    Route::get('/reviews/{igdbId}/mine', [ReviewController::class, 'myReview']);
    Route::post('/reviews',              [ReviewController::class, 'store']);
    Route::delete('/reviews/{id}',       [ReviewController::class, 'destroy']);

    // Amigos
    Route::get('/friends',                   [FriendshipController::class, 'friends']);
    Route::get('/friends/pending',           [FriendshipController::class, 'pending']);
    Route::get('/friends/search',            [FriendshipController::class, 'search']);
    Route::post('/friends/send',             [FriendshipController::class, 'send']);
    Route::patch('/friends/{id}/accept',     [FriendshipController::class, 'accept']);
    Route::patch('/friends/{id}/reject',     [FriendshipController::class, 'reject']);
    Route::delete('/friends/{id}',           [FriendshipController::class, 'destroy']);
    Route::get('/friends/profile/{userId}',  [FriendshipController::class, 'profile']);
});