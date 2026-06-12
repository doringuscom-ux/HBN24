import React, { useEffect } from 'react';

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Privacy Policy | HBN News 24';
    }, []);

    return (
        <div className="w-full max-w-[1270px] mx-auto px-4 py-10">
            <h1 className="text-3xl md:text-4xl font-black mb-6 text-gray-900 border-b pb-4">Privacy Policy (प्राइवेसी पॉलिसी)</h1>
            <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
                <p>Welcome to HBN News 24 ("we", "our", "us"). We respect your privacy and are committed to protecting it through our compliance with this policy. This policy describes the types of information we may collect from you or that you may provide when you visit the website hbnnews24.com and our practices for collecting, using, maintaining, protecting, and disclosing that information.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Information We Collect</h2>
                <p>We may collect several types of information from and about users of our Website, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>Information that you provide by filling in forms on our Website.</li>
                    <li>Records and copies of your correspondence (including email addresses), if you contact us.</li>
                    <li>Details of your visits to our Website, including traffic data, location data, logs, and other communication data and the resources that you access and use on the Website.</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Cookies and Tracking Technologies</h2>
                <p>We use cookies, web beacons, and other tracking technologies to collect information about your activities on our Website. This includes information about your browsing behavior and device. We use this information to improve your experience and to serve personalized content and advertisements (including Google AdSense).</p>
                <p>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites. Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet. Users may opt out of personalized advertising by visiting Ads Settings.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Third-Party Links</h2>
                <p>Our Website may contain links to other websites. Please be aware that we are not responsible for the content or privacy practices of such other sites. We encourage our users to be aware when they leave our site and to read the privacy statements of any other site that collects personally identifiable information.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Sharing Your Information</h2>
                <p>We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Contact Information</h2>
                <p>To ask questions or comment about this privacy policy and our privacy practices, contact us at: <strong>hbnnews24live@gmail.com</strong></p>
                
                <p className="text-sm text-gray-500 mt-10 italic">Last updated: {new Date().toLocaleDateString()}</p>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
