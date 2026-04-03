<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

Schema::table('orders', function (Blueprint $table) {
    if (Schema::hasColumn('orders', 'package_id')) {
        $table->dropColumn('package_id');
    }
});

Schema::dropIfExists('footer_links');
Schema::dropIfExists('portfolios');
Schema::dropIfExists('packages');

\Illuminate\Support\Facades\DB::table('migrations')
    ->where('migration', 'like', '%2026_04_03_000012%')
    ->delete();

echo "Dropped divergent tables and migration record.\n";
