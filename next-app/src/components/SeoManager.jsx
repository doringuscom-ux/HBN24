'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SeoManager() {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');
    const [globalSeo, setGlobalSeo] = useState(null);
    const [pageSeoList, setPageSeoList] = useState([]);

    useEffect(() => {
        const fetchSeoData = async () => {
            try {
                const res = await fetch('/api/seo');
                const data = await res.json();
                setGlobalSeo(data);
            } catch (err) {}
            try {
                const res = await fetch('/api/seo/pages');
                const data = await res.json();
                setPageSeoList(data);
            } catch (err) {}
        };
        setTimeout(fetchSeoData, 2000);
    }, []);

    useEffect(() => {
        if (!isAdmin && !pathname.startsWith('/news/') && (globalSeo || pageSeoList.length > 0)) {
            const currentPageSeo = pageSeoList.find(p => p.pageUrl === pathname);
            document.title = currentPageSeo?.metaTitle || globalSeo?.siteTitle || 'HBN24 News';

            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
                metaDesc = document.createElement('meta');
                metaDesc.name = "description";
                document.head.appendChild(metaDesc);
            }
            metaDesc.content = currentPageSeo?.metaDescription || globalSeo?.metaDescription || '';

            let metaKeywords = document.querySelector('meta[name="keywords"]');
            if (!metaKeywords) {
                metaKeywords = document.createElement('meta');
                metaKeywords.name = "keywords";
                document.head.appendChild(metaKeywords);
            }
            metaKeywords.content = currentPageSeo?.metaKeywords || globalSeo?.metaKeywords || '';

            let metaRobots = document.querySelector('meta[name="robots"]');
            if (!metaRobots) {
                metaRobots = document.createElement('meta');
                metaRobots.name = "robots";
                document.head.appendChild(metaRobots);
            }
            metaRobots.content = currentPageSeo?.robots || globalSeo?.robots || 'index, follow';

            if (globalSeo?.googleAnalyticsId) {
                if (!document.getElementById('ga-script')) {
                    const script1 = document.createElement('script');
                    script1.id = 'ga-script';
                    script1.async = true;
                    script1.src = `https://www.googletagmanager.com/gtag/js?id=${globalSeo.googleAnalyticsId}`;
                    document.head.appendChild(script1);

                    const script2 = document.createElement('script');
                    script2.id = 'ga-inline';
                    script2.innerHTML = `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${globalSeo.googleAnalyticsId}', { page_path: '${pathname}' });
                    `;
                    document.head.appendChild(script2);
                } else if (window.gtag) {
                    window.gtag('config', globalSeo.googleAnalyticsId, { page_path: pathname });
                }
            }
        }
    }, [pathname, globalSeo, pageSeoList, isAdmin]);

    return null;
}
