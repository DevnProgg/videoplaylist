# Video Playlist with Commenting Feature

This project implements a basic video playlist application with a core focus on demonstrating a functional video commenting system. Users can watch videos from a playlist, and more importantly, they can add, view, edit, and delete comments associated with each video.

## Core Feature: Video Commenting System

The primary objective of this project was to build a robust video commenting feature. This includes:
-   **Adding Comments:** Users can post new comments on any video.
-   **Viewing Comments:** Comments are displayed dynamically for each video, showing the commenter's username and the time of posting.
-   **Editing Comments:** Authenticated users can edit their own previously posted comments.
-   **Deleting Comments:** Authenticated users can delete their own comments.
-   **User Association:** Each comment is linked to a logged-in user.

## Design Decisions and Production Readiness

This project was developed with a primary focus on rapidly implementing the video commenting functionality. As such, certain architectural and design decisions were made for speed of development rather than for optimal production scalability, maintainability, or security best practices in a large-scale application.

### Current Design Choices (for rapid development):

1.  **Custom Routing (`Router.php`):** A lightweight, custom-built PHP router is used to map URLs to specific PHP scripts.
    *   **_Why this was chosen:_** Simple to understand and implement for a small project, avoiding external dependencies.
2.  **Direct PHP API Endpoints:** Each API action (e.g., `add_comment.php`, `get_comments.php`) is a standalone PHP file directly handling request processing, business logic, and database interaction, returning JSON responses.
    *   **_Why this was chosen:_** Allows for quick prototyping of individual endpoints without the overhead of a full framework structure.
3.  **Direct `mysqli` Database Interaction:** Database queries are executed directly using the `mysqli` extension within the API scripts.
    *   **_Why this was chosen:_** Direct control over SQL queries; minimal setup.
4.  **Mixed Concerns:** HTML rendering, PHP logic, and session management are sometimes interleaved (`player.php`).
    *   **_Why this was chosen:_** Common in older or smaller PHP applications for quick view generation.
5.  **Client-Side Authentication Awareness (`CURRENT_USER_ID`):** The `player.php` script injects the current user ID into a JavaScript variable, allowing client-side logic to determine if edit/delete options should be shown.
    *   **_Why this was chosen:_** Provides immediate UI feedback and control without extra server requests for every comment.

### Production Considerations & Alternative Approaches:

For a production-grade application, the following alternative approaches would be highly recommended to address scalability, security, and maintainability:

1.  **Robust Routing with a Framework:**
    *   **_Instead of Custom Router:_** Utilize a well-established PHP framework like **Laravel**, **Symfony**, or **CodeIgniter**. These frameworks provide battle-tested routing, middleware, and a structured approach to application development.
2.  **Structured API with Framework Features:**
    *   **_Instead of Direct PHP API Endpoints:_** Leverage a framework's API capabilities (e.g., Laravel API Resources, Symfony controllers) to define clear API routes, use dependency injection, and apply global middleware for authentication, logging, and error handling. This promotes separation of concerns and reusability.
3.  **Object-Relational Mapping (ORM):**
    *   **_Instead of Direct `mysqli`:_** Implement an ORM (e.g., Eloquent in Laravel, Doctrine in Symfony). An ORM abstracts database interactions, provides a more object-oriented way to query and manipulate data, reduces boilerplate SQL, and often improves security against SQL injection (when used correctly).
4.  **Clear Separation of Concerns (MVC):**
    *   **_Instead of Mixed Concerns:_** Adopt a strict Model-View-Controller (MVC) pattern.
        *   **Models:** Handle database interactions and business logic.
        *   **Views:** Purely responsible for presentation (HTML, CSS, JS).
        *   **Controllers:** Coordinate between models and views, handle requests, and manage application flow.
5.  **Centralized Authentication & Authorization:**
    *   **_Instead of Direct Session Usage in each API file:_** Implement a centralized authentication service or use the built-in authentication systems of modern frameworks. This would include proper password hashing (e.g., `password_hash()` in PHP), secure session management, and potentially token-based authentication (e.g., JWT) for APIs.
    *   **_Regarding Client-Side Authorization Awareness:_** While `CURRENT_USER_ID` is useful for UI, **all authorization checks (who can edit/delete what) MUST be rigorously performed on the server-side.** The current PHP API endpoints correctly implement this, which is critical.
6.  **Dependency Management:**
    *   **_Missing:_** Introduce **Composer** for managing PHP dependencies and autoloading classes.
7.  **Comprehensive Error Handling and Logging:**
    *   **_Currently Basic:_** Implement a robust, centralized error handling mechanism to catch and log errors gracefully without exposing sensitive information to the end-user. Integrate with logging services (e.g., Monolog).

## Project Scope and Assumptions

This project's scope was specifically limited to developing the video commenting system. It is assumed that other core functionalities, such as:
-   User registration and login (beyond the basic implementation provided).
-   Video upload and management.
-   Overall application infrastructure.
-   Deployment strategies.
...would either be pre-existing components handled by other team members or external systems, allowing me to concentrate solely on delivering the commenting feature.

## Installation

1.  **Web Server:** Ensure you have a web server (like Apache or Nginx) with PHP (7.4+) and MySQL installed.
2.  **Database:**
    *   Create a MySQL database named `videoplaylist`.
    *   Import the `includes/create_users_table.sql` and `includes/create_comments_table.sql` to set up the necessary tables.
    *   Update `includes/db.php` with your database credentials if they differ from the default (`root` with no password).
3.  **Project Placement:** Place the project files within your web server's document root (e.g., `htdocs` for Apache). The current routing assumes the project is accessible at `/videoplaylist/`. Adjust `.htaccess` and `index.php` routes if your base URL differs.
4.  **Access:** Navigate to `http://localhost/videoplaylist/` in your browser.

## Usage

1.  **Register/Login:** Access the registration (`/videoplaylist/auth/register`) or login (`/videoplaylist/auth/login`) pages to create an account or sign in.
2.  **Video Player:** After logging in, you will be redirected to the main video player page (`/videoplaylist/`).
3.  **Playlist:** Select a video from the playlist on the right to start watching.
4.  **Commenting:** Use the comment form below the video player to post comments. You can edit or delete your own comments using the options next to them.
