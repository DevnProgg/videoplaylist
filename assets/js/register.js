$(document).ready(function() {
    $('#register-btn').on('click', function(e) {
        e.preventDefault(); // Prevent default button action

        var username = $('#username').val();
        var password = $('#password').val();
        var errorMessageContainer = $('#register-error-message');

        // Clear previous error messages
        errorMessageContainer.empty().hide();

        $.ajax({
            url: '/videoplaylist/api/v1/register', // Endpoint for registration
            type: 'POST',
            dataType: 'json', // Expect a JSON response
            data: {
                username: username,
                password: password
            },
            success: function(response) {
                if (response.success) {
                    window.location.href = '/videpplaylist/';
                } else {
                    // Show error message from the backend
                    errorMessageContainer.text(response.message).show();
                }
            },
            error: function(xhr, status, error) {
                // Handle AJAX error
                var errorMsg = 'An unexpected error occurred during registration. Please try again.';
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
