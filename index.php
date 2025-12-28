<?php

declare(strict_types=1);

// Responsible for handling URL routing.
require "Router.php";

// Grab the URI and break it down so it's usable.
$path = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

// Create a new Router instance.
$router = new Router;

// Web Page Routes


$router->add("/videoplaylist/", function() {
    require_once "./pages/player.php";
});


$router->add("/videoplaylist/auth/login", function() {
    require_once "./pages/login.html";
});

$router->add("/videoplaylist/auth/register", function() {
    require_once "./pages/register.html";
});

// API Endpoints (v1)


$router->add("/videoplaylist/api/v1/login", function() {
    require_once "./api/login.php";
}); 

$router->add("/videoplaylist/api/v1/logout", function() {
    require_once "./api/logout.php";
});


$router->add("/videoplaylist/api/v1/register", function() {
    require_once "./api/register.php";
});


$router->add("/videoplaylist/api/v1/videos", function() {
    require_once "./api/get_videos.php";
});


$router->add("/videoplaylist/api/v1/comments", function() {
    require_once "./api/get_comments.php";
});


$router->add("/videoplaylist/api/v1/comment/add", function() {
    require_once "./api/add_comment.php";
});


$router->add("/videoplaylist/api/v1/comment/delete", function() {
    require_once "./api/delete_comment.php";
});


$router->add("/videoplaylist/api/v1/comment/update", function() {
    require_once "./api/update_comment.php";
});


$router->add("/videoplaylist/api/v1/comment/like", function() {
    require_once "./api/toggle_like.php";
});


$router->add("/videoplaylist/api/v1/comment/reply/add", function() {
    require_once "./api/add_reply.php";
});


$router->add("/videoplaylist/api/v1/comment/replies", function() {
    require_once "./api/get_replies.php";
});


$router->add("/videoplaylist/api/v1/check_session", function() {
    require_once "./api/check_session.php";
});

// Dispatch the request to the appropriate handler.
$router->dispatch($path);