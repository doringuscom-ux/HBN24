import React, { useEffect } from 'react';

const AboutUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'About Us | HBN News 24';
    }, []);

    return (
        <div className="w-full max-w-[1270px] mx-auto px-4 py-10">
            <h1 className="text-3xl md:text-4xl font-black mb-6 text-gray-900 border-b pb-4">About Us (हमारे बारे में)</h1>
            <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
                <p className="text-lg font-semibold text-gray-800">Welcome to HBN News 24 – दैनिक सबसे तेज़</p>
                <p>HBN News 24 is your most trusted, fastest, and most comprehensive source for news and updates. Founded with the vision of delivering unbiased and accurate reporting, we are dedicated to providing you the very best of news, with an emphasis on speed, reliability, and factual journalism.</p>
                
                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our Mission</h2>
                <p>Our mission is to bring true, unadulterated, and lightning-fast news to our audience. In an era of misinformation, we strive to be a beacon of truth. We cover a wide range of topics including National Politics, Entertainment, Sports, Technology, Religion, Education, Business, and Lifestyle. We believe in journalism that is free, fair, fearless, and for the people.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our Vision</h2>
                <p>We envision a society where every citizen is well-informed and empowered by knowledge. Through digital innovation and grassroots reporting, we aim to bridge the gap between global events and local understanding, ensuring our readers are always one step ahead.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Why Choose HBN News 24?</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Unbiased Reporting:</strong> We present facts without fear or favor.</li>
                    <li><strong>24/7 Coverage:</strong> News never sleeps, and neither do we. Our team works round the clock to keep you updated.</li>
                    <li><strong>Hyper-Local & Global:</strong> From your local neighborhood events to major international geopolitical shifts, we cover it all.</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">What We Offer</h2>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Latest Breaking News:</strong> Stay updated with real-time news alerts from around the nation and the world.</li>
                    <li><strong>Classic E-Paper Cuttings:</strong> We offer a unique and highly popular feature allowing users to generate and download beautiful, traditional newspaper-style cuttings of our digital articles. These are optimized for easy sharing on WhatsApp, Facebook, and Instagram.</li>
                    <li><strong>In-depth Analysis & Editorials:</strong> Detailed coverage and expert opinions on the most important events shaping our society and economy.</li>
                    <li><strong>Multimedia Content:</strong> Engaging short videos, photo galleries, and live TV coverage.</li>
                </ul>

                <p className="mt-8">We are constantly evolving and adapting to the latest digital trends to serve you better. We hope you enjoy our platform as much as we enjoy offering it to you. If you have any questions, news tips, or comments, please don't hesitate to contact us.</p>
                <p className="font-bold mt-4">Sincerely,<br/>The HBN News 24 Team</p>
            </div>
        </div>
    );
};

export default AboutUs;
