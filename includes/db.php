<?php
/**
 * Database Connection File
 * Defines constants and establishes a MySQLi connection.
 */

// Define database connection constants
// IMPORTANT: Replace with your actual database credentials
define('DB_HOST', 'localhost');
define('DB_USER', 'root'); // Your DB username
define('DB_PASS', '');     // Your DB password
define('DB_NAME', 'videoplaylist_db'); // Your DB name

// Create MySQLi connection
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Check connection
if ($conn->connect_error) {
    // In a real application, you might log this error instead of exposing it
    die("Connection failed: " . $conn->connect_error);
}

// Set charset to utf8mb4
$conn->set_charset("utf8mb4");

// This file will return the $conn variable when included.
return $conn;
?>
