 'use client';
import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

export default function CorrectionsPolicy() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <Helmet>
                <title>Corrections Policy | HBN24 News</title>
                <meta name="description" content="Read our corrections policy. We are committed to transparency and accuracy." />
            </Helmet>
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-red-600 to-red-500 py-8 px-8">
                    <h1 className="text-3xl md:text-4xl font-black text-white">Corrections Policy</h1>
                </div>
                <div className="p-8 prose prose-lg max-w-none text-gray-700">
                    <p>At HBN24 News, we are committed to telling our readers when an error has been made, the magnitude of the error, and the correct information, as quickly as possible. This commitment and transparency apply to small errors as well as large ones.</p>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Our Commitment to Accuracy</h2>
                    <p>We strive for accuracy in all our reports. However, when mistakes happen, we believe it is our responsibility to correct them promptly and transparently.</p>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How to Report an Error</h2>
                    <p>If you believe you have found an error in one of our stories, please contact us immediately. You can reach out to our editorial team via our <a href="/contact" className="text-red-600 hover:underline">Contact Us</a> page or email us directly.</p>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Correction Process</h2>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Once an error is reported, our editors will review the claim against our original sources and research.</li>
                        <li>If a correction is warranted, the article will be updated with the accurate information.</li>
                        <li>An editor's note will be added to the article explaining what was changed, why, and when the correction was made.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}




