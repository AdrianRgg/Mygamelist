<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    // Obtener reseñas de un juego
    public function index(string $igdbId): JsonResponse
{
    $reviews = Review::with('user:id,name,avatar')
        ->where('game_igdb_id', $igdbId)
        ->orderBy('created_at', 'desc')
        ->get()
        ->map(function ($review) {
            return [
                'id'           => $review->id,
                'user_id'      => $review->user_id,
                'game_igdb_id' => $review->game_igdb_id,
                'game_name'    => $review->game_name,
                'rating'       => $review->rating,
                'body'         => $review->body,
                'created_at'   => $review->created_at,
                'user'         => [
                    'id'         => $review->user->id,
                    'name'       => $review->user->name,
                    'avatar_url' => $review->user->avatar
                        ? asset('storage/' . $review->user->avatar)
                        : null,
                ],
            ];
        });

    return response()->json($reviews);
}

    // Crear reseña
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'game_igdb_id' => 'required|string',
            'game_name'    => 'required|string',
            'rating'       => 'required|integer|min:1|max:10',
            'body'         => 'required|string|min:10',
        ]);

        // Un usuario solo puede reseñar un juego una vez
        $existing = Review::where('user_id', $request->user()->id)
            ->where('game_igdb_id', $data['game_igdb_id'])
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'Ya has escrito una reseña para este juego'
            ], 422);
        }

        $review = Review::create([
            'user_id'      => $request->user()->id,
            'game_igdb_id' => $data['game_igdb_id'],
            'game_name'    => $data['game_name'],
            'rating'       => $data['rating'],
            'body'         => $data['body'],
        ]);

        $review->load('user:id,name');

        return response()->json($review, 201);
    }

    // Eliminar reseña propia
    public function destroy(Request $request, int $id): JsonResponse
    {
        $review = Review::where('user_id', $request->user()->id)
            ->findOrFail($id);

        $review->delete();

        return response()->json(['message' => 'Reseña eliminada']);
    }

    // Obtener reseña propia para un juego
    public function myReview(Request $request, string $igdbId): JsonResponse
    {
        $review = Review::where('user_id', $request->user()->id)
            ->where('game_igdb_id', $igdbId)
            ->first();

        return response()->json($review);
    }
}