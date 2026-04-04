<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $input = $request->validate([
            'login' => 'required|string',
            'password' => 'required|string',
        ]);

        $fieldType = filter_var($input['login'], FILTER_VALIDATE_EMAIL) ? 'email' : 'username';

        $credentials = [
            $fieldType => $input['login'],
            'password' => $input['password']
        ];

        if (!$token = Auth::guard('api')->attempt($credentials)) {
            return response()->json(['error' => 'Kombinasi email/username dan password salah.'], 401);
        }

        return $this->respondWithToken($token);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:4|confirmed',
        ]);

        $user = Auth::guard('api')->user();

        if (!\Hash::check($request->current_password, $user->password)) {
            return response()->json(['error' => 'Password saat ini salah.'], 422);
        }

        $user->update([
            'password' => \Hash::make($request->new_password),
            'is_default_password' => false
        ]);

        return response()->json(['message' => 'Password berhasil diperbarui.']);
    }

    public function me()
    {
        return response()->json(Auth::guard('api')->user());
    }

    public function logout()
    {
        Auth::guard('api')->logout();
        return response()->json(['message' => 'Successfully logged out']);
    }

    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function handleGoogleCallback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            $user = User::updateOrCreate(
                ['email' => $googleUser->email],
                [
                    'name' => $googleUser->name,
                    'google_id' => $googleUser->id,
                    'avatar' => $googleUser->avatar,
                ]
            );

            $token = Auth::guard('api')->login($user);

            return redirect('https://dualcode.vercel.app/auth/callback?token=' . $token);
        } catch (\Exception $e) {
            return redirect('https://dualcode.vercel.app/login?error=oauth_failed');
        }
    }

    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => Auth::guard('api')->factory()->getTTL() * 60,
            'user' => Auth::guard('api')->user()
        ]);
    }
}