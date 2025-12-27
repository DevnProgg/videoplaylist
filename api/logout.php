<?php
// Logs the user out.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST'); // Allow both GET and POST for flexibility

session_start();

session_destroy();

$response = [
    'success' => true,
    'message' => 'Logged out successfully.'
];

echo json_encode($response);
?>
