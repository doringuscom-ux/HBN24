import os

file_path = r'd:\Rakesh React\HBN24\frontend\src\pages\Epaper.jsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

marker = '{/* Dot Group 4 */}'
idx = content.find(marker)

if idx != -1:
    content = content[:idx] + marker + '''
                        <div className="hidden sm:flex gap-1.5 md:gap-2 items-center">
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#9ca3af]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#e5e7eb]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#38bdf8]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#f472b6]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#fcd34d]"></div>
                            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-[#111827]"></div>
                        </div>

                        {/* Right Socials */}
                        <div className="flex gap-1.5 md:gap-2 items-center">
                            <a href="https://www.youtube.com/@hbnnews24x7" target="_blank" rel="noreferrer" className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform"><FaYoutube className="text-xs md:text-base" /></a>
                            <a href="https://www.facebook.com/HBNNews24" target="_blank" rel="noreferrer" className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform"><FaFacebookF className="text-xs md:text-base" /></a>
                            <a href="https://x.com/HbnNews24" target="_blank" rel="noreferrer" className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-black flex items-center justify-center text-white shadow-sm hover:scale-110 transition-transform"><FaXTwitter className="text-xs md:text-base" /></a>
                        </div>
                    </div>
                </div>

                {/* ========== PAGE TURNING (REAL AKHBAAR BUTTONS) ========== */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-black/30 px-6 py-5 bg-white/60">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            disabled={currentPage === 1}
                            className="w-40 border border-black/60 font-mono font-bold py-2 px-4 hover:bg-black hover:text-white transition disabled:opacity-30 uppercase text-sm tracking-wider"
                        >
                            ← पिछला पृष्ठ
                        </button>
                        <div className="font-mono text-sm border-b-2 border-black px-2">
                            पृष्ठ {currentPage} / {totalPages}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="w-40 border border-black/60 font-mono font-bold py-2 px-4 hover:bg-black hover:text-white transition disabled:opacity-30 uppercase text-sm tracking-wider"
                        >
                            अगला पृष्ठ →
                        </button>
                    </div>
                )}
            </div>

            {/* Cutting Theme Modal */}
            {cuttingModalData && (
                <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-center">कटिंग की थीम चुनें</h3>
                        <p className="text-sm text-gray-600 mb-6 text-center">आप किस स्टाइल में न्यूज़ कटिंग डाउनलोड करना चाहते हैं?</p>
                        
                        <div className="flex flex-col gap-4">
                            <button 
                                onClick={() => {
                                    downloadNewsCutting(cuttingModalData.id, cuttingModalData.title, cuttingModalData.item, 'default', cuttingModalData.catHindi);
                                    setCuttingModalData(null);
                                }}
                                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors text-left"
                            >
                                <div className="text-2xl">📱</div>
                                <div>
                                    <div className="font-bold text-gray-800">सिंगल कॉलम (Single Column)</div>
                                    <div className="text-xs text-gray-500">वेबसाइट जैसा डिफ़ॉल्ट डिज़ाइन (Full Article)</div>
                                </div>
                            </button>

                            <button 
                                onClick={() => {
                                    downloadNewsCutting(cuttingModalData.id, cuttingModalData.title, cuttingModalData.item, 'classic', cuttingModalData.catHindi);
                                    setCuttingModalData(null);
                                }}
                                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors text-left"
                            >
                                <div className="text-2xl">📰</div>
                                <div>
                                    <div className="font-bold text-gray-800">क्लासिक (Classic Newspaper)</div>
                                    <div className="text-xs text-gray-500">कॉलम वाला पारंपरिक डिज़ाइन (सारांश)</div>
                                </div>
                            </button>

                            <button 
                                onClick={() => {
                                    downloadNewsCutting(cuttingModalData.id, cuttingModalData.title, cuttingModalData.item, 'classic-full', cuttingModalData.catHindi);
                                    setCuttingModalData(null);
                                }}
                                className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors text-left"
                            >
                                <div className="text-2xl">📜</div>
                                <div>
                                    <div className="font-bold text-gray-800">क्लासिक - पूरा लेख (Classic Full)</div>
                                    <div className="text-xs text-gray-500">पारंपरिक डिज़ाइन लेकिन पूरे पैराग्राफ के साथ</div>
                                </div>
                            </button>
                        </div>
                        
                        <button 
                            onClick={() => setCuttingModalData(null)}
                            className="w-full mt-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition-colors"
                        >
                            रद्द करें (Cancel)
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
export default Epaper;
'''

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
