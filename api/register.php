<?php
/**
 * User Registration API
 * Accepts username and password, validates, hashes password, and inserts into users table.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

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

//Input Validation
if (empty($username)) {
    $response['message'] = 'Username cannot be empty.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

if (strlen($username) < 3) {
    $response['message'] = 'Username must be at least 3 characters long.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

if (empty($password)) {
    $response['message'] = 'Password cannot be empty.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

// Database Connection
$conn = require_once __DIR__ . '/../includes/db.php';

try {
    // Check if username already exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result(); // Store result to check num_rows
    if ($stmt->num_rows > 0) {
        $response['message'] = 'Username already exists.';
        http_response_code(409); // Conflict
        echo json_encode($response);
        $stmt->close();
        $conn->close();
        exit();
    }
    $stmt->close();

    // Hash Password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    // Insert User into Database
    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("ss", $username, $hashed_password);
    $stmt->execute();

    $response['success'] = true;
    $response['message'] = 'User registered successfully.';
    http_response_code(201); // Created

} catch (Exception $e) {
    $response['message'] = 'Server error: ' . $e->getMessage();
    http_response_code(500);
} finally {
    if (isset($stmt) && $stmt instanceof mysqli_stmt) {
        $stmt->close();
    }
    if (isset($conn) && $conn instanceof mysqli) {
        $conn->close();
    }
}

echo json_encode($response);
?>
