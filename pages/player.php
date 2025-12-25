<?php
session_start();

if (!isset($_SESSION['user_id'])) {
    header('Location: /videoplaylist/auth/');
    exit();
}

$username = $_SESSION['username'] ?? 'Guest';
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
        const CURRENT_USER_ID = <?php echo json_encode($_SESSION['user_id'] ?? null); ?>;
    </script>
</head>
<body>
    <header class="glass-header">
        <div class="header-content">
            <h1>Video Player</h1>
            <div class="user-actions">
                <span class="username"><?php echo htmlspecialchars($username); ?></span>
                <button id="logout-btn" class="btn logout-btn">Logout</button>
            </div>
        </div>
    </header>

    <div class="container">
        <div class="main-content">
            <div class="video-wrapper">
                <video id="video-player" controls></video>
            </div>
            
            <div class="video-info" id="video-info" style="display: none;">
                <p id="video-message">Select a video to play</p>
            </div>

            <div class="comment-section">
                <h2>
                    <span class="comment-icon">💬</span>
                    <span>Comments</span>
                    <span class="comment-count" id="comment-count">(0)</span>
                </h2>
                
                <div class="comment-form-container">
                    <textarea 
                        id="comment-text" 
                        maxlength="1000" 
                        placeholder="Share your thoughts..."
                        rows="4"></textarea>
                    <div class="comment-form-footer">
                        <span class="char-count" id="char-count">0/1000</span>
                        <button id="submit-comment" class="btn comment-btn">Post Comment</button>
                    </div>
                </div>
                
                <div class="comments-list" id="comments-list">
                    <div class="loading-comments">
                        <div class="spinner"></div>
                        <p>Loading comments...</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="sidebar">
            <div class="playlist-container">
                <h2>
                    <span class="playlist-icon">{}</span>
                    <span>Playlist</span>
                </h2>
                <ul class="playlist" id="playlist">
                    <!-- Playlist items will be loaded here via AJAX -->
                </ul>
            </div>
        </div>
    </div>

    <script src="assets/js/player.js"></script>
</body>
</html>