<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class WhatsAppService
{
    protected array $adminNumbers;
    protected ?string $fonnteToken;

    public function __construct()
    {
        $this->adminNumbers = array_filter(
            explode(',', config('services.whatsapp.admin_numbers', ''))
        );
        $this->fonnteToken = config('services.whatsapp.fonnte_token');
    }

    public function notifyAdmins(string $message): void
    {
        foreach ($this->adminNumbers as $number) {
            $this->send(trim($number), $message);
        }
    }

    public function send(string $phoneNumber, string $message): bool
    {
        $phoneNumber = $this->normalizePhoneNumber($phoneNumber);

        if ($this->fonnteToken) {
            return $this->sendViaFonnte($phoneNumber, $message);
        }

        Log::info('WhatsApp Gateway [NO PROVIDER]', [
            'to' => $phoneNumber,
            'message' => $message,
        ]);

        return true;
    }

    protected function sendViaFonnte(string $phoneNumber, string $message): bool
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => $this->fonnteToken,
            ])->post('https://api.fonnte.com/send', [
                        'target' => $phoneNumber,
                        'message' => $message,
                        'countryCode' => '62',
                    ]);

            if ($response->successful()) {
                Log::info('WhatsApp sent via Fonnte', [
                    'to' => $phoneNumber,
                    'status' => $response->json('status'),
                ]);
                return true;
            }

            Log::error('WhatsApp Fonnte failed', [
                'to' => $phoneNumber,
                'response' => $response->body(),
            ]);
            return false;

        } catch (\Exception $e) {
            Log::error('WhatsApp Fonnte exception', [
                'to' => $phoneNumber,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    protected function normalizePhoneNumber(string $number): string
    {
        $number = preg_replace('/[^0-9]/', '', $number);

        if (str_starts_with($number, '0')) {
            $number = '62' . substr($number, 1);
        }

        return $number;
    }

    public static function formatNewOrderMessage(object $order, ?object $user = null): string
    {
        $userName = $user?->name ?? $order->guest_name ?? 'Guest';
        $userContact = $user?->email ?? $order->guest_phone ?? '-';
        $deadline = $order->deadline ? date('d M Y', strtotime($order->deadline)) : 'Belum ditentukan';
        $layanan = $order->package ? $order->package->title : 'Custom/Tidak disebutkan';

        return "🔔 *ORDER BARU MASUK!*\n\n"
            . "📋 *Detail Order:*\n"
            . "• ID: #{$order->id}\n"
            . "• Judul: {$order->title}\n"
            . "• Deskripsi: " . \Illuminate\Support\Str::limit($order->description, 100) . "\n"
            . "• Layanan: {$layanan}\n"
            . "• Deadline: {$deadline}\n\n"
            . "👤 *Info Klien:*\n"
            . "• Nama: {$userName}\n"
            . "• Kontak: {$userContact}\n\n"
            . "⚡ Segera cek di dashboard admin!\n"
            . "🔗 " . env('FRONTEND_URL', 'https://dualcode.vercel.app') . "/admin/orders";
    }

    public static function formatPaymentMessage(object $order, object $payment): string
    {
        $amount = 'Rp ' . number_format($payment->amount, 0, ',', '.');
        $type = strtoupper($payment->type);

        return "💰 *PEMBAYARAN MASUK!*\n\n"
            . "• Order: #{$order->id} - {$order->title}\n"
            . "• Tipe: {$type}\n"
            . "• Jumlah: {$amount}\n"
            . "• Status: Menunggu Approval\n\n"
            . "⚡ Segera approve di dashboard admin!";
    }

    public static function formatNewRevisionMessage(object $order, object $revision, ?object $user = null): string
    {
        $userName = $user?->name ?? $order->guest_name ?? 'Guest';

        return "🛠️ *REVISI BARU MASUK!*\n\n"
            . "• Order: #{$order->id} - {$order->title}\n"
            . "• Klien: {$userName}\n"
            . "• Catatan Revisi:\n"
            . "\"{$revision->description}\"\n\n"
            . "⚡ Segera cek di dashboard admin!\n"
            . "🔗 " . env('FRONTEND_URL', 'https://dualcode.vercel.app') . "/admin/revisions";
    }
}