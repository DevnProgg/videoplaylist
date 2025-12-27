$(document).ready(function() {
    var videoPlayer = $('#video-player');
    var playlist = $('.playlist');
    var commentSection = $('.comment-section');

    // A quick and dirty HTML escaper.
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

    // Shows a notification message.
    function showNotification(message, type) {
        const notification = $(`
            <div class="notification notification-${type}">
                ${escapeHtml(message)}
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

    // Formats a MySQL timestamp into a human-readable "time ago" string.
    function formatTime(timestamp) {
        var date = new Date(timestamp.replace(/-/g, '/'));
        var now = new Date();
        var seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) {
            return 'Just now';
        }
        
        var interval = seconds / 31536000;
        if (interval > 1) {
            const years = Math.floor(interval);
            return years + " year" + (years > 1 ? "s" : "") + " ago";
        }
        interval = seconds / 2592000;
        if (interval > 1) {
            const months = Math.floor(interval);
            return months + " month" + (months > 1 ? "s" : "") + " ago";
        }
        interval = seconds / 86400;
        if (interval > 1) {
            const days = Math.floor(interval);
            return days + " day" + (days > 1 ? "s" : "") + " ago";
        }
        interval = seconds / 3600;
        if (interval > 1) {
            const hours = Math.floor(interval);
            return hours + " hour" + (hours > 1 ? "s" : "") + " ago";
        }
        interval = seconds / 60;
        if (interval > 1) {
            const minutes = Math.floor(interval);
            return minutes + " minute" + (minutes > 1 ? "s" : "") + " ago";
        }
        return Math.floor(seconds) + " seconds ago";
    }

    function updateCommentCount(count) {
        $('#comment-count').text('(' + count + ')');
    }

    // Loads the comments for a given video.
    function loadComments(videoPath) {
        var commentsList = commentSection.find('.comments-list');
        commentsList.empty().html(`
            <div class="loading-comments">
                <div class="spinner"></div>
                <p>Loading comments...</p>
            </div>
        `);

        $.ajax({
            url: '/videoplaylist/api/v1/comments', 
            type: 'GET',
            dataType: 'json',
            data: { video_path: videoPath },
            success: function(response) {
                commentsList.empty();

                if (response.success && response.comments.length > 0) {
                    updateCommentCount(response.comments.length);
                    
                    response.comments.forEach(function(comment) {
                        var commentItem = $('<div>')
                            .addClass('comment-item')
                            .attr('data-comment-id', comment.id);

                        var commentHeader = $('<div>').addClass('comment-header');
                        commentHeader.append($('<span>').addClass('comment-username').text(comment.username));
                        commentHeader.append($('<span>').addClass('comment-timestamp').text(formatTime(comment.created_at)));
                        
                        // If the comment belongs to the current user, show the options button.
                        if (CURRENT_USER_ID && comment.user_id == CURRENT_USER_ID) {
                            var optionsContainer = $('<div>').addClass('comment-options-container');
                            var optionsToggle = $('<i>').addClass('fas fa-ellipsis-v comment-options-toggle');
                            
                            var optionsMenu = $('<div>').addClass('comment-options-menu').hide();
                            optionsMenu.append($('<span>').addClass('edit-comment-btn').text('Edit'));
                            optionsMenu.append($('<span>').addClass('delete-comment-btn').text('Delete'));

                            optionsContainer.append(optionsToggle);
                            optionsContainer.append(optionsMenu);
                            commentHeader.append(optionsContainer);
                        }
                        
                        commentItem.append(commentHeader);

                        var commentText = $('<div>').addClass('comment-text').text(comment.comment_text);
                        commentItem.append(commentText);

                        commentsList.append(commentItem);
                    });
                } else {
                    updateCommentCount(0);
                    commentsList.html('<div class="no-comments">No comments yet. Be the first to comment!</div>');
                }
            },
            error: function() {
                updateCommentCount(0);
                commentsList.html('<div class="no-comments" style="color: #ef4444;">Error loading comments</div>');
            }
        });
    }

    // Plays a video, highlights it in the playlist, and loads the comments.
    window.playVideo = function(videoPath, videoName) {
        videoPlayer.attr('src', videoPath);
        videoPlayer[0].load();
        videoPlayer[0].play();

        playlist.find('.playlist-item').removeClass('active');
        playlist.find('.playlist-item[data-video-path="' + videoPath + '"]').addClass('active');

        $('#video-info').show();
        $('#video-message').text('Now playing: ' + (videoName || videoPath.split('/').pop()));

        loadComments(videoPath);
    };

    // Logout button.
    $('#logout-btn').on('click', function(e) {
        e.preventDefault();

        if (confirm('Are you sure you want to logout?')) {
            $.ajax({
                url: '/videoplaylist/api/v1/logout',
                type: 'POST',
                dataType: 'json',
                success: function(response) {
                    if (response.success) {
                        window.location.href = '/videoplaylist/auth/login';
                    } else {
                        alert('Logout failed: ' + response.message);
                    }
                },
                error: function(xhr, status, error) {
                    alert('An error occurred during logout.');
                    console.error("AJAX Error:", status, error, xhr.responseText);
                }
            });
        }
    });

    // Fetch the playlist.
    $.ajax({
        url: '/videoplaylist/api/v1/videos',
        type: 'GET',
        dataType: 'json',
        success: function(response) {
            if (response.success && response.videos.length > 0) {
                response.details.forEach(function(video) {
                    var listItem = $('<li>')
                        .addClass('playlist-item')
                        .attr('data-video-path', video.path)
                        .attr('data-video-name', video.name)
                        .text(video.name);
                    playlist.append(listItem);
                });

                if (response.details.length > 0) {
                    var firstVideoPath = response.details[0].path;
                    var firstVideoName = response.details[0].name;
                    playVideo(firstVideoPath, firstVideoName);
                }
            } else {
                playlist.html('<li style="padding: 1rem; text-align: center; color: rgba(255, 255, 255, 0.5);">' + 
                    (response.message || 'No videos available') + '</li>');
            }
        },
        error: function(xhr, status, error) {
            playlist.html('<li style="padding: 1rem; text-align: center; color: rgba(255, 255, 255, 0.5);">Error loading playlist</li>');
            console.error("AJAX Error:", status, error, xhr.responseText);
        }
    });

    // Click on a playlist item.
    playlist.on('click', '.playlist-item', function() {
        var videoPath = $(this).attr('data-video-path');
        var videoName = $(this).attr('data-video-name');
        playVideo(videoPath, videoName);
    });

    // Autoplay the next video.
    videoPlayer.on('ended', function() {
        var currentActiveItem = playlist.find('.playlist-item.active');
        var nextItem = currentActiveItem.next('.playlist-item');

        if (nextItem.length) {
            var nextVideoPath = nextItem.attr('data-video-path');
            var nextVideoName = nextItem.attr('data-video-name');
            playVideo(nextVideoPath, nextVideoName);
        } else {
            console.log('End of playlist.');
        }
    });

    // Submit a comment.
    $('#submit-comment').on('click', function() {
        var commentText = $('#comment-text').val();
        var videoPath = videoPlayer.attr('src');

        if (!videoPath) {
            alert('Please select a video first');
            return;
        }

        if (!commentText.trim()) {
            alert('Comment cannot be empty.');
            return;
        }

        if (commentText.length > 500) {
            alert('Comment cannot exceed 500 characters.');
            return;
        }

        var $btn = $(this);
        $btn.prop('disabled', true).text('Posting...');

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
                    $('#comment-text').val('');
                    $('#char-count').text('0/500');
                    loadComments(videoPath);
                    showNotification('Comment posted successfully!', 'success');
                } else {
                    alert('Error adding comment: ' + (response.message || 'Unknown error.'));
                }
            },
            error: function(xhr, status, error) {
                alert('An error occurred while adding comment.');
                console.error("AJAX Error:", status, error, xhr.responseText);
            },
            complete: function() {
                $btn.prop('disabled', false).text('Post Comment');
            }
        });
    });

    // Use Enter to submit, but Shift+Enter for a new line.
    $('#comment-text').on('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            $('#submit-comment').click();
        }
    });

    // Character counter for the comment textarea.
    $('#comment-text').on('input', function() {
        var currentLength = $(this).val().length;
        var maxLength = 500;
        var charCountSpan = $('#char-count');
        var submitButton = $('#submit-comment');

        charCountSpan.text(currentLength + '/' + maxLength);

        if (currentLength > maxLength) {
            charCountSpan.css('color', 'red');
            submitButton.prop('disabled', true);
        } else {
            charCountSpan.css('color', '');
            submitButton.prop('disabled', false);
        }
    });

    // Toggle the comment options menu.
    $(document).on('click', '.comment-options-toggle', function(e) {
        e.stopPropagation();
        
        $('.comment-options-menu').not($(this).siblings('.comment-options-menu')).hide();
        
        var $menu = $(this).siblings('.comment-options-menu');
        $menu.toggle();
    });

    // Close the menu when clicking anywhere else.
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.comment-options-container').length) {
            $('.comment-options-menu').hide();
        }
    });

    // Edit a comment.
    $(document).on('click', '.edit-comment-btn', function() {
        var $commentItem = $(this).closest('.comment-item');
        var commentId = $commentItem.data('comment-id');
        var $commentTextDiv = $commentItem.find('.comment-text');
        var currentCommentText = $commentTextDiv.text();
        var videoPath = videoPlayer.attr('src');

        $(this).closest('.comment-options-menu').hide();

        var $textarea = $('<textarea>')
            .addClass('edit-comment-textarea')
            .val(currentCommentText)
            .attr('maxlength', 500);
        $commentTextDiv.replaceWith($textarea);

        var $editActions = $('<div>').addClass('edit-comment-actions');
        $editActions.append($('<button>').addClass('save-comment-btn btn').text('Save'));
        $editActions.append($('<button>').addClass('cancel-edit-btn btn').text('Cancel'));
        $commentItem.append($editActions);

        $commentItem.find('.comment-options-container').hide();

        $textarea.focus();
    });

    // Save an edited comment.
    $(document).on('click', '.save-comment-btn', function() {
        var $commentItem = $(this).closest('.comment-item');
        var commentId = $commentItem.data('comment-id');
        var $textarea = $commentItem.find('.edit-comment-textarea');
        var newCommentText = $textarea.val();
        var videoPath = videoPlayer.attr('src');

        if (!newCommentText.trim()) {
            alert('Comment cannot be empty.');
            return;
        }

        if (newCommentText.length > 500) {
            alert('Comment cannot exceed 500 characters.');
            return;
        }

        var $btn = $(this);
        $btn.prop('disabled', true).text('Saving...');

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
                    loadComments(videoPath);
                    showNotification('Comment updated successfully!', 'success');
                } else {
                    alert('Error updating comment: ' + (response.message || 'Unknown error.'));
                    $btn.prop('disabled', false).text('Save');
                }
            },
            error: function(xhr, status, error) {
                alert('An error occurred while updating comment.');
                console.error("AJAX Error:", status, error, xhr.responseText);
                $btn.prop('disabled', false).text('Save');
            }
        });
    });

    // Cancel an edit.
    $(document).on('click', '.cancel-edit-btn', function() {
        var videoPath = videoPlayer.attr('src');
        loadComments(videoPath);
    });

    // Delete a comment.
    $(document).on('click', '.delete-comment-btn', function() {
        var $commentItem = $(this).closest('.comment-item');
        var commentId = $commentItem.data('comment-id');
        var videoPath = videoPlayer.attr('src');

        $(this).closest('.comment-options-menu').hide();

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
                        loadComments(videoPath);
                        showNotification('Comment deleted successfully!', 'success');
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

    // Check the session every 5 minutes to make sure the user is still logged in.
    setInterval(function() {
        $.ajax({
            url: '/videoplaylist/api/v1/check_session',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                if (!response.logged_in) {
                    alert('Your session has expired. Please log in again.');
                    window.location.href = 'index.php';
                }
            },
            error: function(xhr, status, error) {
                console.error("Session check AJAX Error:", status, error, xhr.responseText);
                window.location.href = '/videoplaylist/auth/';
            }
        });
    }, 300000);

    // Set the initial state of the page.
    $('#video-info').show();
    $('#video-message').text('Select a video to play');
    $('#comments-list').html('<div class="no-comments">Select a video to view comments</div>');
    updateCommentCount(0);
});