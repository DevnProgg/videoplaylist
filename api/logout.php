<?php
/**
 * User Logout API
 * Destroys all session data and returns a success message.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST'); // Allow both GET and POST for logout for flexibility

// Start session to access and destroy session data
session_start();

// Destroy all session data
session_destroy();

$response = [
    'success' => true,
    'message' => 'Logged out successfully.'
];

echo json_encode($response);
?>
