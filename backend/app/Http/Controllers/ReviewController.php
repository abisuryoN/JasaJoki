<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * PUBLIC: Get approved reviews only + computed stats
     */
    public function index()
    {
        $reviews = Review::approved()
            ->with('user:id,name')
            ->latest()
            ->get();

        $avgRating = $reviews->avg('rating');
        $totalCount = $reviews->count();

        return response()->json([
            'success' => true,
            'data' => $reviews,
            'stats' => [
                'avg_rating' => $totalCount > 0 ? round($avgRating, 1) : 0,
                'total_reviews' => $totalCount,
            ],
        ]);
    }

    /**
     * PUBLIC: Get review stats only (lightweight endpoint)
     */
    public function stats()
    {
        $approved = Review::approved();
        $avgRating = $approved->avg('rating');
        $totalCount = $approved->count();

        return response()->json([
            'success' => true,
            'avg_rating' => $totalCount > 0 ? round($avgRating, 1) : 0,
            'total_reviews' => $totalCount,
        ]);
    }

    /**
     * AUTH: Submit a new review (auto-pending for moderation)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $user = auth()->user();

        $review = Review::create([
            'user_id' => $user->id,
            'name' => $user->name,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'status' => 'pending', // Always pending, admin must approve
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Review berhasil dikirim! Menunggu moderasi admin.',
            'data' => $review->load('user:id,name'),
        ], 201);
    }

    /**
     * ADMIN: Get all reviews (with optional status filter)
     */
    public function adminIndex(Request $request)
    {
        if (Auth::guard('api')->user()?->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $query = Review::with('user:id,name')->latest();

        if ($request->has('status') && in_array($request->status, ['pending', 'approved', 'rejected'])) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'success' => true,
            'data' => $query->get(),
        ]);
    }

    /**
     * ADMIN: Update review status (approve / reject)
     */
    public function updateStatus(Request $request, $id)
    {
        if (Auth::guard('api')->user()?->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $review = Review::findOrFail($id);
        $review->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => 'Review status updated to ' . $request->status,
            'data' => $review->load('user:id,name'),
        ]);
    }
}
