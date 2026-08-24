<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

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
    $apiUrl = "https://hbn24.onrender.com/api/news/article/" . urlencode($slug);

    // Setup cURL

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $apiUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15); // Increased to 15 seconds for slower Render responses
    $response = curl_exec($ch);

    if ($response) {
        $article = json_decode($response, true);

        if ($article && !isset($article['message'])) {
            // Found article! Let's build the meta tags
            $rawTitle = trim(preg_replace('/\s+/', ' ', $article['title'] ?? 'HBN24 News'));
            $title = htmlspecialchars($rawTitle, ENT_QUOTES, 'UTF-8');

            $rawDesc = strip_tags($article['shortDescription'] ?? $article['content'] ?? '');
            $rawDesc = trim(preg_replace('/\s+/', ' ', $rawDesc));
            $description = htmlspecialchars($rawDesc, ENT_QUOTES, 'UTF-8');

            // Truncate description if too long
            if (mb_strlen($description) > 200) {
                $description = mb_substr($description, 0, 197) . '...';
            }

            $rawImage = trim($article['image'] ?? 'https://hbnnews24.com/favicon.png');
            $image = htmlspecialchars($rawImage, ENT_QUOTES, 'UTF-8');
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

            // Generate Schema.org JSON-LD for NewsArticle
            $publishDate = isset($article['createdAt']) ? date('c', strtotime($article['createdAt'])) : date('c');
            $updateDate = isset($article['updatedAt']) ? date('c', strtotime($article['updatedAt'])) : $publishDate;
            $authorName = isset($article['author']) ? $article['author'] : 'HBN24 News';

            $schemaJson = [
                "@context" => "https://schema.org",
                "@type" => "NewsArticle",
                "mainEntityOfPage" => [
                    "@type" => "WebPage",
                    "@id" => $url
                ],
                "headline" => $title,
                "image" => [$image],
                "datePublished" => $publishDate,
                "dateModified" => $updateDate,
                "author" => [
                    "@type" => "Person",
                    "name" => $authorName
                ],
                "publisher" => [
                    "@type" => "Organization",
                    "name" => "HBN24 News",
                    "logo" => [
                        "@type" => "ImageObject",
                        "url" => "https://hbnnews24.com/favicon.png"
                    ]
                ],
                "description" => $description
            ];

            // Generate BreadcrumbList Schema
            $categoryRaw = $article['category'] ?? 'News';
            if (is_array($categoryRaw)) {
                $categoryRaw = !empty($categoryRaw) ? $categoryRaw[0] : 'News';
            }
            $categoryName = ucfirst(strval($categoryRaw));
            
            $categoryUrl = "https://" . $_SERVER['HTTP_HOST'] . "/" . strtolower($categoryName);

            $breadcrumbJson = [
                "@context" => "https://schema.org",
                "@type" => "BreadcrumbList",
                "itemListElement" => [
                    [
                        "@type" => "ListItem",
                        "position" => 1,
                        "name" => "Home",
                        "item" => "https://" . $_SERVER['HTTP_HOST'] . "/"
                    ],
                    [
                        "@type" => "ListItem",
                        "position" => 2,
                        "name" => $categoryName,
                        "item" => $categoryUrl
                    ],
                    [
                        "@type" => "ListItem",
                        "position" => 3,
                        "name" => $title,
                        "item" => $url
                    ]
                ]
            ];

            // Combine both schemas into an array
            $schemas = [$schemaJson, $breadcrumbJson];
            $schemaHtml = "\n    <script type=\"application/ld+json\">\n    " . json_encode($schemas, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . "\n    </script>\n";

            // Inject meta tags and schema right before </head>
            $html = str_replace('</head>', $metaTags . $schemaHtml . '</head>', $html);

            // SEO HACK: Inject the article text into the HTML body so Googlebot can read it without JavaScript!
            $articleHtml = $article['content'] ?? '';
            // We use position absolute and opacity 0 so normal users don't see a flicker, but Googlebot reads the text.
            $seoContent = "<div id=\"seo-content\" style=\"position: absolute; opacity: 0; pointer-events: none;\"><h1>$title</h1>$articleHtml</div>";
            $html = str_replace('<body>', '<body>' . $seoContent, $html);
        }
    }
} elseif (preg_match('/^\/breaking-news\/?$/', $requestPath)) {
    // Static OG Tags for Breaking News Page
    $title = "ब्रेकिंग न्यूज़ | HBN24";
    $description = "एक क्लिक में पढ़ें दिनभर की अहम और ताज़ा खबरें। देश, दुनिया, राज्य, खेल और राजनीति से जुड़ी हर बड़ी खबर पर हमारी नजर।";
    $image = "https://res.cloudinary.com/dsd6oj52y/image/upload/v1787380341/hbn24_news/pdhg8ghjjd5fy7bdzkgc.jpg";
    $url = "https://" . $_SERVER['HTTP_HOST'] . $requestUri;

    $metaTags = "
    <!-- Dynamic Open Graph Tags added by index.php for Breaking News -->
    <meta property=\"og:title\" content=\"$title\" />
    <meta property=\"og:description\" content=\"$description\" />
    <meta property=\"og:image\" content=\"$image\" />
    <meta property=\"og:url\" content=\"$url\" />
    <meta property=\"og:type\" content=\"website\" />
    <meta name=\"twitter:card\" content=\"summary_large_image\" />
    <meta name=\"twitter:title\" content=\"$title\" />
    <meta name=\"twitter:description\" content=\"$description\" />
    <meta name=\"twitter:image\" content=\"$image\" />
    <!-- End Dynamic Tags -->
";

    // Replace the <title> tag
    $html = preg_replace('/<title>.*?<\/title>/i', "<title>$title</title>", $html);

    // Inject meta tags right before </head>
    $html = str_replace('</head>', $metaTags . '</head>', $html);
}

// Global Canonical Tag for EVERY page (removes query strings like ?fbclid)
$globalCanonicalUrl = "https://" . $_SERVER['HTTP_HOST'] . $requestPath;
$canonicalHtml = "\n    <link rel=\"canonical\" href=\"$globalCanonicalUrl\" />\n    </head>";
$html = str_replace('</head>', $canonicalHtml, $html);

// Output the final HTML
echo $html;
?>