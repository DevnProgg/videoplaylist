CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    video_path VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);