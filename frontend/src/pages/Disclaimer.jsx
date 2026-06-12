import React, { useEffect } from 'react';

const Disclaimer = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Disclaimer | HBN News 24';
    }, []);

    return (
        <div className="w-full max-w-[1270px] mx-auto px-4 py-10">
            <h1 className="text-3xl md:text-4xl font-black mb-6 text-gray-900 border-b pb-4">Disclaimer (अस्वीकरण)</h1>
            <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
                <p>The information provided by HBN News 24 on hbnnews24.com is for general informational and journalistic purposes only. All information on the Site is provided in good faith, however we make no representation or warranty of any kind, express or implied, regarding the absolute accuracy, adequacy, validity, reliability, availability or completeness of any information on the Site.</p>
                
                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Errors and Omissions (त्रुटियां और चूक)</h2>
                <p>We strive to provide highly accurate and up-to-date news. However, journalism involves human effort, and errors or omissions may occasionally occur. HBN News 24 assumes no responsibility or liability for any errors or omissions in the content of this site. The information is provided on an "as is" basis.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Personal Opinions (निजी विचार)</h2>
                <p>The views and opinions expressed in our news articles, opinion pieces, or editorials are solely those of the authors/journalists. They do not intend to malign, defame, or hurt the sentiments of any religion, ethnic group, club, organization, company, or individual.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Fair Use Notice (उचित उपयोग)</h2>
                <p>This website may contain copyrighted material, the use of which may not have been specifically authorized by the copyright owner. We use such material (like images or short quotes) under the "Fair Use" doctrine for purposes such as criticism, comment, news reporting, teaching, scholarship, and research. If you wish to use copyrighted material from this site for purposes of your own that go beyond fair use, you must obtain permission from the copyright owner.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. External Links Disclaimer</h2>
                <p>The Site may contain links to other websites or content belonging to third parties. Such external links are not investigated or monitored for accuracy by us, and we hold no responsibility for the content of third-party websites.</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. E-Paper Sharing</h2>
                <p>HBN News 24 provides the facility to share generated e-paper cuttings. We hold no responsibility for how these images are altered, misused, or interpreted on third-party social media platforms once shared by users.</p>
            </div>
        </div>
    );
};

export default Disclaimer;
