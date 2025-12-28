<?php
// Gets all replies for a given comment.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$response = [
    'success' => false,
    'replies' => [],
    'message' => ''
];

$comment_id = $_GET['comment_id'] ?? '';

if (empty($comment_id)) {
    $response['message'] = 'Missing comment_id parameter.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

$conn = require_once __DIR__ . '/../includes/db.php';

try {
    // Get all replies for this comment
    $stmt = $conn->prepare("SELECT r.id, u.username, r.reply_text, r.created_at, r.user_id
                            FROM comment_replies r
                            JOIN users u ON r.user_id = u.id
                            WHERE r.comment_id = ?
                            ORDER BY r.created_at ASC");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("i", $comment_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $replies = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    $response['success'] = true;
    $response['replies'] = $replies;
    $response['message'] = count($replies) > 0
        ? 'Replies loaded successfully.'
        : 'No replies found for this comment.';

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