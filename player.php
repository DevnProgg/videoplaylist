<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit();
}

$username = $_SESSION['username'] ?? 'Guest'; // Fallback if username not set for some reason
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Player</title>
    <link rel="stylesheet" href="assets/css/player-style.css">
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script>
        // Expose PHP session user_id to JavaScript
        const CURRENT_USER_ID = <?php echo json_encode($_SESSION['user_id'] ?? null); ?>;
    </script>
</head>
<body>
    <header class="glass-header">
        <div class="header-content">
            <h1>Welcome, <?php echo htmlspecialchars($username); ?>!</h1>
            <button id="logout-btn" class="btn logout-btn">Logout</button>
        </div>
    </header>

    <div class="container">
        <div class="main-content">
            <video id="video-player" controls autoplay></video>
            <div class="comment-section">
                <h2>Comments</h2>
                <div class="comment-form-container">
                    <textarea id="comment-text" maxlength="500" placeholder="Write a comment..."></textarea>
                    <span class="char-count">0/500</span>
                    <button id="submit-comment" class="btn">Post Comment</button>
                </div>
                <div class="comments-list">
                    <!-- Comments will be loaded here via AJAX -->
                </div>
            </div>
        </div>
        <div class="sidebar">
            <h2>Playlist</h2>
            <ul class="playlist">
                <!-- Playlist items will be loaded here via AJAX -->
            </ul>
        </div>
    </div>

    <script src="assets/js/player.js"></script>
</body>
</html>
