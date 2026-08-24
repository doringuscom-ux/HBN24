'use client';
import { usePathname } from 'next/navigation';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Suspense, useEffect } from 'react';
import SeoManager from './SeoManager';

export default function ClientLayout({ children, globalSeo, googleAnalyticsId }) {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    useEffect(() => {
        if (googleAnalyticsId && !isAdmin) {
            if (!document.getElementById('ga-script')) {
                const script1 = document.createElement('script');
                script1.id = 'ga-script';
                script1.async = true;
                script1.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
                document.head.appendChild(script1);

                const script2 = document.createElement('script');
                script2.id = 'ga-inline';
                script2.innerHTML = `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${googleAnalyticsId}', { page_path: '${pathname}' });
                `;
                document.head.appendChild(script2);
            } else if (window.gtag) {
                window.gtag('config', googleAnalyticsId, { page_path: pathname });
            }
        }
    }, [pathname, googleAnalyticsId, isAdmin]);

    return (
        <>
            {!isAdmin && <Navbar />}
            <main id="main-content" className="flex-grow">
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-600"></div></div>}>
                    {children}
                </Suspense>
            </main>
            {!isAdmin && <Footer />}
        </>
    );
}

