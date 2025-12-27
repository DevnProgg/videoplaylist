<?php

declare(strict_types=1);

// A simple router.
class Router
{
    private array $routes = [];

    // Adds a new route.
    public function add(string $path, Closure $handler): void
    {
        $this->routes[$path] = $handler;
    }

    // Dispatches the request to the correct handler.
    public function dispatch(string $path): void
    {
        foreach ($this->routes as $route => $handler) {

            $pattern = preg_replace("#\{\w+\}#", "([^\/]+)", $route);

            if (preg_match("#^$pattern$#", $path, $matches)) {

                array_shift($matches);

                call_user_func_array($handler, $matches);

                return;

            }
        }

        // Handle 404s
        http_response_code(404);
        echo "Page not found";
    }
}