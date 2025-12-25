<?php
/**
 * Add Comment API
 * Accepts video_path and comment_text, inserts into comments table with user_id.
 */

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$response = [
    'success' => false,
    'message' => ''
];

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'User not logged in.';
    http_response_code(401); // Unauthorized
    echo json_encode($response);
    exit();
}

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method. Only POST requests are allowed.';
    http_response_code(405);
    echo json_encode($response);
    exit();
}

// Get POST data
$video_path = $_POST['video_path'] ?? '';
$comment_text = trim($_POST['comment_text'] ?? '');
$user_id = $_SESSION['user_id'];

// --- Input Validation ---
if (empty($video_path)) {
    $response['message'] = 'Video path cannot be empty.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

if (empty($comment_text)) {
    $response['message'] = 'Comment cannot be empty.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

if (strlen($comment_text) > 500) {
    $response['message'] = 'Comment cannot exceed 500 characters.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

// --- Database Connection ---
$conn = require_once '../../includes/db.php';

try {
    // --- Insert Comment into Database ---
    $stmt = $conn->prepare("INSERT INTO comments (video_path, user_id, comment_text) VALUES (?, ?, ?)");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("sis", $video_path, $user_id, $comment_text);
    $stmt->execute();

    $response['success'] = true;
    $response['message'] = 'Comment added successfully.';
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
