<?php

namespace App\Http\Controllers;

use App\Models\HelpPage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class HelpPageController extends Controller
{
    public function index()
    {
        return HelpPage::all();
    }

    public function show($slug)
    {
        return HelpPage::where('slug', $slug)->firstOrFail();
    }

    public function store(Request $request)
    {
        if (Auth::guard('api')->user()?->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'type' => 'required|in:faq,tc,contact',
        ]);

        $helpPage = HelpPage::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title),
            'content' => $request->content,
            'type' => $request->type,
        ]);

        return response()->json($helpPage, 201);
    }

    public function update(Request $request, $id)
    {
        if (Auth::guard('api')->user()?->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $helpPage = HelpPage::findOrFail($id);
        $request->validate([
            'title' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'type' => 'nullable|in:faq,tc,contact',
        ]);

        if ($request->has('title')) {
            $request->merge(['slug' => Str::slug($request->title)]);
        }

        $helpPage->update($request->all());

        return response()->json($helpPage);
    }

    public function destroy($id)
    {
        if (Auth::guard('api')->user()?->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        HelpPage::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
