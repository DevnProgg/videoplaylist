<?php
// Handles the database connection.

// Database credentials.
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');     // Not recommended for production
define('DB_NAME', 'videoplaylist');

// Create the connection.
$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

// Make sure the connection is good.
if ($conn->connect_error) {
    // In a real app, you'd want to log this error.
    die("Connection failed: " . $conn->connect_error);
}

// Good practice to set the charset.
$conn->set_charset("utf8mb4");

return $conn;
?>
