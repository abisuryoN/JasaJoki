<?php

namespace App\Http\Controllers;

use App\Models\Portfolio;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    /**
     * Get published portfolios for public landing page
     */
    public function index()
    {
        $portfolios = Portfolio::published()
            ->orderBy('sort_order', 'asc')
            ->latest()
            ->get();
            
        return response()->json([
            'success' => true,
            'data' => $portfolios
        ]);
    }

    /**
     * Get all portfolios for admin
     */
    public function adminIndex()
    {
        $portfolios = Portfolio::orderBy('sort_order', 'asc')->latest()->get();
        return response()->json(['success' => true, 'data' => $portfolios]);
    }

    /**
     * Store new portfolio (Admin only)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:50',
            'description' => 'required|string',
            'client_name' => 'nullable|string|max:255',
            'tech_stack' => 'nullable|array',
            'image_url' => 'nullable|string',
            'link' => 'nullable|url',
            'is_published' => 'boolean',
            'sort_order' => 'integer'
        ]);

        $portfolio = Portfolio::create($validated);
        return response()->json(['success' => true, 'data' => $portfolio]);
    }

    /**
     * Update portfolio (Admin only)
     */
    public function update(Request $request, $id)
    {
        $portfolio = Portfolio::findOrFail($id);
        
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:50',
            'description' => 'required|string',
            'client_name' => 'nullable|string|max:255',
            'tech_stack' => 'nullable|array',
            'image_url' => 'nullable|string',
            'link' => 'nullable|url',
            'is_published' => 'boolean',
            'sort_order' => 'integer'
        ]);

        $portfolio->update($validated);
        return response()->json(['success' => true, 'data' => $portfolio]);
    }

    /**
     * Delete portfolio (Admin only)
     */
    public function destroy($id)
    {
        $portfolio = Portfolio::findOrFail($id);
        $portfolio->delete();
        return response()->json(['success' => true, 'message' => 'Deleted']);
    }
}
