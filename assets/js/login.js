$(document).ready(function() {
    $('#login-btn').on('click', function(e) {
        e.preventDefault(); // Prevent default button action

        var username = $('#username').val();
        var password = $('#password').val();
        var errorMessageContainer = $('#login-error-message');

        // Clear previous error messages
        errorMessageContainer.empty().hide();

        $.ajax({
            url: '/videoplaylist/api/v1/login',
            type: 'POST',
            dataType: 'json', // Expect a JSON response
            data: {
                username: username,
                password: password
            },
            success: function(response) {
                if (response.success) {
                    // Redirect on successful login
                    window.location.href = '/videoplaylist/'; // Assuming player.php is the correct redirect
                } else {
                    if (response.suggest_signup) {
                        if (confirm(response.message)) {
                            // User chose to sign up
                            window.location.href = '/videoplaylist/aut/register'; 
                        } else {
                            // User chose not to sign up, just show the message as if they clicked cancel
                            errorMessageContainer.text('Please try logging in again, or consider signing up.').show();
                        }
                    } else {
                        // Show regular error message from the backend
                        errorMessageContainer.text(response.message).show();
                    }
                }
            },
            error: function(xhr, status, error) {
                // Handle AJAX error
                var errorMsg = 'An unexpected error occurred. Please try again.';
                // Try to parse the response even on error to check for suggest_signup
                var jsonResponse = null;
                try {
                    jsonResponse = JSON.parse(xhr.responseText);
                } catch (e) {
                    // Not valid JSON, fall through to generic error
                }

                if (jsonResponse && jsonResponse.suggest_signup) {
                    if (confirm(jsonResponse.message)) {
                        window.location.href = '/videoplaylist/auth/register'; // Redirect to registration page
                    } else {
                        errorMessageContainer.text('Please try logging in again, or consider signing up.').show();
                    }
                } else if (jsonResponse && jsonResponse.message) {
                    errorMsg = jsonResponse.message;
                    errorMessageContainer.text(errorMsg).show();
                } else {
                    // Fallback to generic message if responseText is not valid JSON or doesn't have a message
                    errorMessageContainer.text(errorMsg).show();
                }
                console.error("AJAX Error:", status, error, xhr.responseText);
            }
        });
    });
});
