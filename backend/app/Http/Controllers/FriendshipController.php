<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FriendshipController extends Controller
{
    // Buscar usuarios por nombre
    public function search(Request $request): JsonResponse
    {
        $query = $request->query('q', '');
        $me = $request->user()->id;

        $users = User::where('id', '!=', $me)
            ->where('name', 'like', "%{$query}%")
            ->select('id', 'name', 'avatar')
            ->limit(10)
            ->get()
            ->map(function ($user) {
                $user->avatar_url = $user->avatar
                    ? asset('storage/' . $user->avatar)
                    : null;
                return $user;
            });

        return response()->json($users);
    }

    // Enviar solicitud
    public function send(Request $request): JsonResponse
    {
        $data = $request->validate([
            'receiver_id' => 'required|integer|exists:users,id',
        ]);

        $me = $request->user()->id;

        if ($data['receiver_id'] === $me) {
            return response()->json(['message' => 'No puedes añadirte a ti mismo'], 422);
        }

        $existing = Friendship::where(function ($q) use ($me, $data) {
            $q->where('sender_id', $me)->where('receiver_id', $data['receiver_id']);
        })->orWhere(function ($q) use ($me, $data) {
            $q->where('sender_id', $data['receiver_id'])->where('receiver_id', $me);
        })->first();

        if ($existing) {
            return response()->json(['message' => 'Ya existe una solicitud'], 422);
        }

        $friendship = Friendship::create([
            'sender_id'   => $me,
            'receiver_id' => $data['receiver_id'],
            'status'      => 'pending',
        ]);

        return response()->json($friendship, 201);
    }

    // Aceptar solicitud
    public function accept(Request $request, int $id): JsonResponse
    {
        $friendship = Friendship::where('receiver_id', $request->user()->id)
            ->where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->update(['status' => 'accepted']);

        return response()->json($friendship);
    }

    // Rechazar solicitud
    public function reject(Request $request, int $id): JsonResponse
    {
        $friendship = Friendship::where('receiver_id', $request->user()->id)
            ->where('id', $id)
            ->where('status', 'pending')
            ->firstOrFail();

        $friendship->update(['status' => 'rejected']);

        return response()->json($friendship);
    }

    // Eliminar amigo
    public function destroy(Request $request, int $id): JsonResponse
    {
        $me = $request->user()->id;

        $friendship = Friendship::where('id', $id)
            ->where(function ($q) use ($me) {
                $q->where('sender_id', $me)->orWhere('receiver_id', $me);
            })->firstOrFail();

        $friendship->delete();

        return response()->json(['message' => 'Amigo eliminado']);
    }

    // Solicitudes pendientes recibidas
    public function pending(Request $request): JsonResponse
    {
        $pending = Friendship::with('sender')
            ->where('receiver_id', $request->user()->id)
            ->where('status', 'pending')
            ->get()
            ->map(function ($f) {
                return [
                    'id'     => $f->id,
                    'sender' => [
                        'id'         => $f->sender->id,
                        'name'       => $f->sender->name,
                        'avatar_url' => $f->sender->avatar
                            ? asset('storage/' . $f->sender->avatar)
                            : null,
                    ],
                    'created_at' => $f->created_at,
                ];
            });

        return response()->json($pending);
    }

    // Lista de amigos
    public function friends(Request $request): JsonResponse
    {
        $me = $request->user()->id;

        $friendships = Friendship::with(['sender', 'receiver'])
            ->where('status', 'accepted')
            ->where(function ($q) use ($me) {
                $q->where('sender_id', $me)->orWhere('receiver_id', $me);
            })->get();

        $friends = $friendships->map(function ($f) use ($me) {
            $friend = $f->sender_id === $me ? $f->receiver : $f->sender;
            return [
                'friendship_id' => $f->id,
                'id'            => $friend->id,
                'name'          => $friend->name,
                'avatar_url'    => $friend->avatar
                    ? asset('storage/' . $friend->avatar)
                    : null,
            ];
        });

        return response()->json($friends);
    }

    // Perfil público de un usuario
    public function profile(Request $request, int $userId): JsonResponse
    {
        $me = $request->user()->id;

        $user = User::findOrFail($userId);

        $isFriend = Friendship::where('status', 'accepted')
            ->where(function ($q) use ($me, $userId) {
                $q->where('sender_id', $me)->where('receiver_id', $userId);
            })->orWhere(function ($q) use ($me, $userId) {
                $q->where('sender_id', $userId)->where('receiver_id', $me);
            })->exists();

        if (!$isFriend && $userId !== $me) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $games = \App\Models\UserGame::where('user_id', $userId)->get();
        $reviews = \App\Models\Review::with('user:id,name')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'user' => [
                'id'         => $user->id,
                'name'       => $user->name,
                'avatar_url' => $user->avatar
                    ? asset('storage/' . $user->avatar)
                    : null,
            ],
            'games'   => $games,
            'reviews' => $reviews,
        ]);
    }
}