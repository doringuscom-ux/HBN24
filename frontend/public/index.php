<?php
// This script acts as a proxy to inject Open Graph meta tags for WhatsApp/Facebook
// It serves the Vite React index.html but dynamically adds <meta> tags if the route is a news article.

$htmlPath = __DIR__ . '/index.html';
if (!file_exists($htmlPath)) {
    // Fallback if index.html is missing for some reason
    die("index.html not found.");
}

$html = file_get_contents($htmlPath);
$requestUri = $_SERVER['REQUEST_URI'];
// Safely strip any query string like ?fbclid= without relying on parse_url quirks
$requestPath = explode('?', $requestUri)[0];

// Check if the route is a news article: e.g. /news/some-article-slug
if (preg_match('/^\/news\/([^\/]+)\/?$/', $requestPath, $matches)) {
    $slug = $matches[1];
    
    // Fetch article data from your backend API
    $apiUrl = "https://hbn-24.vercel.app/api/news/article/" . urlencode($slug);
    
    // Setup cURL
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8); // 8 seconds timeout for serverless cold start
    $response = curl_exec($ch);

    if ($response) {
        $article = json_decode($response, true);
        
        if ($article && !isset($article['message'])) {
            // Found article! Let's build the meta tags
            $title = htmlspecialchars($article['title'] ?? 'HBN24 News', ENT_QUOTES, 'UTF-8');
            $description = htmlspecialchars(strip_tags($article['shortDescription'] ?? $article['content'] ?? ''), ENT_QUOTES, 'UTF-8');
            // Truncate description if too long
            if (mb_strlen($description) > 200) {
                $description = mb_substr($description, 0, 197) . '...';
            }
            $image = htmlspecialchars($article['image'] ?? 'https://hbnnews24.com/favicon.png', ENT_QUOTES, 'UTF-8');
            $url = "https://" . $_SERVER['HTTP_HOST'] . $requestUri;

            $metaTags = "
    <!-- Dynamic Open Graph Tags added by index.php -->
    <meta property=\"og:title\" content=\"$title\" />
    <meta property=\"og:description\" content=\"$description\" />
    <meta property=\"og:image\" content=\"$image\" />
    <meta property=\"og:url\" content=\"$url\" />
    <meta property=\"og:type\" content=\"article\" />
    <meta name=\"twitter:card\" content=\"summary_large_image\" />
    <meta name=\"twitter:title\" content=\"$title\" />
    <meta name=\"twitter:description\" content=\"$description\" />
    <meta name=\"twitter:image\" content=\"$image\" />
    <!-- End Dynamic Tags -->
";

            // Replace the <title> tag
            $html = preg_replace('/<title>.*?<\/title>/i', "<title>$title | HBN24 News</title>", $html);
            
            // Inject meta tags right before </head>
            $html = str_replace('</head>', $metaTags . '</head>', $html);
        }
    }
}

// Output the final HTML
echo $html;
?>
