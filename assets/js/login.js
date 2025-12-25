$(document).ready(function() {
    $('#login-btn').on('click', function(e) {
        e.preventDefault(); // Prevent default button action

        var username = $('#username').val();
        var password = $('#password').val();
        var errorMessageContainer = $('#login-error-message');

        // Clear previous error messages
        errorMessageContainer.empty().hide();

        $.ajax({
            url: 'api/login.php',
            type: 'POST',
            dataType: 'json', // Expect a JSON response
            data: {
                username: username,
                password: password
            },
            success: function(response) {
                if (response.success) {
                    // Redirect on successful login
                    window.location.href = 'player.php';
                } else {
                    // Show error message from the backend
                    errorMessageContainer.text(response.message).show();
                }
            },
            error: function(xhr, status, error) {
                // Handle AJAX error (e.g., network issues, server errors)
                var errorMsg = 'An unexpected error occurred. Please try again.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMsg = xhr.responseJSON.message;
                } else if (xhr.responseText) {
                    try {
                        var jsonResponse = JSON.parse(xhr.responseText);
                        if (jsonResponse.message) {
                            errorMsg = jsonResponse.message;
                        }
                    } catch (e) {
                        // Fallback to generic message if responseText is not valid JSON
                    }
                }
                errorMessageContainer.text(errorMsg).show();
                console.error("AJAX Error:", status, error, xhr.responseText);
            }
        });
    });
});
