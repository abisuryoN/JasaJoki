/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- membuang struktur untuk table jasajoki.cache
DROP TABLE IF EXISTS `cache`;
CREATE TABLE IF NOT EXISTS `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `cache`;
INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
	('jasajoki-cache-yDeVJ8IoZZvzcVhm', 'a:1:{s:11:"valid_until";i:1775239242;}', 1776448123);

-- membuang struktur untuk table jasajoki.cache_locks
DROP TABLE IF EXISTS `cache_locks`;
CREATE TABLE IF NOT EXISTS `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `cache_locks`;

-- membuang struktur untuk table jasajoki.failed_jobs
DROP TABLE IF EXISTS `failed_jobs`;
CREATE TABLE IF NOT EXISTS `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `failed_jobs`;

-- membuang struktur untuk table jasajoki.footer_links
DROP TABLE IF EXISTS `footer_links`;
CREATE TABLE IF NOT EXISTS `footer_links` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `footer_links`;

-- membuang struktur untuk table jasajoki.help_pages
DROP TABLE IF EXISTS `help_pages`;
CREATE TABLE IF NOT EXISTS `help_pages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('faq','tc','contact') COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `help_pages_slug_unique` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `help_pages`;

-- membuang struktur untuk table jasajoki.jobs
DROP TABLE IF EXISTS `jobs`;
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `jobs`;

-- membuang struktur untuk table jasajoki.job_batches
DROP TABLE IF EXISTS `job_batches`;
CREATE TABLE IF NOT EXISTS `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `job_batches`;

-- membuang struktur untuk table jasajoki.migrations
DROP TABLE IF EXISTS `migrations`;
CREATE TABLE IF NOT EXISTS `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `migrations`;
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
	(1, '0001_01_01_000000_create_users_table', 1),
	(2, '0001_01_01_000001_create_cache_table', 1),
	(3, '0001_01_01_000002_create_jobs_table', 1),
	(4, '2026_03_26_000005_create_orders_table', 1),
	(5, '2026_03_27_000006_update_orders_table_v2', 1),
	(6, '2026_03_27_000007_create_revisions_table', 1),
	(7, '2026_03_27_000008_create_help_pages_table', 1),
	(8, '2026_03_27_000009_create_notifications_table', 1),
	(9, '2026_03_28_000010_create_reviews_table', 1),
	(10, '2026_03_28_000011_update_orders_and_revisions_v3', 1),
	(11, '2026_03_30_000012_update_reviews_table_v2', 2),
	(12, '2026_03_30_000013_update_orders_table_v4', 2),
	(13, '2026_03_30_000014_create_packages_table', 2),
	(14, '2026_03_30_000015_create_portfolios_table', 2),
	(15, '2026_03_30_000016_create_pages_table', 2),
	(16, '2026_03_30_000017_create_footer_links_table', 2),
	(17, '2026_03_30_000018_rename_guest_phone_to_whatsapp_in_orders_table', 3),
	(18, '2026_03_29_190947_add_order_index_to_footer_links_table', 4),
	(20, '2026_04_03_000012_revamp_database', 5),
	(21, '2026_04_03_000013_add_guest_fields_to_orders', 6),
	(22, '2026_04_03_000014_upgrade_order_system', 7),
	(23, '2026_04_04_000015_add_username_to_users', 8);

-- membuang struktur untuk table jasajoki.notifications
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notifiable_id` bigint unsigned NOT NULL,
  `data` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notifiable_type_notifiable_id_index` (`notifiable_type`,`notifiable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `notifications`;
INSERT INTO `notifications` (`id`, `type`, `notifiable_type`, `notifiable_id`, `data`, `read_at`, `created_at`, `updated_at`) VALUES
	('1497bdf4-c00e-4ee8-9f83-36b5bc8876b4', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 3, '{"title":"Update Status Order","message":"Order #3 Anda kini berstatus PROGRESS","url":"\\/dashboard","type":"order_status"}', NULL, '2026-04-03 10:56:35', '2026-04-03 10:56:35'),
	('1b995554-c352-4fc4-825f-d1661560c395', 'App\\Notifications\\RevisionNotification', 'App\\Models\\User', 3, '{"title":"Revisi Selesai!","message":"Revisi untuk Order #1 telah diselesaikan.","url":"\\/dashboard","type":"revision_done"}', NULL, '2026-04-03 07:26:40', '2026-04-03 07:26:40'),
	('27a21322-c40f-4055-a8b5-a6084bedcb87', 'App\\Notifications\\RevisionNotification', 'App\\Models\\User', 3, '{"title":"Revisi Selesai!","message":"Revisi untuk Order #3 telah diselesaikan.","url":"\\/dashboard","type":"revision_done"}', NULL, '2026-04-03 10:58:29', '2026-04-03 10:58:29'),
	('2cb72fcf-8634-49c5-846e-0c82df8acfcf', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 2, '{"title":"Bukti Pembayaran Masuk!","message":"Pembayaran DP Rp 375.000 untuk Order #1","url":"\\/admin\\/orders","type":"payment_submitted"}', NULL, '2026-04-03 03:20:50', '2026-04-03 03:20:50'),
	('30495a7f-6f9a-471c-9528-9ee60f58782e', 'App\\Notifications\\RevisionNotification', 'App\\Models\\User', 3, '{"title":"Revisi Selesai!","message":"Revisi untuk Order #1 telah diselesaikan.","url":"\\/dashboard","type":"revision_done"}', NULL, '2026-04-03 07:38:19', '2026-04-03 07:38:19'),
	('41f7b178-a192-4be0-886b-4879c93f5312', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 3, '{"title":"Harga Order Ditentukan!","message":"Order #1 telah diberi harga Rp 750.000. Silakan lakukan pembayaran.","url":"\\/dashboard","type":"price_set"}', '2026-04-03 03:19:51', '2026-04-03 03:19:29', '2026-04-03 03:19:51'),
	('4797545c-0a29-41b6-9600-2fe4ee5d17f6', 'App\\Notifications\\RevisionNotification', 'App\\Models\\User', 2, '{"title":"Permintaan Revisi!","message":"Revisi baru untuk Order #3 telah masuk.","url":"\\/admin\\/revisions","type":"revision_new"}', NULL, '2026-04-03 10:57:34', '2026-04-03 10:57:34'),
	('4c5cd17a-8998-47c6-97bb-3ee91765bc26', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 2, '{"title":"Order Baru!","message":"Order #3: kkk telah masuk.","url":"\\/admin\\/orders","type":"order_new"}', NULL, '2026-04-03 03:58:14', '2026-04-03 03:58:14'),
	('503d4d6a-b00a-4a83-bc25-71c08b0561cb', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 3, '{"title":"Update Pembayaran","message":"Pembayaran Rp 375.000 untuk Order #1 ditolak \\u274c","url":"\\/dashboard","type":"payment_status"}', NULL, '2026-04-03 07:03:38', '2026-04-03 07:03:38'),
	('57d6b611-ec8b-47b5-9518-6a7676d6f79d', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 2, '{"title":"Order Baru!","message":"Order #2: ini telah masuk.","url":"\\/admin\\/orders","type":"order_new"}', NULL, '2026-04-03 03:38:52', '2026-04-03 03:38:52'),
	('78c0839a-1802-4210-871b-48ecee97629a', 'App\\Notifications\\RevisionNotification', 'App\\Models\\User', 2, '{"title":"Permintaan Revisi!","message":"Revisi baru untuk Order #3 telah masuk.","url":"\\/admin\\/revisions","type":"revision_new"}', NULL, '2026-04-03 10:58:48', '2026-04-03 10:58:48'),
	('7c032cc4-1dab-46a3-a3ac-a5fd2f8609df', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 2, '{"title":"Bukti Pembayaran Masuk!","message":"Pembayaran PELUNASAN Rp 350.000 untuk Order #3","url":"\\/admin\\/orders","type":"payment_submitted"}', NULL, '2026-04-03 10:55:28', '2026-04-03 10:55:28'),
	('8a956857-c058-45e4-8c66-cf3555e2c0db', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 2, '{"title":"Bukti Pembayaran Masuk!","message":"Pembayaran PELUNASAN Rp 375.000 untuk Order #1","url":"\\/admin\\/orders","type":"payment_submitted"}', NULL, '2026-04-03 07:02:45', '2026-04-03 07:02:45'),
	('97368d46-f644-458c-9a16-3eb0a32b17ba', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 2, '{"title":"Bukti Pembayaran Masuk!","message":"Pembayaran PELUNASAN Rp 375.000 untuk Order #1","url":"\\/admin\\/orders","type":"payment_submitted"}', NULL, '2026-04-03 07:02:08', '2026-04-03 07:02:08'),
	('997f6139-be19-4067-9f72-fa3aaef149fe', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 3, '{"title":"Harga Order Ditentukan!","message":"Order #3 telah diberi harga Rp 350.000. Silakan lakukan pembayaran.","url":"\\/dashboard","type":"price_set"}', NULL, '2026-04-03 10:48:53', '2026-04-03 10:48:53'),
	('9bcea308-a66e-4c10-bd26-1e7b21239249', 'App\\Notifications\\RevisionNotification', 'App\\Models\\User', 3, '{"title":"Revisi Selesai!","message":"Revisi untuk Order #1 telah diselesaikan.","url":"\\/dashboard","type":"revision_done"}', NULL, '2026-04-03 07:26:42', '2026-04-03 07:26:42'),
	('9d8d2138-5a46-4e01-8298-80b794b8551f', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 3, '{"title":"Update Pembayaran","message":"Pembayaran Rp 375.000 untuk Order #1 disetujui \\u2705","url":"\\/dashboard","type":"payment_status"}', NULL, '2026-04-03 07:03:43', '2026-04-03 07:03:43'),
	('b130b743-62b1-45ce-ab0f-87aaf831270e', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 3, '{"title":"Update Pembayaran","message":"Pembayaran Rp 375.000 untuk Order #1 disetujui \\u2705","url":"\\/dashboard","type":"payment_status"}', '2026-04-03 03:28:26', '2026-04-03 03:27:27', '2026-04-03 03:28:26'),
	('cb950a38-480e-48c3-a83b-7eb7eb59a1d4', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 2, '{"title":"Order Baru!","message":"Order #1: ecimmerce telah masuk.","url":"\\/admin\\/orders","type":"order_new"}', NULL, '2026-04-03 02:57:27', '2026-04-03 02:57:27'),
	('dc5f8862-6727-4715-ad4b-b52e9681eb97', 'App\\Notifications\\RevisionNotification', 'App\\Models\\User', 3, '{"title":"Revisi Selesai!","message":"Revisi untuk Order #3 telah diselesaikan.","url":"\\/dashboard","type":"revision_done"}', NULL, '2026-04-03 10:59:05', '2026-04-03 10:59:05'),
	('ded108bf-7e8b-49a0-a931-2565dc9c4da1', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 3, '{"title":"Update Pembayaran","message":"Pembayaran Rp 350.000 untuk Order #3 disetujui \\u2705","url":"\\/dashboard","type":"payment_status"}', NULL, '2026-04-03 10:56:14', '2026-04-03 10:56:14'),
	('e6ec92d9-8a80-48d6-bdeb-a707e5c35e83', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 4, '{"title":"Harga Order Ditentukan!","message":"Order #2 telah diberi harga Rp 550.000. Silakan lakukan pembayaran.","url":"\\/dashboard","type":"price_set"}', NULL, '2026-04-03 05:52:20', '2026-04-03 05:52:20'),
	('f7233c01-71d5-43b0-9941-a3a9da6ef29b', 'App\\Notifications\\OrderNotification', 'App\\Models\\User', 3, '{"title":"Update Status Order","message":"Order #3 Anda kini berstatus DONE","url":"\\/dashboard","type":"order_status"}', NULL, '2026-04-03 10:57:14', '2026-04-03 10:57:14');

-- membuang struktur untuk table jasajoki.users
-- (dibuat duluan karena direferensikan oleh tabel lain)
DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `google_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_default_password` tinyint(1) NOT NULL DEFAULT '1',
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_google_id_unique` (`google_id`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `users`;
INSERT INTO `users` (`id`, `name`, `email`, `username`, `phone`, `avatar`, `google_id`, `role`, `email_verified_at`, `password`, `is_default_password`, `remember_token`, `created_at`, `updated_at`) VALUES
	(1, 'R6J Abi Suryo 814', 'suryonegoro2006@gmail.com', NULL, NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJbc7RwHTGykXyKVPDryOwQNM4xcvTKKjINJkBjC5Lgm7blkWk=s96-c', '112229912917090100460', 'user', NULL, NULL, 1, NULL, '2026-03-29 05:48:34', '2026-03-29 05:48:34'),
	(2, 'Admin JasaJoki', 'admin@jasajoki.com', 'admin', NULL, NULL, NULL, 'admin', '2026-03-29 06:03:38', '$2y$12$OY8bOqu7Sq5gciVDnO40XOBR9TbaE9ZjI0vGz2hrvFdn4uhqqVbhy', 1, NULL, '2026-03-29 06:03:38', '2026-04-03 10:46:46'),
	(3, 'rzkysryo', 'negoroabi222@gmail.com', NULL, NULL, 'https://lh3.googleusercontent.com/a/ACg8ocJtndySqcX4yyTeK4GREnAPiQbnQyxiY9zYkDkUXrqh5Dn6GA=s96-c', '102547256656300634928', 'user', NULL, NULL, 1, NULL, '2026-04-03 02:49:49', '2026-04-03 02:49:49'),
	(4, 'Akbar', 'abijopan6@gmail.com', NULL, NULL, 'https://lh3.googleusercontent.com/a/ACg8ocKGBX6CH6PVztuf-ObSdbfcJ5i8CcqY4PMN9A1IyYwykbVbLg=s96-c', '109583756664092620103', 'user', NULL, NULL, 1, NULL, '2026-04-03 03:38:09', '2026-04-03 03:38:09');

-- membuang struktur untuk table jasajoki.packages
-- (dibuat duluan karena direferensikan oleh orders)
DROP TABLE IF EXISTS `packages`;
CREATE TABLE IF NOT EXISTS `packages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `features` json DEFAULT NULL,
  `is_popular` tinyint(1) NOT NULL DEFAULT '0',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `packages`;
INSERT INTO `packages` (`id`, `title`, `subtitle`, `price`, `features`, `is_popular`, `sort_order`, `created_at`, `updated_at`) VALUES
	(1, 'Mahasiswa', 'Tugas coding, desain, atau skripsi IT.', '200k', '["Revisi Sampai Approve", "Penjelasan Laporan / Dokumentasi", "Full Source Code & Database"]', 0, 1, '2026-04-03 02:23:25', '2026-04-03 02:23:25'),
	(2, 'Bisnis / UMKM', 'Sistem kustom, Web App, dan SaaS solution.', 'Custom Plan', '["Architecture Design & Scalability", "UI/UX Modern & Responsive", "Deployment & Cloud Setup", "Priority Support 24/7"]', 1, 2, '2026-04-03 02:23:25', '2026-04-03 02:23:25'),
	(3, 'Free Chat', 'Belum punya konsep yang matang?', 'Rp 0', '["Konsultasi Alur Program", "Estimasi Durasi & Budget", "Rekomendasi Fitur"]', 0, 3, '2026-04-03 02:23:25', '2026-04-03 02:23:25');

-- membuang struktur untuk table jasajoki.orders
DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `package_id` bigint unsigned DEFAULT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `guest_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsapp` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `technology` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `budget` decimal(15,2) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `price_note` text COLLATE utf8mb4_unicode_ci,
  `payment_status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `deadline` datetime DEFAULT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `extra_revisions` int NOT NULL DEFAULT '0',
  `revisions_left` int NOT NULL DEFAULT '2',
  `assigned_to` bigint unsigned DEFAULT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `result_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_proof` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_method` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `orders_user_id_foreign` (`user_id`),
  KEY `orders_assigned_to_foreign` (`assigned_to`),
  KEY `orders_package_id_foreign` (`package_id`),
  CONSTRAINT `orders_assigned_to_foreign` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_package_id_foreign` FOREIGN KEY (`package_id`) REFERENCES `packages` (`id`) ON DELETE SET NULL,
  CONSTRAINT `orders_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `orders`;
INSERT INTO `orders` (`id`, `package_id`, `user_id`, `guest_name`, `guest_phone`, `whatsapp`, `title`, `description`, `technology`, `budget`, `price`, `price_note`, `payment_status`, `deadline`, `status`, `extra_revisions`, `revisions_left`, `assigned_to`, `file_path`, `result_path`, `payment_proof`, `payment_method`, `rating`, `comment`, `created_at`, `updated_at`) VALUES
	(1, 2, 3, 'suryo', '081219630624', NULL, 'ecimmerce', 'kaya gini gitu adalah', NULL, NULL, 750000.00, 'belum sama hosting', 'paid', '2026-04-23 00:00:00', 'done', 3, 4, NULL, NULL, NULL, NULL, NULL, 4, 'jelek anjg', '2026-04-03 02:57:25', '2026-04-03 07:43:32'),
	(2, 1, 4, 'abu', '08345678765', NULL, 'ini', 'ee', NULL, NULL, 550000.00, 'ini belum hosting', 'unpaid', '2026-04-16 00:00:00', 'waiting_payment', 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-03 03:38:47', '2026-04-03 05:52:16'),
	(3, 2, 3, 'hvv', '081219630624', NULL, 'kkk', 'ojoj', NULL, NULL, 350000.00, NULL, 'paid', '2026-04-16 00:00:00', 'done', 0, 0, NULL, NULL, NULL, NULL, NULL, 5, 'mantap', '2026-04-03 03:58:06', '2026-04-03 10:59:26'),
	(4, 2, 3, 'hvv', '081219630624', NULL, 'kkk', 'ojoj', NULL, NULL, NULL, NULL, 'unpaid', '2026-04-16 00:00:00', 'draft', 0, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-03 03:58:16', '2026-04-03 03:58:16');

-- membuang struktur untuk table jasajoki.order_progress
DROP TABLE IF EXISTS `order_progress`;
CREATE TABLE IF NOT EXISTS `order_progress` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `image_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `order_progress_order_id_foreign` (`order_id`),
  CONSTRAINT `order_progress_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `order_progress`;
INSERT INTO `order_progress` (`id`, `order_id`, `image_url`, `description`, `created_at`, `updated_at`) VALUES
	(1, 1, 'order_progress/KETlU5xxS6v6v6Pbe1dOCABHMIeno407gJPT4dMb.png', NULL, '2026-04-03 03:28:03', '2026-04-03 03:28:03');

-- membuang struktur untuk table jasajoki.pages
DROP TABLE IF EXISTS `pages`;
CREATE TABLE IF NOT EXISTS `pages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slug` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` longtext COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pages_slug_unique` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `pages`;
INSERT INTO `pages` (`id`, `title`, `slug`, `content`, `created_at`, `updated_at`) VALUES
	(1, 'Ai', 'Ai-services', '<h2>Kebijakan Privasi</h2>\n\n<p>Kami menghargai privasi Anda. Informasi yang Anda berikan akan digunakan hanya untuk keperluan layanan JasaJoki.</p>\n\n<ul>\n<li>Data tidak akan dibagikan ke pihak ketiga</li>\n<li>Informasi digunakan untuk komunikasi project</li>\n<li>Keamanan data menjadi prioritas kami</li>\n</ul>\n\n<p>Dengan menggunakan layanan kami, Anda menyetujui kebijakan ini.</p>', '2026-03-29 12:06:15', '2026-03-29 12:06:15');

-- membuang struktur untuk table jasajoki.password_reset_tokens
DROP TABLE IF EXISTS `password_reset_tokens`;
CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `password_reset_tokens`;

-- membuang struktur untuk table jasajoki.payments
DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `proof_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `admin_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `payments_order_id_foreign` (`order_id`),
  CONSTRAINT `payments_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `payments`;
INSERT INTO `payments` (`id`, `order_id`, `amount`, `type`, `status`, `proof_image`, `admin_note`, `created_at`, `updated_at`) VALUES
	(1, 1, 375000.00, 'dp', 'approved', 'payment_proofs/tH9vPoZFgyfVUyQiSmitauKTww2mJGXf89TGPLR6.jpg', NULL, '2026-04-03 03:20:50', '2026-04-03 03:27:27'),
	(2, 1, 375000.00, 'pelunasan', 'approved', 'payment_proofs/wY7lixzYpwzCVTDqofDw3VKmpwKtgDUOWojEgxbj.png', NULL, '2026-04-03 07:02:07', '2026-04-03 07:03:43'),
	(3, 1, 375000.00, 'pelunasan', 'rejected', 'payment_proofs/DoEftaR73xsJE5MGi6oExo7pi4Jd5NNnyInSXUwQ.png', 'kelebihan', '2026-04-03 07:02:45', '2026-04-03 07:03:38'),
	(4, 3, 350000.00, 'pelunasan', 'approved', 'payment_proofs/LIpomRvsAFtuHOtNZgs8nB9AfuWgvjVJ8tO0dRIC.jpg', NULL, '2026-04-03 10:55:27', '2026-04-03 10:56:14');

-- membuang struktur untuk table jasajoki.portfolios
DROP TABLE IF EXISTS `portfolios`;
CREATE TABLE IF NOT EXISTS `portfolios` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `tech_stack` json DEFAULT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_published` tinyint(1) NOT NULL DEFAULT '1',
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `portfolios`;

-- membuang struktur untuk table jasajoki.reviews
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `rating` int NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `reviews_user_id_foreign` (`user_id`),
  CONSTRAINT `reviews_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `reviews`;
INSERT INTO `reviews` (`id`, `user_id`, `name`, `rating`, `comment`, `status`, `is_featured`, `created_at`, `updated_at`) VALUES
	(1, 3, 'rzkysryo', 4, 'jelek anjg', 'rejected', 0, '2026-04-03 07:43:32', '2026-04-03 10:59:40'),
	(2, 3, 'rzkysryo', 5, 'mantap', 'approved', 0, '2026-04-03 10:59:27', '2026-04-03 10:59:44'),
	(3, 3, 'rzkysryo', 5, 'p', 'pending', 0, '2026-04-03 11:00:17', '2026-04-03 11:00:17');

-- membuang struktur untuk table jasajoki.revisions
DROP TABLE IF EXISTS `revisions`;
CREATE TABLE IF NOT EXISTS `revisions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `order_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `deadline` datetime DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_path` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','process','done') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `revisions_order_id_foreign` (`order_id`),
  KEY `revisions_user_id_foreign` (`user_id`),
  CONSTRAINT `revisions_order_id_foreign` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  CONSTRAINT `revisions_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `revisions`;
INSERT INTO `revisions` (`id`, `order_id`, `user_id`, `message`, `deadline`, `description`, `file_path`, `status`, `created_at`, `updated_at`) VALUES
	(1, 1, 3, NULL, NULL, 'Revisi otomatis direcover dari kegagalan sistem sebelumnya.', NULL, 'done', '2026-04-03 07:17:03', '2026-04-03 07:26:40'),
	(2, 3, 3, NULL, NULL, 'kk', NULL, 'done', '2026-04-03 10:57:34', '2026-04-03 10:58:29'),
	(3, 3, 3, NULL, NULL, 'hh', NULL, 'done', '2026-04-03 10:58:48', '2026-04-03 10:59:05');

-- membuang struktur untuk table jasajoki.sessions
DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint unsigned DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM `sessions`;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;