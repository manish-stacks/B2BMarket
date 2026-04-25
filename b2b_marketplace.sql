-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 25, 2026 at 08:05 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `b2b_marketplace`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_logs`
--

CREATE TABLE `admin_logs` (
  `id` varchar(191) NOT NULL,
  `adminId` varchar(191) NOT NULL,
  `targetId` varchar(191) DEFAULT NULL,
  `action` varchar(191) NOT NULL,
  `entity` varchar(191) NOT NULL,
  `entityId` varchar(191) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ipAddress` varchar(191) DEFAULT NULL,
  `userAgent` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` varchar(191) DEFAULT NULL,
  `image` varchar(191) DEFAULT NULL,
  `icon` varchar(191) DEFAULT NULL,
  `parentId` varchar(191) DEFAULT NULL,
  `sortOrder` int(11) NOT NULL DEFAULT 0,
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `description`, `image`, `icon`, `parentId`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES
('cmochntr60009sx3eswvcs2u0', 'Chemicals & Plastics', 'chemicals', NULL, NULL, '🧪', NULL, 3, 1, '2026-04-24 05:47:25.410', '2026-04-24 05:47:25.410'),
('cmochntr8000asx3e0id4qmjo', 'Automobiles & Parts', 'automobiles', NULL, NULL, '🚗', NULL, 7, 1, '2026-04-24 05:47:25.410', '2026-04-24 05:47:25.410'),
('cmochntr8000bsx3eoab8jyoh', 'Food & Beverages', 'food-beverages', NULL, NULL, '🍎', NULL, 8, 1, '2026-04-24 05:47:25.410', '2026-04-24 05:47:25.410'),
('cmochntr8000csx3e82v5l1tt', 'Textiles & Garments', 'textiles', NULL, NULL, '👕', NULL, 5, 1, '2026-04-24 05:47:25.410', '2026-04-24 05:47:25.410'),
('cmochntr8000dsx3ev0ad7k48', 'Construction Materials', 'construction', NULL, NULL, '🏗️', NULL, 4, 1, '2026-04-24 05:47:25.410', '2026-04-24 05:47:25.410'),
('cmochntr8000esx3egv7ctjuk', 'Electronics & Electricals', 'electronics', NULL, NULL, '⚡', NULL, 2, 1, '2026-04-24 05:47:25.410', '2026-04-24 05:47:25.410'),
('cmochntr8000fsx3e1hoqqupz', 'Industrial Machinery', 'industrial-machinery', NULL, NULL, '⚙️', NULL, 1, 1, '2026-04-24 05:47:25.410', '2026-04-24 05:47:25.410'),
('cmochntr8000gsx3earmq0jtc', 'Agriculture Products', 'agriculture', NULL, NULL, '🌾', NULL, 6, 1, '2026-04-24 05:47:25.410', '2026-04-24 05:47:25.410'),
('cmochntre000lsx3epolswll8', 'Pumps & Valves', 'pumps-valves', NULL, NULL, NULL, 'cmochntr8000fsx3e1hoqqupz', 0, 1, '2026-04-24 05:47:25.419', '2026-04-24 05:47:25.419'),
('cmochntre000msx3eh7lvxqsr', 'Motors & Generators', 'motors-generators', NULL, NULL, NULL, 'cmochntr8000fsx3e1hoqqupz', 0, 1, '2026-04-24 05:47:25.419', '2026-04-24 05:47:25.419'),
('cmochntre000nsx3eetvr4pgr', 'Cables & Wires', 'cables-wires', NULL, NULL, NULL, 'cmochntr8000esx3egv7ctjuk', 0, 1, '2026-04-24 05:47:25.419', '2026-04-24 05:47:25.419'),
('cmochntre000osx3ez0n4ubdg', 'Circuit Boards', 'circuit-boards', NULL, NULL, NULL, 'cmochntr8000esx3egv7ctjuk', 0, 1, '2026-04-24 05:47:25.419', '2026-04-24 05:47:25.419');

-- --------------------------------------------------------

--
-- Table structure for table `chats`
--

CREATE TABLE `chats` (
  `id` varchar(191) NOT NULL,
  `senderId` varchar(191) NOT NULL,
  `receiverId` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `readAt` datetime(3) DEFAULT NULL,
  `attachments` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`attachments`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cms_pages`
--

CREATE TABLE `cms_pages` (
  `id` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `content` longtext NOT NULL,
  `metaTitle` varchar(191) DEFAULT NULL,
  `metaDesc` varchar(191) DEFAULT NULL,
  `isPublished` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inquiries`
--

CREATE TABLE `inquiries` (
  `id` varchar(191) NOT NULL,
  `buyerId` varchar(191) NOT NULL,
  `vendorId` varchar(191) NOT NULL,
  `productId` varchar(191) DEFAULT NULL,
  `subject` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unit` varchar(191) DEFAULT NULL,
  `status` enum('PENDING','RESPONDED','CLOSED','SPAM') NOT NULL DEFAULT 'PENDING',
  `response` text DEFAULT NULL,
  `respondedAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `inquiries`
--

INSERT INTO `inquiries` (`id`, `buyerId`, `vendorId`, `productId`, `subject`, `message`, `quantity`, `unit`, `status`, `response`, `respondedAt`, `createdAt`, `updatedAt`) VALUES
('cmochnts30016sx3ejlmjz4c7', 'cmochntr30008sx3edh2sghuh', 'cmochntqt0004sx3epg9bd03d', 'cmochntri000qsx3ezozcnfto', 'Price inquiry for bulk order', 'We need 10 units of this pump for our factory. Can you provide a bulk discount and what is the delivery timeline?', 10, 'piece', 'PENDING', NULL, NULL, '2026-04-24 05:47:25.443', '2026-04-24 05:47:25.443'),
('cmochnts50018sx3ejrs25mn5', 'cmochntr30008sx3edh2sghuh', 'cmochntqt0004sx3epg9bd03d', 'cmochntri000qsx3ezozcnfto', 'Technical specifications needed', 'Please share detailed technical specifications and installation manual for this pump.', 2, 'piece', 'RESPONDED', 'Thank you for your inquiry. We have sent the technical documentation to your email.', NULL, '2026-04-24 05:47:25.445', '2026-04-24 05:47:25.445'),
('cmocsi6lt001639hzsnqx2ao7', 'cmochntr30008sx3edh2sghuh', 'cmochntqt0004sx3epg9bd03d', 'cmochntri000qsx3ezozcnfto', 'Price inquiry for bulk order', 'We need 10 units of this pump for our factory. Can you provide a bulk discount and what is the delivery timeline?', 10, 'piece', 'PENDING', NULL, NULL, '2026-04-24 10:50:57.905', '2026-04-24 10:50:57.905'),
('cmocsi6m3001839hzx367qxkp', 'cmochntr30008sx3edh2sghuh', 'cmochntqt0004sx3epg9bd03d', 'cmochntri000qsx3ezozcnfto', 'Technical specifications needed', 'Please share detailed technical specifications and installation manual for this pump.', 2, 'piece', 'RESPONDED', 'Thank you for your inquiry. We have sent the technical documentation to your email.', NULL, '2026-04-24 10:50:57.915', '2026-04-24 10:50:57.915'),
('cmodx3222000111c7sadrvume', 'cmochntr30008sx3edh2sghuh', 'cmochntr00007sx3e70rz5ybh', 'cmochntrv0010sx3efwyetmoj', 'Inquiry for LED Panel Light 40W', ' test test v gfdsgds', 200, 'piece', 'PENDING', NULL, NULL, '2026-04-25 05:46:56.425', '2026-04-25 05:46:56.425');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `message` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL DEFAULT 'info',
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `link` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `userId`, `title`, `message`, `type`, `isRead`, `link`, `createdAt`) VALUES
('cmochnts80019sx3eitr4so2d', 'cmochntr30008sx3edh2sghuh', 'Welcome to B2B Marketplace', 'Start exploring thousands of products from verified vendors.', 'info', 0, NULL, '2026-04-24 05:47:25.448'),
('cmochnts8001asx3e4t7ob38k', 'cmochntqo0002sx3e1ii2q4bx', 'Profile Approved', 'Your vendor profile has been approved. Start adding products now!', 'success', 0, NULL, '2026-04-24 05:47:25.448'),
('cmochnts8001bsx3ei8jn4um1', 'cmochntq30000sx3eb19arpnr', 'New vendor registration', 'A new vendor has registered and awaiting approval.', 'info', 0, NULL, '2026-04-24 05:47:25.448'),
('cmocsi6m8001939hz0ybykjzo', 'cmochntr30008sx3edh2sghuh', 'Welcome to B2B Marketplace', 'Start exploring thousands of products from verified vendors.', 'info', 0, NULL, '2026-04-24 10:50:57.921'),
('cmocsi6m8001a39hzqraj6vz7', 'cmochntqo0002sx3e1ii2q4bx', 'Profile Approved', 'Your vendor profile has been approved. Start adding products now!', 'success', 0, NULL, '2026-04-24 10:50:57.921'),
('cmocsi6m8001b39hz941hnowu', 'cmochntq30000sx3eb19arpnr', 'New vendor registration', 'A new vendor has registered and awaiting approval.', 'info', 0, NULL, '2026-04-24 10:50:57.921'),
('cmodx322a000311c7udiih6hb', 'cmochntqy0005sx3e1k6dypow', 'New Inquiry', 'Amit Singh sent an inquiry', 'info', 0, '/dashboard/vendor/inquiries', '2026-04-25 05:46:56.435');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` varchar(191) NOT NULL,
  `buyerId` varchar(191) NOT NULL,
  `orderNumber` varchar(191) NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `shippingAddress` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`shippingAddress`)),
  `notes` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(191) NOT NULL,
  `orderId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` varchar(191) NOT NULL,
  `subscriptionId` varchar(191) DEFAULT NULL,
  `orderId` varchar(191) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(191) NOT NULL DEFAULT 'INR',
  `status` enum('PENDING','PAID','FAILED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `razorpayId` varchar(191) DEFAULT NULL,
  `razorpayOrderId` varchar(191) DEFAULT NULL,
  `receipt` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(191) NOT NULL,
  `vendorId` varchar(191) NOT NULL,
  `categoryId` varchar(191) NOT NULL,
  `title` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `shortDesc` varchar(191) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `minOrderQty` int(11) NOT NULL DEFAULT 1,
  `unit` varchar(191) NOT NULL DEFAULT 'piece',
  `sku` varchar(191) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`images`)),
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `status` enum('ACTIVE','INACTIVE','PENDING','REJECTED') NOT NULL DEFAULT 'PENDING',
  `isFeatured` tinyint(1) NOT NULL DEFAULT 0,
  `viewCount` int(11) NOT NULL DEFAULT 0,
  `inquiryCount` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `vendorId`, `categoryId`, `title`, `slug`, `description`, `shortDesc`, `price`, `minOrderQty`, `unit`, `sku`, `stock`, `images`, `specifications`, `tags`, `status`, `isFeatured`, `viewCount`, `inquiryCount`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
('cmochntri000qsx3ezozcnfto', 'cmochntqt0004sx3epg9bd03d', 'cmochntr8000fsx3e1hoqqupz', 'Industrial Centrifugal Pump 5HP', 'industrial-centrifugal-pump-5hp', 'High-performance centrifugal pump for industrial water transfer applications. Made with cast iron body and stainless steel impeller. Ideal for chemical, water treatment, and general industrial use.', NULL, 15000.00, 1, 'piece', NULL, 50, '[\"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500\"]', '{\"Material\":\"Industrial Grade\",\"Warranty\":\"1 Year\"}', NULL, 'ACTIVE', 0, 2, 0, '2026-04-24 05:47:25.423', '2026-04-24 10:53:50.039', NULL),
('cmochntrm000ssx3e04vxy5q3', 'cmochntqt0004sx3epg9bd03d', 'cmochntr8000fsx3e1hoqqupz', 'AC Induction Motor 10HP', 'ac-induction-motor-10hp', 'Energy-efficient AC induction motor suitable for industrial applications. IP55 protection rating. Available in 3-phase configuration.', NULL, 25000.00, 1, 'piece', NULL, 30, '[\"https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500\"]', '{\"Material\":\"Industrial Grade\",\"Warranty\":\"1 Year\"}', NULL, 'ACTIVE', 0, 0, 0, '2026-04-24 05:47:25.427', '2026-04-24 05:47:25.427', NULL),
('cmochntro000usx3ebw3h95w2', 'cmochntr00007sx3e70rz5ybh', 'cmochntr8000esx3egv7ctjuk', 'Arduino Mega 2560 R3 Board', 'arduino-mega-2560-r3', 'Official Arduino Mega 2560 R3 microcontroller board. 54 digital I/O pins, 16 analog inputs. USB connection, power jack, ICSP header.', NULL, 850.00, 10, 'piece', NULL, 500, '[\"https://images.unsplash.com/photo-1518770660439-4636190af475?w=500\"]', '{\"Material\":\"Industrial Grade\",\"Warranty\":\"1 Year\"}', NULL, 'ACTIVE', 0, 2, 0, '2026-04-24 05:47:25.429', '2026-04-24 10:39:09.332', NULL),
('cmochntrq000wsx3egz4s6rm2', 'cmochntr00007sx3e70rz5ybh', 'cmochntr8000esx3egv7ctjuk', 'Multi-strand Copper Wire 2.5mm', 'copper-wire-2-5mm', 'High-quality multi-strand copper wire for electrical installations. PVC insulated, 2.5mm cross-section. Available in 90m coils.', NULL, 1200.00, 5, 'coil', NULL, 200, '[\"https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500\"]', '{\"Material\":\"Industrial Grade\",\"Warranty\":\"1 Year\"}', NULL, 'ACTIVE', 0, 4, 0, '2026-04-24 05:47:25.431', '2026-04-24 10:39:39.585', NULL),
('cmochntrs000ysx3e51788x3d', 'cmochntqt0004sx3epg9bd03d', 'cmochntr8000dsx3ev0ad7k48', 'TMT Steel Bar 12mm Fe-500', 'tmt-steel-bar-12mm', 'High strength TMT steel bars Fe-500 grade. 12mm diameter. Used in RCC construction. ISI marked, corrosion resistant.', NULL, 65000.00, 1, 'MT', NULL, 100, '[\"https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500\"]', '{\"Material\":\"Industrial Grade\",\"Warranty\":\"1 Year\"}', NULL, 'ACTIVE', 0, 6, 0, '2026-04-24 05:47:25.433', '2026-04-24 10:57:35.497', NULL),
('cmochntrv0010sx3efwyetmoj', 'cmochntr00007sx3e70rz5ybh', 'cmochntr8000esx3egv7ctjuk', 'LED Panel Light 40W', 'led-panel-light-40w', 'Energy-saving LED panel light 40W. 4000 lumens output, 6500K cool white. Surface mount installation. 3 year warranty.', NULL, 450.00, 20, 'piece', NULL, 1000, '[\"https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=500\"]', '{\"Material\":\"Industrial Grade\",\"Warranty\":\"1 Year\"}', NULL, 'ACTIVE', 0, 4, 0, '2026-04-24 05:47:25.435', '2026-04-25 05:46:38.785', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE `subscriptions` (
  `id` varchar(191) NOT NULL,
  `vendorId` varchar(191) NOT NULL,
  `plan` enum('FREE','BASIC','PREMIUM','ENTERPRISE') NOT NULL DEFAULT 'FREE',
  `status` enum('ACTIVE','EXPIRED','CANCELLED','PENDING') NOT NULL DEFAULT 'ACTIVE',
  `startDate` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `endDate` datetime(3) DEFAULT NULL,
  `price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `paymentId` varchar(191) DEFAULT NULL,
  `razorpayOrderId` varchar(191) DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`features`)),
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `subscriptions`
--

INSERT INTO `subscriptions` (`id`, `vendorId`, `plan`, `status`, `startDate`, `endDate`, `price`, `paymentId`, `razorpayOrderId`, `features`, `createdAt`, `updatedAt`) VALUES
('cmochntrx0012sx3e95urwuk1', 'cmochntqt0004sx3epg9bd03d', 'PREMIUM', 'ACTIVE', '2026-04-24 05:47:25.438', '2027-04-24 05:47:25.436', 4999.00, NULL, NULL, NULL, '2026-04-24 05:47:25.438', '2026-04-24 05:47:25.438'),
('cmochntrz0014sx3eqe7xeg4q', 'cmochntr00007sx3e70rz5ybh', 'BASIC', 'ACTIVE', '2026-04-24 05:47:25.440', '2026-05-24 05:47:25.439', 999.00, NULL, NULL, NULL, '2026-04-24 05:47:25.440', '2026-04-24 05:47:25.440'),
('cmocsi6lh001239hzqgecmzdf', 'cmochntqt0004sx3epg9bd03d', 'PREMIUM', 'ACTIVE', '2026-04-24 10:50:57.894', '2027-04-24 10:50:57.892', 4999.00, NULL, NULL, NULL, '2026-04-24 10:50:57.894', '2026-04-24 10:50:57.894'),
('cmocsi6lp001439hz8p788uy2', 'cmochntr00007sx3e70rz5ybh', 'BASIC', 'ACTIVE', '2026-04-24 10:50:57.902', '2026-05-24 10:50:57.900', 999.00, NULL, NULL, NULL, '2026-04-24 10:50:57.902', '2026-04-24 10:50:57.902');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `password` varchar(191) NOT NULL,
  `role` enum('SUPER_ADMIN','SUB_ADMIN','VENDOR','BUYER') NOT NULL DEFAULT 'BUYER',
  `status` enum('ACTIVE','INACTIVE','SUSPENDED','PENDING') NOT NULL DEFAULT 'ACTIVE',
  `emailVerified` tinyint(1) NOT NULL DEFAULT 0,
  `phoneVerified` tinyint(1) NOT NULL DEFAULT 0,
  `avatar` varchar(191) DEFAULT NULL,
  `otp` varchar(191) DEFAULT NULL,
  `otpExpiry` datetime(3) DEFAULT NULL,
  `resetToken` varchar(191) DEFAULT NULL,
  `resetTokenExpiry` datetime(3) DEFAULT NULL,
  `lastLogin` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password`, `role`, `status`, `emailVerified`, `phoneVerified`, `avatar`, `otp`, `otpExpiry`, `resetToken`, `resetTokenExpiry`, `lastLogin`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
('cmochntq30000sx3eb19arpnr', 'Super Admin', 'admin@example.com', '9900000001', '$2a$12$2AyZ4lNz4DfdXLgCZZbNou6LBmCYxEWQISg5yPMWm/WrDZvVnKSO6', 'SUPER_ADMIN', 'ACTIVE', 1, 0, NULL, NULL, NULL, NULL, NULL, '2026-04-25 05:58:47.102', '2026-04-24 05:47:25.370', '2026-04-25 05:58:47.104', NULL),
('cmochntql0001sx3eylhfvbmh', 'Sub Admin', 'subadmin@example.com', '9900000002', '$2a$12$2AyZ4lNz4DfdXLgCZZbNou6LBmCYxEWQISg5yPMWm/WrDZvVnKSO6', 'SUB_ADMIN', 'ACTIVE', 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-24 05:47:25.389', '2026-04-24 05:47:25.389', NULL),
('cmochntqo0002sx3e1ii2q4bx', 'Rajesh Kumar', 'vendor@example.com', '9800000001', '$2a$12$dzADH4CMCrbNtJNpS19/oOErD6ak4VsZ4m8Z.rJloXne6Or/GGFtu', 'VENDOR', 'ACTIVE', 1, 0, NULL, NULL, NULL, NULL, NULL, '2026-04-25 05:50:36.263', '2026-04-24 05:47:25.392', '2026-04-25 05:50:36.265', NULL),
('cmochntqy0005sx3e1k6dypow', 'Priya Sharma', 'vendor2@example.com', '9800000002', '$2a$12$dzADH4CMCrbNtJNpS19/oOErD6ak4VsZ4m8Z.rJloXne6Or/GGFtu', 'VENDOR', 'ACTIVE', 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-24 05:47:25.402', '2026-04-24 05:47:25.402', NULL),
('cmochntr30008sx3edh2sghuh', 'Amit Singh', 'user@example.com', '9700000001', '$2a$12$14BaHSyXkCS0J7eCDydNLu3AvAlv1AzcrewVyn78IiUlh7slzQgKG', 'BUYER', 'ACTIVE', 1, 0, NULL, NULL, NULL, NULL, NULL, '2026-04-25 05:46:33.856', '2026-04-24 05:47:25.407', '2026-04-25 05:46:33.862', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `companyName` varchar(191) NOT NULL,
  `gstNumber` varchar(191) DEFAULT NULL,
  `panNumber` varchar(191) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `address` varchar(191) DEFAULT NULL,
  `city` varchar(191) DEFAULT NULL,
  `state` varchar(191) DEFAULT NULL,
  `pincode` varchar(191) DEFAULT NULL,
  `country` varchar(191) NOT NULL DEFAULT 'India',
  `website` varchar(191) DEFAULT NULL,
  `logo` varchar(191) DEFAULT NULL,
  `banner` varchar(191) DEFAULT NULL,
  `status` enum('PENDING','APPROVED','REJECTED','SUSPENDED') NOT NULL DEFAULT 'PENDING',
  `isVerified` tinyint(1) NOT NULL DEFAULT 0,
  `totalProducts` int(11) NOT NULL DEFAULT 0,
  `totalLeads` int(11) NOT NULL DEFAULT 0,
  `totalViews` int(11) NOT NULL DEFAULT 0,
  `rating` double NOT NULL DEFAULT 0,
  `reviewCount` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `deletedAt` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`id`, `userId`, `companyName`, `gstNumber`, `panNumber`, `description`, `address`, `city`, `state`, `pincode`, `country`, `website`, `logo`, `banner`, `status`, `isVerified`, `totalProducts`, `totalLeads`, `totalViews`, `rating`, `reviewCount`, `createdAt`, `updatedAt`, `deletedAt`) VALUES
('cmochntqt0004sx3epg9bd03d', 'cmochntqo0002sx3e1ii2q4bx', 'Rajesh Industrial Supplies', '29ABCDE1234F1Z5', 'ABCDE1234F', 'Leading supplier of industrial equipment and machinery since 2005.', '123 Industrial Estate, Sector 5', 'Mumbai', 'Maharashtra', '400001', 'India', NULL, NULL, NULL, 'APPROVED', 1, 0, 0, 12, 0, 0, '2026-04-24 05:47:25.397', '2026-04-25 05:51:13.685', NULL),
('cmochntr00007sx3e70rz5ybh', 'cmochntqy0005sx3e1k6dypow', 'Priya Tech Components', '07FGHIJ5678K2L6', NULL, 'Electronic components and circuit boards manufacturer.', '45 Tech Park, Phase 2', 'Bangalore', 'Karnataka', '560001', 'India', NULL, NULL, NULL, 'APPROVED', 1, 0, 1, 2, 0, 0, '2026-04-24 05:47:25.404', '2026-04-25 05:46:56.431', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `vendor_analytics`
--

CREATE TABLE `vendor_analytics` (
  `id` varchar(191) NOT NULL,
  `vendorId` varchar(191) NOT NULL,
  `date` date NOT NULL,
  `views` int(11) NOT NULL DEFAULT 0,
  `leads` int(11) NOT NULL DEFAULT 0,
  `clicks` int(11) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `productId` varchar(191) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('35d6108a-1de4-4eb1-9863-ebf40276aa68', 'd21728b7d151c1b5d8387b3e84565b3f1f38e8e0e30f156feaec75959685b22d', '2026-04-24 05:34:36.797', '20260424053435_init', NULL, NULL, '2026-04-24 05:34:35.842', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_logs_adminId_idx` (`adminId`),
  ADD KEY `admin_logs_entity_idx` (`entity`),
  ADD KEY `admin_logs_createdAt_idx` (`createdAt`),
  ADD KEY `admin_logs_targetId_fkey` (`targetId`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_slug_key` (`slug`),
  ADD KEY `categories_parentId_idx` (`parentId`),
  ADD KEY `categories_slug_idx` (`slug`);

--
-- Indexes for table `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`id`),
  ADD KEY `chats_senderId_idx` (`senderId`),
  ADD KEY `chats_receiverId_idx` (`receiverId`),
  ADD KEY `chats_createdAt_idx` (`createdAt`);

--
-- Indexes for table `cms_pages`
--
ALTER TABLE `cms_pages`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cms_pages_slug_key` (`slug`);

--
-- Indexes for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inquiries_buyerId_idx` (`buyerId`),
  ADD KEY `inquiries_vendorId_idx` (`vendorId`),
  ADD KEY `inquiries_productId_idx` (`productId`),
  ADD KEY `inquiries_status_idx` (`status`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_userId_idx` (`userId`),
  ADD KEY `notifications_isRead_idx` (`isRead`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_orderNumber_key` (`orderNumber`),
  ADD KEY `orders_buyerId_idx` (`buyerId`),
  ADD KEY `orders_orderNumber_idx` (`orderNumber`),
  ADD KEY `orders_status_idx` (`status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_items_orderId_idx` (`orderId`),
  ADD KEY `order_items_productId_idx` (`productId`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `payments_subscriptionId_idx` (`subscriptionId`),
  ADD KEY `payments_orderId_idx` (`orderId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `products_slug_key` (`slug`),
  ADD UNIQUE KEY `products_sku_key` (`sku`),
  ADD KEY `products_vendorId_idx` (`vendorId`),
  ADD KEY `products_categoryId_idx` (`categoryId`),
  ADD KEY `products_status_idx` (`status`),
  ADD KEY `products_slug_idx` (`slug`);

--
-- Indexes for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subscriptions_vendorId_idx` (`vendorId`),
  ADD KEY `subscriptions_status_idx` (`status`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_key` (`email`),
  ADD UNIQUE KEY `users_phone_key` (`phone`),
  ADD KEY `users_email_idx` (`email`),
  ADD KEY `users_phone_idx` (`phone`),
  ADD KEY `users_role_idx` (`role`),
  ADD KEY `users_status_idx` (`status`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vendors_userId_key` (`userId`),
  ADD UNIQUE KEY `vendors_gstNumber_key` (`gstNumber`),
  ADD KEY `vendors_userId_idx` (`userId`),
  ADD KEY `vendors_status_idx` (`status`),
  ADD KEY `vendors_city_idx` (`city`);

--
-- Indexes for table `vendor_analytics`
--
ALTER TABLE `vendor_analytics`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vendor_analytics_vendorId_date_key` (`vendorId`,`date`),
  ADD KEY `vendor_analytics_vendorId_idx` (`vendorId`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wishlists_userId_productId_key` (`userId`,`productId`),
  ADD KEY `wishlists_userId_idx` (`userId`),
  ADD KEY `wishlists_productId_fkey` (`productId`);

--
-- Indexes for table `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD CONSTRAINT `admin_logs_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `admin_logs_targetId_fkey` FOREIGN KEY (`targetId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `chats`
--
ALTER TABLE `chats`
  ADD CONSTRAINT `chats_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `chats_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `inquiries`
--
ALTER TABLE `inquiries`
  ADD CONSTRAINT `inquiries_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `inquiries_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `inquiries_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendors` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_buyerId_fkey` FOREIGN KEY (`buyerId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `order_items_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `orders` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `payments_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `subscriptions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `products_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendors` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `subscriptions`
--
ALTER TABLE `subscriptions`
  ADD CONSTRAINT `subscriptions_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendors` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `vendors`
--
ALTER TABLE `vendors`
  ADD CONSTRAINT `vendors_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `vendor_analytics`
--
ALTER TABLE `vendor_analytics`
  ADD CONSTRAINT `vendor_analytics_vendorId_fkey` FOREIGN KEY (`vendorId`) REFERENCES `vendors` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `wishlists_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
