<?php
/**
 * Get Comments API
 * Accepts video_path GET parameter, queries comments table, and returns comments.
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$response = [
    'success' => false,
    'comments' => [],
    'message' => ''
];

// Check if video_path GET parameter is provided
$video_path = $_GET['video_path'] ?? '';

if (empty($video_path)) {
    $response['message'] = 'Missing video_path parameter.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

// Database Connection
$conn = require_once __DIR__ . '/../includes/db.php';

try {
    // Query comments table with JOIN to users table
    $stmt = $conn->prepare("SELECT c.id, u.username, c.comment_text, c.created_at
                            FROM comments c
                            JOIN users u ON c.user_id = u.id
                            WHERE c.video_path = ?
                            ORDER BY c.created_at DESC");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    $stmt->bind_param("s", $video_path);
    $stmt->execute();
    $result = $stmt->get_result();
    $comments = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    $response['success'] = true;
    $response['comments'] = $comments;
    $response['message'] = count($comments) > 0
        ? 'Comments loaded successfully.'
        : 'No comments found for this video.';

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
