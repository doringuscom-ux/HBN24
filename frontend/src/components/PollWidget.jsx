import React, { useState } from 'react';
import { BarChart2, CheckCircle2 } from 'lucide-react';

export default function PollWidget() {
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResults, setShowResults] = useState(false);

    const pollQuestion = "क्या भारत को UN सुरक्षा परिषद का स्थायी सदस्य होना चाहिए?";
    const options = [
        { id: 1, text: "हाँ", percentage: 85, emoji: "👍" },
        { id: 2, text: "नहीं", percentage: 10, emoji: "👎" },
        { id: 3, text: "कह नहीं सकते", percentage: 5, emoji: "🤔" }
    ];

    const handleVote = (id) => {
        setSelectedOption(id);
        setShowResults(true);
    };

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 border-t-4 border-t-[#da0000] p-6 rounded-xl w-full h-full flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 text-gray-100/50 pointer-events-none transform rotate-12">
                <BarChart2 size={120} />
            </div>

            <div className="flex items-center justify-center gap-2 mb-6 text-center relative z-10">
                <BarChart2 className="text-[#da0000] animate-pulse" size={24} />
                <h3 className="text-[18px] md:text-[20px] font-black text-[#222] leading-[1.3]">
                    {pollQuestion}
                </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                {options.map((option) => (
                    <div key={option.id} className="relative w-full">
                        {!showResults ? (
                            <button
                                onClick={() => handleVote(option.id)}
                                className="w-full flex flex-col items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg hover:border-[#da0000]/50 hover:bg-red-50/30 hover:-translate-y-1 hover:shadow-md transition-all duration-300 font-bold text-gray-700 bg-white"
                            >
                                <span className="text-2xl mb-1">{option.emoji}</span>
                                <span>{option.text}</span>
                            </button>
                        ) : (
                            <div className={`w-full bg-white border ${selectedOption === option.id ? 'border-[#da0000]' : 'border-gray-200'} rounded-lg h-[4.5rem] relative overflow-hidden flex items-center shadow-inner`}>
                                <div 
                                    className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${selectedOption === option.id ? 'bg-gradient-to-r from-[#da0000]/20 to-[#da0000]/10' : 'bg-gray-100'}`} 
                                    style={{ width: `${option.percentage}%` }}
                                ></div>
                                <div className="relative z-10 flex items-center justify-between w-full px-4 font-bold text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{option.emoji}</span>
                                        <span className={selectedOption === option.id ? 'text-[#da0000]' : ''}>{option.text}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-lg ${selectedOption === option.id ? 'text-[#da0000]' : 'text-gray-500'}`}>{option.percentage}%</span>
                                        {selectedOption === option.id && <CheckCircle2 size={18} className="text-[#da0000]" />}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            
            <div className="mt-5 flex justify-between items-center text-[13px] font-semibold text-gray-400 relative z-10">
                <span className="flex items-center gap-1">
                    {showResults ? (
                        <span className="text-green-600 flex items-center gap-1"><CheckCircle2 size={14}/> Thanks for voting!</span>
                    ) : (
                        'Select an option to vote'
                    )}
                </span>
                <span>{showResults ? 'Total Votes: 12,450' : 'Live Poll'}</span>
            </div>
        </div>
    );
}
