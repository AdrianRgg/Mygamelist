<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'name'   => 'sometimes|string|max:255',
            'avatar' => 'sometimes|image|max:2048',
        ]);

        $user = $request->user();

        if ($request->hasFile('avatar')) {
            // Eliminar avatar anterior si existe
            if ($user->avatar) {
                Storage::disk('public')->delete($user->avatar);
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $path;
        }

        if ($request->filled('name')) {
            $user->name = $request->name;
        }

        $user->save();

        return response()->json([
            'user'       => $user,
            'avatar_url' => $user->avatar
                ? asset('storage/' . $user->avatar)
                : null,
        ]);
    }

    public function me(Request $request): JsonResponse
{
    $user = $request->user();

    $reviews = \App\Models\Review::where('user_id', $user->id)
        ->orderBy('created_at', 'desc')
        ->get();

    return response()->json([
        'user'       => $user,
        'avatar_url' => $user->avatar
            ? asset('storage/' . $user->avatar)
            : null,
        'reviews'    => $reviews,
    ]);
}
}