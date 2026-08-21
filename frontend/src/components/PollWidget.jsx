import React, { useState, useEffect } from 'react';
import { BarChart2, CheckCircle2 } from 'lucide-react';

export default function PollWidget() {
    const [pollData, setPollData] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [showResults, setShowResults] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = __API_URL__ || ''; // Assumes __API_URL__ is provided via Vite

    useEffect(() => {
        const fetchPoll = async () => {
            try {
                const res = await fetch(`${API_URL}/api/poll/active`);
                if (res.ok) {
                    const data = await res.json();
                    setPollData(data);
                    
                    // Check if already voted
                    const votedPollId = localStorage.getItem(`voted_poll_${data.id}`);
                    if (votedPollId) {
                        setSelectedOption(parseInt(votedPollId));
                        setShowResults(true);
                    }
                }
            } catch (error) {
                console.error("Error fetching poll:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPoll();
    }, []);

    const handleVote = async (optionId) => {
        if (!pollData || showResults) return;
        
        // Optimistic UI update
        setSelectedOption(optionId);
        setShowResults(true);
        localStorage.setItem(`voted_poll_${pollData.id}`, optionId);

        try {
            const res = await fetch(`${API_URL}/api/poll/${pollData.id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ optionId })
            });
            if (res.ok) {
                const updatedData = await res.json();
                setPollData(prev => ({
                    ...prev,
                    totalVotes: updatedData.totalVotes,
                    options: updatedData.options
                }));
            }
        } catch (error) {
            console.error("Error submitting vote:", error);
        }
    };

    if (isLoading) return <div className="w-full h-48 bg-gray-100 animate-pulse rounded-xl"></div>;
    if (!pollData) return null; // Or return a message if no active poll

    return (
        <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 border-t-4 border-t-[#da0000] p-6 rounded-xl w-full h-full flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow duration-300 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-10 -right-10 text-gray-100/50 pointer-events-none transform rotate-12">
                <BarChart2 size={120} />
            </div>

            <div className="flex items-start gap-3 mb-6 relative z-10">
                <BarChart2 className="text-[#da0000] animate-pulse flex-shrink-0 mt-1" size={22} />
                <h3 className="text-[18px] font-black text-[#222] leading-[1.35]">
                    {pollData.question}
                </h3>
            </div>
            
            <div className="flex flex-col gap-3 relative z-10">
                {pollData.options.map((option) => (
                    <div key={option.id} className="relative w-full">
                        {!showResults ? (
                            <button
                                onClick={() => handleVote(option.id)}
                                className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:border-[#da0000]/50 hover:bg-red-50/30 hover:-translate-y-1 hover:shadow-md transition-all duration-300 font-bold text-gray-700 bg-white"
                            >
                                <span className="text-left">{option.text}</span>
                                <span className="text-xl ml-2">{option.emoji}</span>
                            </button>
                        ) : (
                            <div className={`w-full bg-white border ${selectedOption === option.id ? 'border-[#da0000]' : 'border-gray-200'} rounded-lg h-12 relative overflow-hidden flex items-center shadow-inner`}>
                                <div 
                                    className={`absolute top-0 left-0 h-full transition-all duration-1000 ease-out ${selectedOption === option.id ? 'bg-gradient-to-r from-[#da0000]/20 to-[#da0000]/10' : 'bg-gray-100'}`} 
                                    style={{ width: `${option.percentage}%` }}
                                ></div>
                                <div className="relative z-10 flex items-center justify-between w-full px-4 font-bold text-gray-800">
                                    <div className="flex items-center gap-2">
                                        <span className={selectedOption === option.id ? 'text-[#da0000]' : ''}>{option.text}</span>
                                        <span className="text-lg">{option.emoji}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`text-[15px] ${selectedOption === option.id ? 'text-[#da0000]' : 'text-gray-500'}`}>{option.percentage}%</span>
                                        {selectedOption === option.id && <CheckCircle2 size={16} className="text-[#da0000]" />}
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
                <span>{showResults ? `Total Votes: ${pollData.totalVotes.toLocaleString('en-IN')}` : 'Live Poll'}</span>
            </div>
        </div>
    );
}
