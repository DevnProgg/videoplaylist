$(document).ready(function() {
    $('#register-btn').on('click', function(e) {
        e.preventDefault();

        var username = $('#username').val();
        var password = $('#password').val();
        var errorMessageContainer = $('#register-error-message');

        errorMessageContainer.empty().hide();

        $.ajax({
            url: '/videoplaylist/api/v1/register',
            type: 'POST',
            dataType: 'json',
            data: {
                username: username,
                password: password
            },
            success: function(response) {
                if (response.success) {
                    window.location.href = '/videoplaylist/';
                } else {
                    errorMessageContainer.text(response.message).show();
                }
            },
            error: function(xhr, status, error) {
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
                        // Not valid JSON.
                    }
                }
                errorMessageContainer.text(errorMsg).show();
                console.error("AJAX Error:", status, error, xhr.responseText);
            }
        });
    });
});
