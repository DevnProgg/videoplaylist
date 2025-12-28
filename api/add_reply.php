<?php
// Adds a reply to a comment.

session_start();

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

$response = [
    'success' => false,
    'message' => ''
];

// Make sure the user is logged in.
if (!isset($_SESSION['user_id'])) {
    $response['message'] = 'User not logged in.';
    http_response_code(401);
    echo json_encode($response);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $response['message'] = 'Invalid request method. Only POST requests are allowed.';
    http_response_code(405);
    echo json_encode($response);
    exit();
}

$comment_id = $_POST['comment_id'] ?? '';
$reply_text = trim($_POST['reply_text'] ?? '');
$user_id = $_SESSION['user_id'];

// Validation
if (empty($comment_id)) {
    $response['message'] = 'Comment ID cannot be empty.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

if (empty($reply_text)) {
    $response['message'] = 'Reply cannot be empty.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

if (strlen($reply_text) > 500) {
    $response['message'] = 'Reply cannot exceed 500 characters.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

$conn = require_once __DIR__ . '/../includes/db.php';

try {
    // Verify that the comment exists
    $stmt = $conn->prepare("SELECT id FROM comments WHERE id = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("i", $comment_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if (!$result->fetch_assoc()) {
        $response['message'] = 'Comment not found.';
        http_response_code(404);
        echo json_encode($response);
        $stmt->close();
        $conn->close();
        exit();
    }
    $stmt->close();

    // Add the reply to the database
    $stmt = $conn->prepare("INSERT INTO comment_replies (comment_id, user_id, reply_text) VALUES (?, ?, ?)");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("iis", $comment_id, $user_id, $reply_text);
    $stmt->execute();

    $response['success'] = true;
    $response['message'] = 'Reply added successfully.';
    http_response_code(201);

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