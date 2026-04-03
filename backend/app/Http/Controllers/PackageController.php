<?php

namespace App\Http\Controllers;

use App\Models\Package;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PackageController extends Controller
{
    /**
     * PUBLIC: List all packages ordered by sort_order
     */
    public function index()
    {
        $packages = Package::orderBy('sort_order')->orderBy('id')->get();

        return response()->json([
            'success' => true,
            'data' => $packages,
        ]);
    }

    /**
     * ADMIN: Create a new package
     */
    public function store(Request $request)
    {
        if (Auth::guard('api')->user()?->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'price' => 'required|string|max:100',
            'features' => 'nullable|array',
            'features.*' => 'string',
            'is_popular' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $package = Package::create($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Paket berhasil ditambahkan!',
            'data' => $package,
        ], 201);
    }

    /**
     * ADMIN: Update a package
     */
    public function update(Request $request, $id)
    {
        if (Auth::guard('api')->user()?->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $package = Package::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'price' => 'nullable|string|max:100',
            'features' => 'nullable|array',
            'features.*' => 'string',
            'is_popular' => 'boolean',
            'sort_order' => 'integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $package->update($validator->validated());

        return response()->json([
            'success' => true,
            'message' => 'Paket berhasil diperbarui!',
            'data' => $package,
        ]);
    }

    /**
     * ADMIN: Delete a package
     */
    public function destroy($id)
    {
        if (Auth::guard('api')->user()?->role !== 'admin') {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $package = Package::findOrFail($id);
        $package->delete();

        return response()->json([
            'success' => true,
            'message' => 'Paket berhasil dihapus!',
        ]);
    }
}
