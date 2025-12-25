$(document).ready(function() {
    var videoPlayer = $('#video-player');
    var playlist = $('.playlist');
    var commentSection = $('.comment-section'); // Get the comment section container

    // Function to format MySQL timestamp to human-readable time ago 
    function formatTime(timestamp) {
        // Convert MySQL timestamp (YYYY-MM-DD HH:MM:SS) to JavaScript Date object
        var date = new Date(timestamp.replace(/-/g, '/')); // Replace - with / for better browser compatibility

        var now = new Date();
        var seconds = Math.floor((now - date) / 1000);

        var interval = seconds / 31536000; // seconds in a year
        if (interval > 1) {
            return Math.floor(interval) + " years ago";
        }
        interval = seconds / 2592000; // seconds in a month
        if (interval > 1) {
            return Math.floor(interval) + " months ago";
        }
        interval = seconds / 86400; // seconds in a day
        if (interval > 1) {
            return Math.floor(interval) + " days ago";
        }
        interval = seconds / 3600; // seconds in an hour
        if (interval > 1) {
            return Math.floor(interval) + " hours ago";
        }
        interval = seconds / 60; // seconds in a minute
        if (interval > 1) {
            return Math.floor(interval) + " minutes ago";
        }
        return Math.floor(seconds) + " seconds ago";
    }

    // Function to load comments for a given video path
    function loadComments(videoPath) {
        var commentsList = commentSection.find('.comments-list');
        commentsList.empty().append('<p>Loading comments...</p>'); // Clear and show loading

        $.ajax({
            url: '/videoplaylist/api/v1/comments',
            type: 'GET',
            dataType: 'json',
            data: { video_path: videoPath },
            success: function(response) {
                commentsList.empty(); // Clear loading message

                if (response.success && response.comments.length > 0) {
                    response.comments.forEach(function(comment) {
                        var commentItem = $('<div>')
                            .addClass('comment-item')
                            .attr('data-comment-id', comment.id);

                        var commentHeader = $('<div>').addClass('comment-header');
                        commentHeader.append($('<span>').addClass('comment-username').text(comment.username));
                        commentHeader.append($('<span>').addClass('comment-timestamp').text(formatTime(comment.created_at)));
                        commentItem.append(commentHeader);

                        var commentText = $('<div>').addClass('comment-text').text(comment.comment_text);
                        commentItem.append(commentText);

                        // If comment belongs to current user: add edit/delete buttons
                        if (CURRENT_USER_ID && comment.user_id == CURRENT_USER_ID) {
                            var actions = $('<div>').addClass('comment-actions');
                            actions.append($('<button>').addClass('edit-comment-btn btn').text('Edit'));
                            actions.append($('<button>').addClass('delete-comment-btn btn').text('Delete'));
                            commentItem.append(actions);
                        }

                        commentsList.append(commentItem);
                    });
                } else {
                    commentsList.append('<p>No comments yet.</p>');
                }
            },
            error: function() {
                commentsList.empty().append('<p>Error loading comments.</p>');
            }
        });
    }

    // Function to play video, highlight item, and load comments
    window.playVideo = function(videoPath) {
        videoPlayer.attr('src', videoPath);
        videoPlayer[0].load(); // Load the new video source
        videoPlayer[0].play(); // Play the new video

        // Highlight active playlist item
        playlist.find('.playlist-item').removeClass('active');
        playlist.find('.playlist-item[data-video-path="' + videoPath + '"]').addClass('active');

        // Load comments for the selected video
        loadComments(videoPath);
    };

    //  Logout Functionality 
    $('#logout-btn').on('click', function(e) {
        e.preventDefault();

        $.ajax({
            url: '/videoplaylist/api/v1/logout',
            type: 'POST',
            dataType: 'json',
            success: function(response) {
                if (response.success) {
                    window.location.href = 'login.html';
                } else {
                    alert('Logout failed: ' + response.message);
                }
            },
            error: function(xhr, status, error) {
                alert('An error occurred during logout.');
                console.error("AJAX Error:", status, error, xhr.responseText);
            }
        });
    });

    // Playlist Functionality
    // Fetch videos and populate playlist
    $.ajax({
        url: '/videoplaylist/api/v1/videos',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success && response.videos.length > 0) {
                response.details.forEach(function(video) {
                    var listItem = $('<li>')
                        .addClass('playlist-item')
                        .data('video-path', video.path)
                        .text(video.name);
                    playlist.append(listItem);
                });

                // Set first video in playlist as default and play it
                if (response.details.length > 0) {
                    var firstVideoPath = response.details[0].path;
                    playVideo(firstVideoPath); // Call the new function to play, highlight, and load comments
                }
            } else {
                playlist.append($('<li>').text(response.message || 'No videos found.'));
            }
        },
        error: function(xhr, status, error) {
            playlist.append($('<li>').text('Error loading videos.'));
            console.error("AJAX Error:", status, error, xhr.responseText);
        }
    });

    // Handle click on playlist items using the new playVideo function
    playlist.on('click', '.playlist-item', function() {
        var videoPath = $(this).data('video-path');
        playVideo(videoPath);
    });

    // Autoplay next video in playlist
    videoPlayer.on('ended', function() {
        var currentActiveItem = playlist.find('.playlist-item.active');
        var nextItem = currentActiveItem.next('.playlist-item');

        if (nextItem.length) {
            var nextVideoPath = nextItem.data('video-path');
            playVideo(nextVideoPath);
        } else {
            // Optionally, loop back to the first video or show a message
            // For now, it will just stop as per the requirement.
            console.log('End of playlist.');
        }
    });

    //Comment Submission Functionality
    $('#submit-comment').on('click', function() {
        var commentText = $('#comment-text').val();
        var videoPath = videoPlayer.attr('src'); // Get current video path from the player

        if (!commentText.trim()) {
            alert('Comment cannot be empty.');
            return;
        }

        if (commentText.length > 500) {
            alert('Comment cannot exceed 500 characters.');
            return;
        }

        $.ajax({
            url: '/videoplaylist/api/v1/comment/add',
            type: 'POST',
            dataType: 'json',
            data: {
                video_path: videoPath,
                comment_text: commentText
            },
            success: function(response) {
                if (response.success) {
                    $('#comment-text').val(''); // Clear textarea
                    $('.char-count').text('0/500'); // Reset character counter
                    loadComments(videoPath); // Reload comments for the current video
                } else {
                    alert('Error adding comment: ' + (response.message || 'Unknown error.'));
                }
            },
            error: function(xhr, status, error) {
                alert('An error occurred while adding comment.');
                console.error("AJAX Error:", status, error, xhr.responseText);
            }
        });
    });

    // Character Counter for Comment Textarea
    $('#comment-text').on('input', function() {
        var currentLength = $(this).val().length;
        var maxLength = 500;
        var charCountSpan = $('.char-count');
        var submitButton = $('#submit-comment');

        charCountSpan.text(currentLength + '/' + maxLength);

        if (currentLength > maxLength) {
            charCountSpan.css('color', 'red');
            submitButton.prop('disabled', true);
        } else {
            charCountSpan.css('color', ''); // Reset to default color
            submitButton.prop('disabled', false);
        }
    });

    // Edit Comment Functionality (Event Delegation)
    $(document).on('click', '.edit-comment-btn', function() {
        var $commentItem = $(this).closest('.comment-item');
        var commentId = $commentItem.data('comment-id');
        var $commentTextDiv = $commentItem.find('.comment-text');
        var currentCommentText = $commentTextDiv.text();
        var videoPath = videoPlayer.attr('src'); // Get current video path

        // Replace comment text with textarea for editing
        var $textarea = $('<textarea>')
                            .addClass('edit-comment-textarea')
                            .val(currentCommentText)
                            .attr('maxlength', 500);
        $commentTextDiv.replaceWith($textarea);

        // Replace edit/delete buttons with save/cancel
        var $actions = $(this).closest('.comment-actions');
        $actions.empty();
        $actions.append($('<button>').addClass('save-comment-btn btn').text('Save'));
        $actions.append($('<button>').addClass('cancel-edit-btn btn').text('Cancel'));

        // Focus on the textarea
        $textarea.focus();

        // Handle Save
        $(document).one('click', '.save-comment-btn', function() {
            var newCommentText = $textarea.val();
            if (!newCommentText.trim()) {
                alert('Comment cannot be empty.');
                loadComments(videoPath); // Reload to revert if empty
                return;
            }
            if (newCommentText.length > 500) {
                alert('Comment cannot exceed 500 characters.');
                loadComments(videoPath); // Reload to revert if too long
                return;
            }

            $.ajax({
                url: '/videoplaylist/api/v1/comment/update',
                type: 'POST',
                dataType: 'json',
                data: {
                    comment_id: commentId,
                    comment_text: newCommentText
                },
                success: function(response) {
                    if (response.success) {
                        loadComments(videoPath); // Reload comments to show updated text
                    } else {
                        alert('Error updating comment: ' + (response.message || 'Unknown error.'));
                        loadComments(videoPath); // Reload to revert changes on error
                    }
                },
                error: function(xhr, status, error) {
                    alert('An error occurred while updating comment.');
                    console.error("AJAX Error:", status, error, xhr.responseText);
                    loadComments(videoPath); // Reload to revert changes on error
                }
            });
        });

        // Handle Cancel
        $(document).one('click', '.cancel-edit-btn', function() {
            loadComments(videoPath); // Reload comments to revert changes
        });
    });

    //  Delete Comment Functionality (Event Delegation) 
    $(document).on('click', '.delete-comment-btn', function() {
        var $commentItem = $(this).closest('.comment-item');
        var commentId = $commentItem.data('comment-id');
        var videoPath = videoPlayer.attr('src'); // Get current video path

        if (confirm('Are you sure you want to delete this comment?')) {
            $.ajax({
                url: '/videoplaylist/api/v1/comment/delete',
                type: 'POST',
                dataType: 'json',
                data: {
                    comment_id: commentId
                },
                success: function(response) {
                    if (response.success) {
                        loadComments(videoPath); // Reload comments to show updated list
                    } else {
                        alert('Error deleting comment: ' + (response.message || 'Unknown error.'));
                    }
                },
                error: function(xhr, status, error) {
                    alert('An error occurred while deleting comment.');
                    console.error("AJAX Error:", status, error, xhr.responseText);
                }
            });
        }
    });

    //  Session Check Functionality (every 5 minutes)
    setInterval(function() {
        $.ajax({
            url: '/videoplaylist/api/v1/check_session',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (!response.logged_in) {
                    alert('Your session has expired. Please log in again.');
                    window.location.href = 'index.php'; // Redirect to login page
                }
                // If logged in, nothing to do, just continue.
            },
            error: function(xhr, status, error) {
                console.error("Session check AJAX Error:", status, error, xhr.responseText);
                //redirect to login here as well if session check API is unreachable
                window.location.href = '/videoplaylist/auth/';
            }
        });
    }, 300000); // 300000 milliseconds = 5 minutes
});




