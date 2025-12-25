<?php
/**
 * Delete Comment API
 * Accepts comment_id, checks ownership, and deletes comment.
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
$comment_id = $_POST['comment_id'] ?? '';
$user_id = $_SESSION['user_id'];

// Input Validation
if (empty($comment_id)) {
    $response['message'] = 'Comment ID cannot be empty.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

//Database Connection
$conn = require_once __DIR__ . '/../includes/db.php';

try {
    //Check if comment belongs to current user
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
        $response['message'] = 'You are not authorized to delete this comment.';
        http_response_code(403); // Forbidden
        echo json_encode($response);
        $conn->close();
        exit();
    }

    //Delete Comment from Database
    $stmt = $conn->prepare("DELETE FROM comments WHERE id = ? AND user_id = ?");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("ii", $comment_id, $user_id);
    $stmt->execute();

    if ($stmt->affected_rows > 0) {
        $response['success'] = true;
        $response['message'] = 'Comment deleted successfully.';
        http_response_code(200);
    } else {
        $response['message'] = 'Comment deletion failed or comment not found.';
        http_response_code(500); // Or 404 if it disappeared
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
