import React, { useEffect } from 'react';

const EditorialPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Editorial Policy | HBN News 24';
    }, []);

    return (
        <div className="w-full max-w-[1270px] mx-auto px-4 py-10 font-sans">
            <h1 className="text-3xl md:text-4xl font-black mb-6 text-gray-900 border-b pb-4">Editorial Responsibility Policy</h1>
            <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
                
                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Sources of Information & News Aggregation (न्यूज़ एग्रीगेशन)</h2>
                <p>HBN News 24 मुख्य रूप से एक न्यूज़ एग्रीगेटर (News Aggregator) के रूप में भी काम करता है। हमारे एडिटर्स (Editors) और रिपोर्टर्स विभिन्न अन्य न्यूज़ वेबसाइट्स, समाचार एजेंसियों (Agencies), सोशल मीडिया और अन्य स्रोतों से खबरें लेकर उन्हें अपने शब्दों में एडिट (Edit) और रीराइट (Rewrite) करके पब्लिश करते हैं।</p>
                <p>हमारा उद्देश्य अलग-अलग जगहों पर बिखरी हुई महत्वपूर्ण खबरों को एक जगह और आसान भाषा में अपने पाठकों तक पहुंचाना है।</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Breaking News & Updates / ब्रेकिंग न्यूज़</h2>
                <p>चूंकि हमारे एडिटर्स अन्य स्रोतों से जानकारी जुटाते हैं, इसलिए कई बार शुरुआती जानकारी अधूरी हो सकती है। हम उपलब्ध जानकारी के आधार पर खबर प्रकाशित करते हैं और नई जानकारी मिलने पर उसे तुरंत अपडेट करते हैं।</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Sensitive News Policy / संवेदनशील खबरें</h2>
                <p>विवादित, आपराधिक, या संवेदनशील (Sensitive) मामलों में हम अन्य बड़े और भरोसेमंद न्यूज़ पोर्टल्स की रिपोर्टिंग को आधार बनाते हैं। हम किसी भी मामले में बिना अदालत या पुलिस के फैसले के किसी को अपनी तरफ से अपराधी नहीं ठहराते।</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Third-Party Content & Liability (जवाबदेही से छूट)</h2>
                <p>HBN News 24 के एडिटर्स अन्य स्रोतों (Other Sources) से खबरें लेकर उन्हें एडिट करके पब्लिश करते हैं। हम खबर प्रकाशित करने से पहले सामान्य सावधानी बरतते हैं, लेकिन <strong>मूल खबर (Original News) की 100% सत्यता की जिम्मेदारी मूल स्रोत (Original Source) की होती है।</strong></p>
                <p>यदि हमारे द्वारा एडिट करके पब्लिश की गई किसी खबर में मूल स्रोत की वजह से कोई गलती, भ्रामक जानकारी या विवाद होता है, तो HBN News 24 इसके लिए कानूनी रूप से उत्तरदायी नहीं होगा। अगर हमें किसी खबर में गलती का पता चलता है, तो हम उसे तुरंत एडिट या डिलीट कर देंगे।</p>
            </div>
        </div>
    );
};

export default EditorialPolicy;
