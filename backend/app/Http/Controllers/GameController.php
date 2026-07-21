<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class GameController extends Controller
{
    private function getIgdbToken(): string
    {
        return Cache::remember('igdb_token', 3600 * 24 * 50, function () {
            $response = Http::post('https://id.twitch.tv/oauth2/token', [
                'client_id'     => config('services.igdb.client_id'),
                'client_secret' => config('services.igdb.client_secret'),
                'grant_type'    => 'client_credentials',
            ]);

            return $response->json('access_token');
        });
    }

    private function igdbRequest(string $endpoint, string $query): array
    {
        $token    = $this->getIgdbToken();
        $clientId = config('services.igdb.client_id');

        $response = Http::withHeaders([
            'Client-ID'     => $clientId,
            'Authorization' => "Bearer {$token}",
        ])->withBody($query, 'text/plain')
          ->post("https://api.igdb.com/v4/{$endpoint}");

        return $response->json() ?? [];
    }

    public function search(string $query, int $page = 1): JsonResponse
    {
        $limit  = 20;
        $offset = ($page - 1) * $limit;

        $games = $this->igdbRequest('games', "
            search \"{$query}\";
            fields id, name, cover.url, summary, first_release_date, platforms.name, rating;
            where cover != null;
            limit {$limit};
            offset {$offset};
        ");

        $games = array_map(fn($g) => $this->formatGame($g), $games);

        return response()->json([
            'data'     => $games,
            'page'     => $page,
            'has_more' => count($games) === $limit,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $games = $this->igdbRequest('games', "
            fields id, name, cover.url, summary, first_release_date, platforms.name, rating, genres.name, screenshots.url;
            where id = {$id};
        ");

        if (empty($games)) {
            return response()->json(['message' => 'Juego no encontrado'], 404);
        }

        $game = $this->formatGame($games[0]);

        // Intentar obtener descripción en español
        $translations = $this->igdbRequest('game_translations', "
            fields summary, game;
            where game = {$id} & language = (3);
        ");

        if (!empty($translations) && isset($translations[0]['summary'])) {
            $game['summary'] = $translations[0]['summary'];
        }

        // Puntuación media de nuestras reseñas
        $avgRating = \App\Models\Review::where('game_igdb_id', (string) $id)->avg('rating');
        $game['community_rating'] = $avgRating ? round($avgRating, 1) : null;
        $game['review_count'] = \App\Models\Review::where('game_igdb_id', (string) $id)->count();

        return response()->json($game);
    }

    private function formatGame(array $game): array
    {
        $cover = isset($game['cover']['url'])
            ? 'https:' . str_replace('t_thumb', 't_cover_big', $game['cover']['url'])
            : null;

        return [
            'id'           => $game['id'],
            'name'         => $game['name'] ?? 'Sin nombre',
            'cover'        => $cover,
            'summary'      => $game['summary'] ?? null,
            'rating'       => isset($game['rating']) ? round($game['rating'] / 10, 1) : null,
            'release_date' => isset($game['first_release_date'])
                ? date('Y', $game['first_release_date'])
                : null,
            'platforms'    => collect($game['platforms'] ?? [])->pluck('name')->toArray(),
            'genres'       => collect($game['genres'] ?? [])->pluck('name')->toArray(),
            'screenshots'  => collect($game['screenshots'] ?? [])
                ->map(fn($s) => 'https:' . str_replace('t_thumb', 't_screenshot_big', $s['url']))
                ->toArray(),
        ];
    }
   public function random(): JsonResponse
{
    $game = \App\Models\UserGame::inRandomOrder()
        ->whereNotNull('game_igdb_id')
        ->first();

    if (!$game) {
        return response()->json(['message' => 'No hay juegos disponibles'], 404);
    }

    return response()->json(['id' => $game->game_igdb_id]);
}
}