<?php
/**
 * Check Session API
 * Checks if a user is logged in and returns relevant session data.
 */

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$response = [
    'logged_in' => false,
    'username' => null,
    'message' => ''
];

if (isset($_SESSION['user_id'])) {
    $response['logged_in'] = true;
    $response['username'] = $_SESSION['username'] ?? null;
    $response['message'] = 'User is logged in.';
} else {
    $response['message'] = 'User is not logged in.';
}

echo json_encode($response);
?>
