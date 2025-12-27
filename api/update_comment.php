<?php
// Updates a comment.

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
    http_response_code(401); // Unauthorized
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
$comment_text = $_POST['comment_text'] ?? '';
$user_id = $_SESSION['user_id'];

// A little validation...
if (empty($comment_id)) {
    $response['message'] = 'Comment ID cannot be empty.';
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

$conn = require_once __DIR__ . '/../includes/db.php';

try {
    // Make sure the comment belongs to the current user.
    $stmt = $conn->prepare("SELECT user_id FROM comments WHERE id = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("i", $comment_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $comment_data = $result->fetch_assoc();
    $stmt->close();

    if (!$comment_data) {
        $response['message'] = 'Comment not found.';
        http_response_code(404); // Not Found
        echo json_encode($response);
        $conn->close();
        exit();
    }

    if ($comment_data['user_id'] != $user_id) {
        $response['message'] = 'You are not authorized to update this comment.';
        http_response_code(403); // Forbidden
        echo json_encode($response);
        $conn->close();
        exit();
    }

    // Update the comment.
    $stmt = $conn->prepare("UPDATE comments SET comment_text = ? WHERE id = ? AND user_id = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("sii", $comment_text, $comment_id, $user_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $response['success'] = true;
        $response['message'] = 'Comment updated successfully.';
        http_response_code(200);
    } else {
        $response['message'] = 'Comment update failed or no changes made.';
        http_response_code(200); // Still 200, as the operation itself was successful
    }
    $stmt->close();

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
