import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export default function Authors() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <Helmet>
                <title>Authors | HBN24 News</title>
                <meta name="description" content="Meet the editorial team and authors behind HBN24 News." />
            </Helmet>
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-500 py-8 px-8">
                    <h1 className="text-3xl md:text-4xl font-black text-white">Our Authors</h1>
                </div>
                <div className="p-8 prose prose-lg max-w-none text-gray-700">
                    <p>At HBN24 News, we pride ourselves on having a dedicated team of experienced journalists, reporters, and editors who work tirelessly to bring you accurate and timely news.</p>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Editorial Team</h2>
                    <p>Our editorial team ensures that every piece of news is verified and adheres to our strict editorial guidelines.</p>
                    
                    {/* Add Author Profiles Here in the future */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="border border-gray-100 rounded-xl p-6 bg-gray-50">
                            <h3 className="text-xl font-bold text-red-600 mb-2">Editor in Chief</h3>
                            <p className="text-sm text-gray-500 mb-3">HBN24 News</p>
                            <p className="text-gray-700">Leading the editorial vision and ensuring the highest standards of journalism.</p>
                        </div>
                        <div className="border border-gray-100 rounded-xl p-6 bg-gray-50">
                            <h3 className="text-xl font-bold text-red-600 mb-2">Senior Correspondents</h3>
                            <p className="text-sm text-gray-500 mb-3">National & State News</p>
                            <p className="text-gray-700">Bringing ground reports and deep analysis from across the region.</p>
                        </div>
                    </div>
                    
                    <p className="mt-8 text-sm text-gray-500 italic">This page is currently being updated. Detailed author profiles will be available soon.</p>
                </div>
            </div>
        </div>
    );
}
