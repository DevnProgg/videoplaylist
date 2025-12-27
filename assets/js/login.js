$(document).ready(function() {
    $('#login-btn').on('click', function(e) {
        e.preventDefault();

        var username = $('#username').val();
        var password = $('#password').val();
        var errorMessageContainer = $('#login-error-message');

        errorMessageContainer.empty().hide();

        $.ajax({
            url: '/videoplaylist/api/v1/login',
            type: 'POST',
            dataType: 'json',
            data: {
                username: username,
                password: password
            },
            success: function(response) {
                if (response.success) {
                    // If login is successful, redirect to the main page.
                    window.location.href = '/videoplaylist/';
                } else {
                    // If the API suggests signing up, ask the user if they want to.
                    if (response.suggest_signup) {
                        if (confirm(response.message)) {
                            window.location.href = '/videoplaylist/aut/register'; 
                        } else {
                            errorMessageContainer.text('Please try logging in again, or consider signing up.').show();
                        }
                    } else {
                        errorMessageContainer.text(response.message).show();
                    }
                }
            },
            error: function(xhr, status, error) {
                var errorMsg = 'An unexpected error occurred. Please try again.';
                var jsonResponse = null;
                try {
                    jsonResponse = JSON.parse(xhr.responseText);
                } catch (e) {
                    // Not valid JSON.
                }

                if (jsonResponse && jsonResponse.suggest_signup) {
                    if (confirm(jsonResponse.message)) {
                        window.location.href = '/videoplaylist/auth/register';
                    } else {
                        errorMessageContainer.text('Please try logging in again, or consider signing up.').show();
                    }
                } else if (jsonResponse && jsonResponse.message) {
                    errorMsg = jsonResponse.message;
                    errorMessageContainer.text(errorMsg).show();
                } else {
                    errorMessageContainer.text(errorMsg).show();
                }
                console.error("AJAX Error:", status, error, xhr.responseText);
            }
        });
    });
});
