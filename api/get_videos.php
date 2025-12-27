<?php
// Returns a list of video files from the uploads directory.

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

$video_directory = __DIR__ . '/../uploads/';
$allowed_extensions = ['mp4', 'webm', 'ogg'];

$response = [
    'success' => false,
    'videos' => [],
    'message' => ''
];

try {
    if (!is_dir($video_directory)) {
        throw new Exception('Video directory not found');
    }
    
    $files = scandir($video_directory);
    $video_files = [];
    
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }
        
        $file_path = $video_directory . $file;
        
        if (is_dir($file_path)) {
            continue;
        }
        
        $file_info = pathinfo($file);
        $extension = strtolower($file_info['extension'] ?? '');
        
        if (in_array($extension, $allowed_extensions)) {
            $video_files[] = [
                'path' => 'uploads/' . $file,
                'name' => $file_info['filename'],
                'extension' => 'mp4',
                'size' => filesize($file_path),
                'modified' => filemtime($file_path)
            ];
        }
    }
    
    // Sort by modification time, newest first.
    usort($video_files, function($a, $b) {
        return $b['modified'] - $a['modified'];
    });
    
    // Just the paths, for backwards compatibility.
    $video_paths = array_map(function($video) {
        return $video['path'];
    }, $video_files);
    
    $response['success'] = true;
    $response['videos'] = $video_paths;
    $response['details'] = $video_files; // Include detailed info
    $response['count'] = count($video_files);
    $response['message'] = count($video_files) > 0 
        ? 'Videos loaded successfully' 
        : 'No videos found in uploads folder';
    
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
?>
