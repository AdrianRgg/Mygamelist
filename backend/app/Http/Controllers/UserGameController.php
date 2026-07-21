<?php

namespace App\Http\Controllers;

use App\Models\UserGame;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserGameController extends Controller
{
    // Obtener todos los juegos de la lista del usuario
    public function index(Request $request): JsonResponse
    {
        $games = UserGame::where('user_id', $request->user()->id)
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($games);
    }

    // Añadir juego a la lista
   public function store(Request $request): JsonResponse
{
    $data = $request->validate([
        'game_igdb_id' => 'required|string',
        'game_name'    => 'required|string',
        'game_cover'   => 'nullable|string',
        'status'       => 'required|in:playing,completed,dropped,pending',
        'rating'       => 'nullable|integer|min:1|max:10',
    ]);

    $userGame = UserGame::updateOrCreate(
        [
            'user_id'      => $request->user()->id,
            'game_igdb_id' => $data['game_igdb_id'],
        ],
        [
            'game_name'  => $data['game_name'],
            'game_cover' => $data['game_cover'],
            'status'     => $data['status'],
            'rating'     => $data['rating'] ?? null,
        ]
    );

    return response()->json($userGame, 201);
}

public function update(Request $request, int $id): JsonResponse
{
    $userGame = UserGame::where('user_id', $request->user()->id)
        ->findOrFail($id);

    $data = $request->validate([
        'status' => 'sometimes|in:playing,completed,dropped,pending',
        'rating' => 'nullable|integer|min:1|max:10',
    ]);

    $userGame->update($data);

    return response()->json($userGame);
}

    // Eliminar de la lista
    public function destroy(Request $request, int $id): JsonResponse
    {
        $userGame = UserGame::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $userGame->delete();

        return response()->json(['message' => 'Juego eliminado de tu lista']);
    }

    // Obtener estado de un juego concreto para el usuario
    public function getByIgdbId(Request $request, string $igdbId): JsonResponse
    {
        $userGame = UserGame::where('user_id', $request->user()->id)
            ->where('game_igdb_id', $igdbId)
            ->first();

        return response()->json($userGame); // null si no está en la lista
    }
}