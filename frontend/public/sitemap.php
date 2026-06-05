<?php
header("Content-Type: application/xml; charset=utf-8");
$frontendDomain = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'];
$sitemapUrl = "https://hbn-24.vercel.app/sitemap.xml?host=" . urlencode($frontendDomain);
$content = @file_get_contents($sitemapUrl);
if ($content === FALSE) {
    // Fallback error
    echo '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>';
} else {
    echo $content;
}
?>
