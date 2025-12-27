<?php

declare(strict_types=1);

// Responsible for handling URL routing.
require "Router.php";

// Grab the URI and breaks it down so it's usable.
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

// Create a new Router instance.
$router = new Router;

// --- Web Page Routes ---

// The main video player page.
$router->add("/videoplaylist/", function() {
    require_once "./pages/player.php";
});

// The user login page.
$router->add("/videoplaylist/auth/login", function() {
    require_once "./pages/login.html";
});

// The user registration page.
$router->add("/videoplaylist/auth/register", function() {
    require_once "./pages/register.html";
});

// --- API Endpoints (v1) ---

// For user login.
$router->add("/videoplaylist/api/v1/login", function() {
    require_once "./api/login.php";
});

// For user logout.
$router->add("/videoplaylist/api/v1/logout", function() {
    require_once "./api/logout.php";
});

// For user registration.
$router->add("/videoplaylist/api/v1/register", function() {
    require_once "./api/register.php";
});

// Retrieves video data.
$router->add("/videoplaylist/api/v1/videos", function() {
    require_once "./api/get_videos.php";
});

// Retrieves comments.
$router->add("/videoplaylist/api/v1/comments", function() {
    require_once "./api/get_comments.php";
});

// Adds a new comment.
$router->add("/videoplaylist/api/v1/comment/add", function() {
    require_once "./api/add_comment.php";
});

// Deletes a comment.
$router->add("/videoplaylist/api/v1/comment/delete", function() {
    require_once "./api/delete_comment.php";
});

// Updates a comment.
$router->add("/videoplaylist/api/v1/comment/update", function() {
    require_once "./api/update_comment.php";
});

// Checks the current user session.
$router->add("/videoplaylist/api/v1/check_session", function() {
    require_once "./api/check_session.php";
});

// Dispatch the request to the appropriate handler.
$router->dispatch($path);