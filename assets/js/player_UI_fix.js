// Video Player Enhanced JavaScript

$(document).ready(function() {
    let currentVideoId = null;
    let commentCount = 0;

    // Load username
    loadUsername();
    
    // Load playlist
    loadPlaylist();
    
    // Character counter for comment textarea
    $('#comment-text').on('input', function() {
        const length = $(this).val().length;
        $('#char-count').text(length + '/1000');
    });

    // Submit comment
    $('#submit-comment').on('click', function() {
        submitComment();
    });

    // Allow Enter key to submit (Shift+Enter for new line)
    $('#comment-text').on('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitComment();
        }
    });

    // Logout button
    $('#logout-btn').on('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = 'auth/logout.php';
        }
    });

    // Load username
    function loadUsername() {
        $.ajax({
            url: 'api/get-user.php',
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    $('.username').text('Welcome, ' + response.username + '!');
                }
            },
            error: function() {
                $('.username').text('Guest');
            }
        });
    }

    // Load playlist
    function loadPlaylist() {
        $.ajax({
            url: 'api/get-playlist.php',
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                if (response.success && response.videos.length > 0) {
                    displayPlaylist(response.videos);
                } else {
                    $('#playlist').html('<li style="padding: 1rem; text-align: center; color: rgba(255, 255, 255, 0.5);">No videos available</li>');
                }
            },
            error: function() {
                $('#playlist').html('<li style="padding: 1rem; text-align: center; color: rgba(255, 255, 255, 0.5);">Error loading playlist</li>');
            }
        });
    }

    // Display playlist
    function displayPlaylist(videos) {
        let html = '';
        videos.forEach(function(video) {
            html += `
                <li class="playlist-item" data-video-id="${video.id}" data-video-path="${video.path}">
                    ${video.name}
                </li>
            `;
        });
        $('#playlist').html(html);

        // Click handler for playlist items
        $('.playlist-item').on('click', function() {
            const videoId = $(this).data('video-id');
            const videoPath = $(this).data('video-path');
            const videoName = $(this).text().trim();
            
            playVideo(videoId, videoPath, videoName);
            
            // Update active state
            $('.playlist-item').removeClass('active');
            $(this).addClass('active');
        });
    }

    // Play video
    function playVideo(videoId, videoPath, videoName) {
        currentVideoId = videoId;
        const videoPlayer = $('#video-player')[0];
        
        videoPlayer.src = videoPath;
        videoPlayer.play();
        
        // Show and update video info
        $('#video-info').show();
        $('#video-message').text('Now playing: ' + videoName);
        
        // Load comments for this video
        loadComments(videoId);
    }

    // Load comments
    function loadComments(videoId) {
        if (!videoId) {
            $('#comments-list').html('<div class="no-comments">Select a video to view comments</div>');
            updateCommentCount(0);
            return;
        }

        $('#comments-list').html(`
            <div class="loading-comments">
                <div class="spinner"></div>
                <p>Loading comments...</p>
            </div>
        `);

        $.ajax({
            url: 'api/get-comments.php',
            method: 'GET',
            data: { video_id: videoId },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    displayComments(response.comments);
                    updateCommentCount(response.comments.length);
                } else {
                    $('#comments-list').html('<div class="no-comments">No comments yet. Be the first to comment!</div>');
                    updateCommentCount(0);
                }
            },
            error: function() {
                $('#comments-list').html('<div class="no-comments" style="color: #ef4444;">Error loading comments</div>');
                updateCommentCount(0);
            }
        });
    }

    // Display comments
    function displayComments(comments) {
        if (comments.length === 0) {
            $('#comments-list').html('<div class="no-comments">No comments yet. Be the first to comment!</div>');
            return;
        }

        let html = '';
        comments.forEach(function(comment) {
            html += `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${escapeHtml(comment.username)}</span>
                        <span class="comment-time">${formatTime(comment.created_at)}</span>
                    </div>
                    <div class="comment-text">${escapeHtml(comment.comment_text)}</div>
                </div>
            `;
        });
        $('#comments-list').html(html);
    }

    // Update comment count
    function updateCommentCount(count) {
        commentCount = count;
        $('#comment-count').text('(' + count + ')');
    }

    // Submit comment
    function submitComment() {
        if (!currentVideoId) {
            alert('Please select a video first');
            return;
        }

        const commentText = $('#comment-text').val().trim();
        
        if (commentText === '') {
            alert('Please enter a comment');
            return;
        }

        const $btn = $('#submit-comment');
        $btn.prop('disabled', true).text('Posting...');

        $.ajax({
            url: 'api/add-comment.php',
            method: 'POST',
            data: {
                video_id: currentVideoId,
                comment_text: commentText
            },
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    $('#comment-text').val('');
                    $('#char-count').text('0/1000');
                    loadComments(currentVideoId);
                    
                    // Show success feedback
                    showNotification('Comment posted successfully!', 'success');
                } else {
                    alert(response.message || 'Error posting comment');
                }
            },
            error: function() {
                alert('Error posting comment. Please try again.');
            },
            complete: function() {
                $btn.prop('disabled', false).text('Post Comment');
            }
        });
    }

    // Show notification
    function showNotification(message, type) {
        const notification = $(`
            <div class="notification notification-${type}">
                ${message}
            </div>
        `);
        
        $('body').append(notification);
        
        setTimeout(function() {
            notification.addClass('show');
        }, 10);
        
        setTimeout(function() {
            notification.removeClass('show');
            setTimeout(function() {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Escape HTML
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }

    // Format time
    function formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // difference in seconds

        if (diff < 60) {
            return 'Just now';
        } else if (diff < 3600) {
            const minutes = Math.floor(diff / 60);
            return minutes + ' minute' + (minutes > 1 ? 's' : '') + ' ago';
        } else if (diff < 86400) {
            const hours = Math.floor(diff / 3600);
            return hours + ' hour' + (hours > 1 ? 's' : '') + ' ago';
        } else if (diff < 604800) {
            const days = Math.floor(diff / 86400);
            return days + ' day' + (days > 1 ? 's' : '') + ' ago';
        } else {
            return date.toLocaleDateString();
        }
    }

    // Initial state - show message to select video
    $('#video-info').show();
    $('#video-message').text('Select a video to play');
    $('#comments-list').html('<div class="no-comments">Select a video to view comments</div>');
    updateCommentCount(0);
});