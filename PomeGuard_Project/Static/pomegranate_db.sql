-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 21, 2025 at 12:38 PM
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
-- Database: `pomegranate_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `diseases`
--

CREATE TABLE `diseases` (
  `Id` int(11) NOT NULL,
  `disease_name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `solution_organic` text NOT NULL,
  `solution_chemical` text NOT NULL,
  `description_mr` text DEFAULT NULL,
  `solution_organic_mr` text DEFAULT NULL,
  `solution_chemical_mr` text DEFAULT NULL,
  `disease_name_mr` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `diseases`
--

INSERT INTO `diseases` (`Id`, `disease_name`, `description`, `solution_organic`, `solution_chemical`, `description_mr`, `solution_organic_mr`, `solution_chemical_mr`, `disease_name_mr`) VALUES
(1, 'Healthy', 'The fruit or leaf is healthy and shows no signs of disease.', 'No action needed. Maintain good agricultural practices.', 'No action needed.', NULL, NULL, NULL, 'निरोगी'),
(2, 'Cercospora', 'Caused by the fungus *Cercospora punicae*. It appears as small, dark brown to black irregular spots on leaves and fruit. Heavily infected leaves may turn yellow and fall off prematurely.', 'Practice good sanitation: remove and destroy all fallen leaves and infected fruit. Prune trees to improve air circulation and sunlight penetration. Avoid overhead watering.', 'Spray with fungicides containing Mancozeb (like Dithane M-45) or Carbendazim. Always follow the product label for concentration and timing.', NULL, NULL, NULL, 'डांबरी(Cercospora)'),
(3, 'Anthracnose', 'Caused by the fungus *Colletotrichum gloeosporioides*. It creates dark, circular, sunken spots (lesions) on the fruit, which may ooze pinkish spores in humid weather. Leaves show similar dark spots, often with a yellow halo.', 'Remove and destroy infected fruits, leaves, and branches. Prune to open the canopy for better air flow. Use biocontrol agents based on *Bacillus subtilis* or *Trichoderma*.', 'Apply fungicides such as Copper Oxychloride, Propiconazole, or Mancozeb. Start sprays before the rainy season and repeat according to label directions.', NULL, NULL, NULL, 'खरडा (Anthracnose)'),
(4, 'Bacterial_Blight', 'Caused by the bacterium *Xanthomonas axonopodis pv. punicae*. This is a very serious disease. It appears as small, water-soaked, dark spots on leaves with a yellow border. On fruit, it causes black, sunken, and often cracking spots, making the fruit rot.', 'Crucial: Prune and burn all infected branches, leaves, and fruits. Always disinfect pruning tools with a 1% sodium hypochlorite (bleach) solution between each cut. Plant resistant varieties like \'Bhagwa\'.', 'Spray with a combination of an antibiotic like Streptocycline (or Streptomycin Sulphate) and a copper-based bactericide like Copper Oxychloride. This is most effective when done preventively.', NULL, NULL, NULL, 'तेल्या (Bacterial Blight)'),
(5, 'Alternaria', 'Also known as \"Black Heart\" or \"Heart Rot,\" caused by *Alternaria alternata*. This disease is tricky as the fruit often looks perfect on the outside. The infection enters through the flower, and the inside of the fruit (arils) becomes a black, rotting, moldy mass.', 'Sanitation is key. Remove and destroy all old, mummified fruits and dead branches from the orchard. Control dust and avoid water stress, as fruit cracking can allow entry.', 'Chemical control is difficult as the infection happens early at the blossom stage. Preventive sprays of fungicides like Azoxystrobin or Propiconazole during the flowering period may help.', NULL, NULL, NULL, 'बुरशी (Alternaria)');

-- --------------------------------------------------------

--
-- Table structure for table `predictions`
--

CREATE TABLE `predictions` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `disease_name` varchar(255) NOT NULL,
  `confidence` decimal(5,2) NOT NULL,
  `image_filename` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `predictions`
--

INSERT INTO `predictions` (`id`, `user_id`, `disease_name`, `confidence`, `image_filename`, `timestamp`) VALUES
(7, 1, 'Bacterial_Blight', 1.00, NULL, '2025-11-18 12:43:50'),
(8, 1, 'Bacterial_Blight', 1.00, NULL, '2025-11-18 12:51:39'),
(9, 1, 'Bacterial_Blight', 1.00, NULL, '2025-11-18 12:51:48'),
(10, 1, 'Bacterial_Blight', 1.00, NULL, '2025-11-18 12:51:57'),
(11, 1, 'Bacterial_Blight', 1.00, NULL, '2025-11-18 12:52:00'),
(12, 1, 'Bacterial_Blight', 0.96, NULL, '2025-11-18 12:52:24'),
(13, 1, 'Anthracnose', 0.92, NULL, '2025-11-18 12:52:59'),
(14, 1, 'Anthracnose', 0.99, NULL, '2025-11-18 12:54:52'),
(15, 1, 'Bacterial_Blight', 1.00, NULL, '2025-11-18 12:55:38'),
(16, 1, 'Alternaria', 0.50, NULL, '2025-11-18 12:56:10'),
(17, 1, 'Bacterial_Blight', 0.99, NULL, '2025-11-18 12:57:03'),
(18, 1, 'Bacterial_Blight', 0.97, NULL, '2025-11-18 12:57:20'),
(19, 1, 'Bacterial_Blight', 0.99, NULL, '2025-11-21 11:29:09'),
(20, 1, 'Bacterial_Blight', 0.99, NULL, '2025-11-21 11:29:11'),
(21, 1, 'Bacterial_Blight', 0.99, NULL, '2025-11-21 11:29:14');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `created_at`) VALUES
(1, 'DSE23130700', 'koresushant193@gmail.com', '$2b$12$HjMWonSk21E3Bn.n7y5c7erwT8g0T9S28kX42a/FZ4CKlaCeAFGze', '2025-11-17 18:05:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `diseases`
--
ALTER TABLE `diseases`
  ADD PRIMARY KEY (`Id`);

--
-- Indexes for table `predictions`
--
ALTER TABLE `predictions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `diseases`
--
ALTER TABLE `diseases`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `predictions`
--
ALTER TABLE `predictions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `predictions`
--
ALTER TABLE `predictions`
  ADD CONSTRAINT `predictions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
