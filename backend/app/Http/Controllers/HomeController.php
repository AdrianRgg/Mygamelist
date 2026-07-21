<?php

namespace App\Http\Controllers;

use App\Models\Review;
use App\Models\UserGame;
use App\Models\Friendship;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $me = $request->user()->id;

        // 1 — Juegos mejor valorados en la plataforma
        $topRated = Review::select('game_igdb_id', 'game_name')
            ->selectRaw('ROUND(AVG(rating), 1) as avg_rating')
            ->selectRaw('COUNT(*) as review_count')
            ->groupBy('game_igdb_id', 'game_name')
            ->having('review_count', '>=', 1)
            ->orderByDesc('avg_rating')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                $cover = UserGame::where('game_igdb_id', $item->game_igdb_id)
                    ->whereNotNull('game_cover')
                    ->value('game_cover');
                return [
                    'game_igdb_id' => $item->game_igdb_id,
                    'game_name'    => $item->game_name,
                    'avg_rating'   => $item->avg_rating,
                    'review_count' => $item->review_count,
                    'game_cover'   => $cover,
                ];
            });

        // 2 — Juegos más añadidos a listas
        $popular = UserGame::select('game_igdb_id', 'game_name', 'game_cover')
            ->selectRaw('COUNT(*) as total')
            ->groupBy('game_igdb_id', 'game_name', 'game_cover')
            ->orderByDesc('total')
            ->limit(10)
            ->get();

        // 3 — Actividad de amigos
        $friendIds = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($me) {
                $q->where('sender_id', $me)->orWhere('receiver_id', $me);
            })
            ->get()
            ->map(fn($f) => $f->sender_id === $me ? $f->receiver_id : $f->sender_id);

        $friendActivity = collect();

        if ($friendIds->isNotEmpty()) {
            $recentGames = UserGame::with('user:id,name,avatar')
                ->whereIn('user_id', $friendIds)
                ->orderByDesc('created_at')
                ->limit(10)
                ->get()
                ->map(fn($ug) => [
                    'type'         => 'game_added',
                    'user'         => [
                        'id'         => $ug->user->id,
                        'name'       => $ug->user->name,
                        'avatar_url' => $ug->user->avatar
                            ? asset('storage/' . $ug->user->avatar)
                            : null,
                    ],
                    'game_name'    => $ug->game_name,
                    'game_igdb_id' => $ug->game_igdb_id,
                    'game_cover'   => $ug->game_cover,
                    'status'       => $ug->status,
                    'created_at'   => $ug->created_at,
                ]);

            $recentReviews = Review::with('user:id,name,avatar')
                ->whereIn('user_id', $friendIds)
                ->orderByDesc('created_at')
                ->limit(10)
                ->get()
                ->map(fn($r) => [
                    'type'         => 'review_added',
                    'user'         => [
                        'id'         => $r->user->id,
                        'name'       => $r->user->name,
                        'avatar_url' => $r->user->avatar
                            ? asset('storage/' . $r->user->avatar)
                            : null,
                    ],
                    'game_name'    => $r->game_name,
                    'game_igdb_id' => $r->game_igdb_id,
                    'rating'       => $r->rating,
                    'body'         => $r->body,
                    'created_at'   => $r->created_at,
                ]);

            $friendActivity = $recentGames->concat($recentReviews)
                ->sortByDesc('created_at')
                ->values()
                ->take(15);
        }

        return response()->json([
            'top_rated' => $topRated,
            'popular'   => $popular,
            'activity'  => $friendActivity,
        ]);
    }
}