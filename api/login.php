<?php
/**
 * User Login API
 * Accepts username and password, verifies credentials, starts a session,
 * and returns JSON with success/error message and username.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

// Start session
session_start();

$response = [
    'success' => false,
    'message' => ''
];

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method. Only POST requests are allowed.';
    http_response_code(405);
    echo json_encode($response);
    exit();
}

// Get POST data
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

// Input Validation
if (empty($username) || empty($password)) {
    $response['message'] = 'Username and password cannot be empty.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

// Database Connection
$conn = require_once __DIR__ . '/../includes/db.php';

try {
    // Query users table for username
    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    $user_data = $result->fetch_assoc();
    $stmt->close();

    if ($user_data) {
        // Verify password
        if (password_verify($password, $user_data['password'])) {
            //Start session and store user_id and username 
            $_SESSION['user_id'] = $user_data['id'];
            $_SESSION['username'] = $user_data['username'];

            $response['success'] = true;
            $response['message'] = 'Login successful.';
            $response['username'] = $user_data['username'];
            http_response_code(200);
        } else {
            $response['message'] = 'Invalid credentials.';
            http_response_code(401); // Unauthorized
        }
    } else {
        $response['message'] = 'Account not found. Would you like to sign up?';
        $response['suggest_signup'] = true; // New flag to indicate sign-up suggestion
        http_response_code(401); // Unauthorized
    }

} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
    http_response_code(500);
} finally {
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}

echo json_encode($response);
?>
