import React, { useEffect } from 'react';

const FactCheckPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = 'Fact Check Policy | HBN News 24';
    }, []);

    return (
        <div className="w-full max-w-[1270px] mx-auto px-4 py-10 font-sans">
            <h1 className="text-3xl md:text-4xl font-black mb-6 text-gray-900 border-b pb-4">Fact Check & Corrections Policy</h1>
            <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
                
                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">1. Introduction / परिचय</h2>
                <p>HBN News 24 अपने पाठकों और दर्शकों को सटीक, निष्पक्ष, संतुलित और समय पर समाचार उपलब्ध कराने के लिए प्रतिबद्ध है। हमारा उद्देश्य जनहित में खबरें प्रकाशित करना है। हम मानते हैं कि पत्रकारिता में सत्यता, पारदर्शिता और जिम्मेदारी अत्यंत महत्वपूर्ण है। इसी उद्देश्य से यह Fact Check & Corrections Policy बनाई गई है।</p>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. Verification Process / सत्यापन प्रक्रिया</h2>
                <p>किसी भी महत्वपूर्ण या संवेदनशील समाचार को प्रकाशित करने से पहले HBN News 24 निम्न प्रक्रियाओं का पालन करने का प्रयास करेगा:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>एक से अधिक स्रोतों से जानकारी का मिलान करना।</li>
                    <li>संबंधित अधिकारी, संस्था या पक्ष से पुष्टि (confirmation) लेने का प्रयास करना।</li>
                    <li>उपलब्ध दस्तावेज, फोटो, वीडियो या रिकॉर्ड की गहन जांच करना।</li>
                    <li>गंभीर, आपराधिक, या सामुदायिक मामलों में अतिरिक्त सावधानी बरतना।</li>
                    <li>अफवाह, WhatsApp forward या social media दावों को बिना जांच के प्रकाशित न करना।</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Errors, Corrections & Updates / त्रुटियां और सुधार</h2>
                <p>पत्रकारिता एक गतिशील क्षेत्र है। यदि HBN News 24 पर प्रकाशित किसी खबर में मानवीय त्रुटि, गलत नाम, स्थान, या भ्रामक जानकारी पाई जाती है, तो हम तुरंत कार्रवाई करते हैं:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li>खबर को तुरंत edit/update किया जाएगा।</li>
                    <li>गंभीर गलती होने पर खबर को पूरी तरह delete या unpublish किया जा सकता है।</li>
                    <li>पारदर्शिता बनाए रखने के लिए महत्वपूर्ण सुधारों (Corrections) को खबर में स्पष्ट रूप से मेंशन किया जाएगा।</li>
                </ul>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Correction Request & Grievance / शिकायत निवारण</h2>
                <p>यदि किसी व्यक्ति, संस्था या पाठक को लगता है कि HBN News 24 पर प्रकाशित कोई खबर गलत या अधूरी है, तो वे सीधे हमें Correction Request भेज सकते हैं। कृपया अपनी शिकायत के साथ खबर का लिंक और सही जानकारी/सबूत अटैच करें।</p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 my-4">
                    <p className="font-bold text-gray-900 mb-2">संपर्क करें (Contact Info):</p>
                    <p><strong>Email:</strong> hbnnews24live@gmail.com</p>
                    <p><strong>Address:</strong> HBN News 24 Network, SCO 19, Sector 11, Panchkula, Haryana 134109</p>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Limitation of Liability / जवाबदेही की सीमा</h2>
                <p><strong>Strict Disclaimer:</strong> HBN News 24 news publish karne se pehle fact-check aur verification karne ki koshish karega. Agar koi news galat, adhuri ya misleading nikli, to use edit, update, correct ya delete kiya jayega. HBN News 24 jaanbujhkar fake news publish nahi karega. Agar kisi source ki wajah se anjane me galat news publish ho jaye, to HBN News 24 good faith me correction karega aur kanoon ke andar jitni protection mil sakti hai, utni claim karega.</p>
                <p className="mt-4 text-gray-600 italic">HBN News 24 makes every effort to fact-check and verify news before publication. If any news is found to be incorrect, incomplete, or misleading, it will be edited, updated, corrected, or deleted. HBN News 24 does not intentionally publish fake news. If incorrect news is inadvertently published due to a source, HBN News 24 will make corrections in good faith and claim the maximum protection available under the law.</p>
            </div>
        </div>
    );
};

export default FactCheckPolicy;
