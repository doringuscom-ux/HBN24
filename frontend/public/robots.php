<?php
header("Content-Type: text/plain; charset=utf-8");
$frontendDomain = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'];

echo "User-agent: *\n";
echo "Allow: /\n\n";
echo "Sitemap: " . $frontendDomain . "/sitemap.xml\n";
?>
