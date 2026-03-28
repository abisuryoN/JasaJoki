<?php
require __DIR__.'/vendor/autoload.php';

// Try to load .env manually if needed
try {
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
    $dotenv->load();
} catch (\Exception $e) {
    echo "Dotenv error: " . $e->getMessage() . "\n";
}

echo "GOOGLE_CLIENT_ID: " . getenv('GOOGLE_CLIENT_ID') . "\n";
echo "GOOGLE_CLIENT_ID via $_ENV: " . ($_ENV['GOOGLE_CLIENT_ID'] ?? 'not set') . "\n";
echo "GOOGLE_CLIENT_ID via $_SERVER: " . ($_SERVER['GOOGLE_CLIENT_ID'] ?? 'not set') . "\n";
