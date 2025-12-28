<?php
// Gets all comments for a given video.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

session_start();

$response = [
    'success' => false,
    'comments' => [],
    'message' => ''
];

// Make sure the video path is provided.
$video_path = $_GET['video_path'] ?? '';

if (empty($video_path)) {
    $response['message'] = 'Missing video_path parameter.';
    http_response_code(400);
    echo json_encode($response);
    exit();
}

$conn = require_once __DIR__ . '/../includes/db.php';
$user_id = $_SESSION['user_id'] ?? 0; // Default to 0 if not logged in

try {
    // Get all comments and join with the users table to get the username.
    // Also get the like count, and check if the current user has liked each comment.
    // Also get the reply count for each comment.
    $stmt = $conn->prepare("
        SELECT
            c.id,
            u.username,
            c.comment_text,
            c.created_at,
            c.user_id,
            (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) as like_count,
            (SELECT COUNT(*) > 0 FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = ?) as user_has_liked,
            (SELECT COUNT(*) FROM comment_replies cr WHERE cr.comment_id = c.id) as reply_count
        FROM
            comments c
        JOIN
            users u ON c.user_id = u.id
        WHERE
            c.video_path = ?
        ORDER BY
            c.created_at DESC
    ");
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("is", $user_id, $video_path);
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
