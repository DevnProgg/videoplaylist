<?php
// Handles user login.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

session_start();

$response = [
    'success' => false,
    'message' => ''
];

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method. Only POST requests are allowed.';
    http_response_code(405);
    echo json_encode($response);
    exit();
}

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

if (empty($username) || empty($password)) {
    $response['message'] = 'Username and password cannot be empty.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

$conn = require_once __DIR__ . '/../includes/db.php';

try {
    // Check if the user exists.
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
        // Check if the password is correct.
        if (password_verify($password, $user_data['password'])) {
            // Start a session.
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
        $response['suggest_signup'] = true; // Flag to suggest sign-up
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
