<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Get a JWT via given credentials.
     */
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

        if (! $token = Auth::guard('api')->attempt($credentials)) {
            return response()->json(['error' => 'Kombinasi email/username dan password salah.'], 401);
        }

        return $this->respondWithToken($token);
    }

    /**
     * Change the authenticated User's password.
     */
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

    /**
     * Get the authenticated User.
     */
    public function me()
    {
        return response()->json(Auth::guard('api')->user());
    }

    /**
     * Log the user out (Invalidate the token).
     */
    public function logout()
    {
        Auth::guard('api')->logout();
        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Redirect the user to the Google authentication page.
     */
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    /**
     * Obtain the user information from Google.
     */
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

            return redirect('http://localhost:5173/auth/callback?token=' . $token);
        } catch (\Exception $e) {
            return redirect('http://localhost:5173/login?error=oauth_failed');
        }
    }

    /**
     * Get the token array structure.
     */
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
