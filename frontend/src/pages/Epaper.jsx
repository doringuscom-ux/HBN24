import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toJpeg } from 'html-to-image';

const SUDOKU_PUZZLES = [
  "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
  "000260701680070090190004500820100040004602900050003028009300074040050036703018000",
  "100489006730000040000001295007120600500703008006095700914600000020000037800512004"
];

const NewspaperGame = () => {
    const [initialBoard, setInitialBoard] = useState([]);
    const [board, setBoard] = useState([]);
    const [solutionBoard, setSolutionBoard] = useState([]);
    const [selectedCell, setSelectedCell] = useState(null);
    const [isWon, setIsWon] = useState(false);

    const isValidForSolve = (grid, r, c, n) => {
        for(let i=0; i<9; i++) {
            if(grid[r][i] === n) return false;
            if(grid[i][c] === n) return false;
            if(grid[3*Math.floor(r/3) + Math.floor(i/3)][3*Math.floor(c/3) + (i%3)] === n) return false;
        }
        return true;
    };

    const solveGrid = (grid) => {
        for(let r=0; r<9; r++) {
            for(let c=0; c<9; c++) {
                if(grid[r][c] === null) {
                    for(let n=1; n<=9; n++) {
                        if(isValidForSolve(grid, r, c, n)) {
                            grid[r][c] = n;
                            if(solveGrid(grid)) return true;
                            grid[r][c] = null;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    };

    const initGame = () => {
        const puzzle = SUDOKU_PUZZLES[Math.floor(Math.random() * SUDOKU_PUZZLES.length)];
        const grid = [];
        for (let r=0; r<9; r++) {
            const row = [];
            for (let c=0; c<9; c++) {
                const char = puzzle[r*9 + c];
                row.push(char === '0' ? null : parseInt(char));
            }
            grid.push(row);
        }
        setInitialBoard(grid);
        setBoard(JSON.parse(JSON.stringify(grid)));
        
        // Generate solution for instant validation
        const solved = JSON.parse(JSON.stringify(grid));
        solveGrid(solved);
        setSolutionBoard(solved);
        
        setSelectedCell(null);
        setIsWon(false);
    };

    useEffect(() => { initGame(); }, []);

    const handleCellClick = (r, c) => {
        if (!initialBoard[r][c]) setSelectedCell({r, c});
    };

    const handleNumberClick = (num) => {
        if (!selectedCell) return;
        const newBoard = [...board];
        newBoard[selectedCell.r][selectedCell.c] = num;
        setBoard(newBoard);
        
        if (newBoard.every(row => row.every(cell => cell !== null))) {
            let won = true;
            for (let r=0; r<9; r++) {
                for (let c=0; c<9; c++) {
                    if (newBoard[r][c] !== solutionBoard[r][c]) won = false;
                }
            }
            if (won) {
                setIsWon(true);
                setSelectedCell(null);
            }
        }
    };

    if (board.length === 0) return null;

    return (
        <div className="flex-1 w-full flex flex-col pt-4 pb-2">
            <div className="w-full border-y border-dashed border-gray-400 py-3 px-2 sm:px-4 bg-[#fcf9f2]/40 flex flex-col items-center justify-center">
                <span className="text-sm sm:text-base font-serif font-black text-gray-900 border-b-[1.5px] border-gray-900 pb-1 mb-3 w-full max-w-[350px] text-center tracking-widest uppercase">
                    {isWon ? 'बधाई हो! हल हो गया 🎉' : 'सुडोकू'}
                </span>
                
                <div className="flex flex-row items-center justify-center gap-2 sm:gap-4 w-full mb-3">
                    <div className="border-[1.5px] border-gray-900 bg-gray-400 gap-px grid grid-cols-9 w-[180px] sm:w-[220px] aspect-square shadow-sm">
                        {board.map((row, r) => (
                            row.map((cell, c) => {
                                const isInit = initialBoard[r][c] !== null;
                                const isSelected = selectedCell?.r === r && selectedCell?.c === c;
                                const isSameRowCol = selectedCell && (selectedCell.r === r || selectedCell.c === c);
                                const isCorrect = !isInit && cell !== null && cell === solutionBoard[r][c];
                                const isWrong = !isInit && cell !== null && cell !== solutionBoard[r][c];
                                
                                const borderRight = c % 3 === 2 && c !== 8 ? 'border-r-[1.5px] border-gray-900' : '';
                                const borderBottom = r % 3 === 2 && r !== 8 ? 'border-b-[1.5px] border-gray-900' : '';
                                
                                let bgColor = 'bg-white';
                                if (isSelected) bgColor = 'bg-yellow-300 ring-2 ring-yellow-500 z-10 relative shadow-sm';
                                else if (isSameRowCol) bgColor = 'bg-yellow-50';
                                
                                let textColor = 'text-gray-900';
                                if (!isInit) {
                                    if (isCorrect) textColor = 'text-green-800 font-black text-[15px] sm:text-[18px] drop-shadow-sm';
                                    else if (isWrong) textColor = 'text-red-700 font-black text-[15px] sm:text-[18px] drop-shadow-sm';
                                }
                                
                                return (
                                    <div 
                                        key={`${r}-${c}`}
                                        onClick={() => handleCellClick(r, c)}
                                        className={`flex items-center justify-center text-xs sm:text-sm font-bold cursor-pointer transition-colors ${borderRight} ${borderBottom} ${bgColor} ${textColor}`}
                                    >
                                        {cell || ''}
                                    </div>
                                );
                            })
                        ))}
                    </div>

                    {!isWon && (
                        <div className="flex flex-col items-center">
                            <span className="text-[9px] sm:text-[10px] font-bold text-gray-500 mb-1 border-b border-gray-300 pb-0.5 whitespace-nowrap">नंबर भरें 👇</span>
                            <div className="grid grid-cols-2 gap-1 sm:gap-2">
                                {[1,2,3,4,5,6,7,8,9, 'X'].map((num, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => num === 'X' ? handleNumberClick(null) : handleNumberClick(num)}
                                        className={`font-bold py-1 px-3 rounded shadow-sm text-[10px] sm:text-xs transition-colors ${num === 'X' ? 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300' : 'bg-white hover:bg-gray-100 border border-gray-300 text-gray-800'}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end w-full max-w-[350px]">
                    <button onClick={initGame} className="text-[10px] font-bold text-gray-600 hover:text-gray-900 underline uppercase tracking-wider">नया खेल</button>
                </div>
            </div>
        </div>
    );
};

export default function Epaper() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [suvicharText, setSuvicharText] = useState('मंजिलें क्या हैं, रास्ता क्या है? हौसला हो तो फासला क्या है?');
    const [panchangData, setPanchangData] = useState({
        tithi: "ज्येष्ठ कृष्ण पक्ष, तृतीया",
        samvat: "विक्रम संवत 2083 • बुधवार"
    });
    const itemsPerPage = 11; // 11 stories per page to allow the last one to be wide

    useEffect(() => {
        const fetchSuvichar = async () => {
            try {
                const res = await fetch(__API_URL__ + '/api/suvichar');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.text) {
                        setSuvicharText(data.text);
                    }
                }
            } catch (error) {
                console.error('Error fetching suvichar:', error);
            }
        };
        fetchSuvichar();

        const fetchPanchang = async () => {
            try {
                const res = await fetch(__API_URL__ + '/api/panchang');
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.tithi) {
                        setPanchangData(data);
                    }
                }
            } catch (error) {
                console.error('Error fetching panchang:', error);
            }
        };
        fetchPanchang();

        const fetchEpaperNews = async () => {
            try {
                const res = await fetch(__API_URL__ + '/api/news');
                if (res.ok) {
                    const data = await res.json();
                    
                    // Get all e-paper news sorted by newest
                    const allEpaperNews = data
                        .filter(item => item.isEpaper)
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                        
                    // Calculate timestamp for 24 hours ago
                    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    
                    // Filter for news in the last 24 hours
                    const recentEpaperNews = allEpaperNews.filter(item => new Date(item.createdAt) >= twentyFourHoursAgo);
                    
                    // If no news updated in the last 24 hours, show old news so it doesn't stay empty!
                    if (recentEpaperNews.length > 0) {
                        setNews(recentEpaperNews);
                    } else {
                        setNews(allEpaperNews);
                    }
                }
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchEpaperNews();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#ece4d7]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800"></div>
            </div>
        );
    }

    if (news.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#ece4d7]">
                <h2 className="text-3xl font-serif font-bold text-red-800">ई-पेपर उपलब्ध नहीं है</h2>
                <p className="text-gray-800 mt-2 font-sans">जल्द ही ताज़ा खबरें अपडेट की जाएंगी।</p>
            </div>
        );
    }

    const stripHtml = (html) => {
        if (!html) return '';
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || doc.body.innerText || '';
    };

    const totalPages = Math.ceil(news.length / itemsPerPage);
    const paginatedNews = news.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const currentHour = new Date().getHours();
    const timeIcon = (currentHour >= 6 && currentHour < 18) ? '☀️' : '🌙';

    const downloadNewsCutting = async (id, title) => {
        const articleElement = document.getElementById(`article-${id}`);
        const mastheadElement = document.getElementById('epaper-masthead');
        if (!articleElement || !mastheadElement) return;
        
        try {
            // Create a temporary container
            const tempContainer = document.createElement('div');
            tempContainer.style.position = 'absolute';
            tempContainer.style.left = '0';
            tempContainer.style.top = '0';
            tempContainer.style.zIndex = '-9999'; // Hide behind current UI
            tempContainer.style.width = '1200px'; // Force desktop width
            tempContainer.style.backgroundColor = '#fef7e6';
            tempContainer.style.backgroundImage = 'url("https://www.transparenttextures.com/patterns/old-paper-texture.png")';
            tempContainer.style.padding = '20px 40px';
            tempContainer.style.boxSizing = 'border-box';
            tempContainer.style.display = 'flex';
            tempContainer.style.flexDirection = 'column';
            tempContainer.style.gap = '30px';

            // Clone masthead and force desktop visibility
            const mastheadClone = mastheadElement.cloneNode(true);
            const hiddenElements = mastheadClone.querySelectorAll('.hidden.md\\:flex');
            hiddenElements.forEach(el => {
                el.classList.remove('hidden', 'md:flex');
                el.style.display = 'flex';
            });
            
            // Clone article and clean it up
            const articleClone = articleElement.cloneNode(true);
            const cuttingBtn = articleClone.querySelector('.cutting-btn');
            if (cuttingBtn) cuttingBtn.remove();
            
            // Enhance article styling for standalone download
            articleClone.style.border = '4px solid #1e293b';
            articleClone.style.padding = '25px';
            articleClone.style.backgroundColor = '#ffffff';
            articleClone.style.boxShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.1)';
            articleClone.style.width = '100%';

            tempContainer.appendChild(mastheadClone);
            tempContainer.appendChild(articleClone);
            
            // Append to the root so styles apply perfectly
            document.getElementById('root').appendChild(tempContainer);

            // Wait for browser to calculate layout of the new cloned DOM
            await new Promise(resolve => setTimeout(resolve, 300));

            const filter = (node) => {
                if (node.tagName === 'IFRAME') return false;
                if (node.classList && node.classList.contains('skiptranslate')) return false;
                if (node.id === 'google_translate_element') return false;
                return true;
            };

            const dataUrl = await toJpeg(tempContainer, {
                quality: 0.95,
                backgroundColor: '#fef7e6',
                pixelRatio: 2,
                filter: filter
            });
            
            document.getElementById('root').removeChild(tempContainer);
            
            const link = document.createElement('a');
            link.href = dataUrl;
            const cleanTitle = title.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '_').substring(0, 30);
            link.download = `HBN24_News_Cutting_${cleanTitle}.jpg`;
            link.click();
        } catch (error) {
            console.error("Error generating cutting:", error);
            alert("Failed to download cutting. Please try again.");
            // Clean up
            const temp = document.getElementById('root').querySelector('div[style*="-9999"]');
            if (temp) document.getElementById('root').removeChild(temp);
        }
    };

    // Assign newspaper layout roles
    const getStoryStyle = (index) => {
        if (index === 0) return 'headline'; // main top story
        if (index === 1) return 'double-column';
        if (index === 10) return 'bottom-wide'; // 11th item spans 2 columns
        if (index === 2 || index === 3) return 'feature';
        return 'normal';
    };

    return (
        <div className="min-h-screen bg-[#c9c1ae] py-6 px-4 md:px-8 selection:bg-yellow-900 selection:text-white">
            {/* Main newspaper wrapper with aged paper look */}
            <div
                className="max-w-[1300px] mx-auto bg-[#fef7e6] shadow-2xl border border-black/20"
                style={{
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/old-paper-texture.png")',
                    fontFamily: "'Playfair Display', 'Times New Roman', Times, serif",
                }}
            >
                {/* ========== REAL NEWSPAPER MASTHEAD ========== */}
                <div id="epaper-masthead" className="border-b-[6px] border-black/20 pb-4 pt-6 px-6 relative">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 w-full">
                        <div className="hidden md:flex w-full md:w-[220px] justify-center md:justify-start shrink-0 mb-auto pt-2 md:pt-4">
                            <div className="flex flex-col items-center text-center">
                                <h3 className="text-3xl md:text-4xl font-normal text-[#a61c1c] mb-1 drop-shadow-sm" style={{fontFamily: "'Yatra One', cursive"}}>सुविचार</h3>
                                <p className="text-[13px] md:text-[15px] font-bold text-gray-800 leading-snug tracking-tight max-w-[180px]">{suvicharText}</p>
                            </div>
                        </div>
                        <div className="text-center flex-1">
                            <div className="inline-block relative mt-2 md:mt-4">
                                <div className="text-center text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em] -mb-1 md:-mb-2 relative z-10 font-sans">
                                    A Unit of HBN News 24
                                </div>
                                <h1
                                    className="text-[36px] sm:text-5xl md:text-[68px] lg:text-[90px] font-black tracking-tight leading-tight md:leading-[1.1] text-slate-900 uppercase whitespace-nowrap drop-shadow-sm"
                                    style={{ fontFamily: "'Noto Sans Devanagari', sans-serif", letterSpacing: '-0.02em' }}
                                >
                                    दैनिक सबसे तेज़
                                </h1>
                                <div className="text-center text-[11px] sm:text-[13px] md:text-[16px] font-bold text-[#a61c1c] uppercase -mt-2 md:-mt-4 opacity-90">
                                    सच्ची खबर, बेबाक नजर
                                </div>
                            </div>
                            <p className="text-[12px] tracking-normal font-mono mt-4 text-gray-700">
                                राष्ट्रीय हिंदी दैनिक • स्थापना 2024
                            </p>
                        </div>
                        <div className="hidden md:flex w-full md:w-[220px] justify-center md:justify-end shrink-0 mb-auto pt-2 md:pt-4">
                            <div className="flex flex-col items-end text-right border-r-[3px] border-[#a61c1c] pr-4 opacity-95">
                                <div className="flex items-center gap-2 mb-1.5 text-[#a61c1c]">
                                    <span className="text-[22px] md:text-[26px] font-black" style={{fontFamily: "'Yatra One', cursive"}}>ॐ</span>
                                    <span className="text-[14px] md:text-[16px] font-bold tracking-widest uppercase border-b-2 border-[#a61c1c]/30 pb-0.5">आज का पंचांग</span>
                                </div>
                                <div className="text-[18px] md:text-[20px] font-black text-gray-900 tracking-tight leading-tight">{panchangData.tithi}</div>
                                <div className="text-[13px] md:text-[15px] font-bold text-gray-600 mt-1">{panchangData.samvat}</div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap justify-between gap-2 text-[12px] font-medium border-t border-b border-black/20 py-2 mt-3 bg-black/5 px-2">
                        <span>
                            {new Date().toLocaleDateString('hi-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </span>
                        <span>पृष्ठ {currentPage} / {totalPages}</span>
                    </div>
                </div>

                {/* ========== 5-COLUMN NEWSPAPER GRID (AKHBAAR STYLE) ========== */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6 relative">
                    {paginatedNews.map((item, idx) => {
                        const style = getStoryStyle(idx);
                        const plainText = stripHtml(item.content);
                        let primaryCat = '';
                        if (Array.isArray(item.category)) {
                            const filtered = item.category.filter(c => c.toLowerCase() !== 'superfast' && c.toLowerCase() !== 'featured');
                            primaryCat = filtered.length > 0 ? filtered[0] : (item.category[0] || '');
                        } else if (typeof item.category === 'string') {
                            primaryCat = item.category;
                        }

                        const catHindi = {
                            politics: 'राजनीति',
                            sports: 'खेल',
                            entertainment: 'मनोरंजन',
                            business: 'अर्थ जगत',
                            tech: 'टेक्नोलॉजी',
                            technology: 'टेक्नोलॉजी',
                            religion: 'धर्म',
                            lifestyle: 'जीवनशैली',
                            national: 'राष्ट्रीय',
                            international: 'अंतर्राष्ट्रीय'
                        }[primaryCat?.toLowerCase()] || primaryCat;

                        // Dynamic column spans
                        let colSpan = 'col-span-1';
                        if (style === 'headline') colSpan = 'md:col-span-3 md:border-r-2 border-black/20 md:pr-6 md:pb-6';
                        if (style === 'double-column') colSpan = 'md:col-span-2 md:border-r border-black/15 md:pr-4 md:pb-6';
                        if (style === 'bottom-wide') colSpan = 'md:col-span-2 md:border-l border-black/15 md:pl-4';
                        if (style === 'feature') colSpan = 'md:col-span-1';

                        return (
                            <div
                                key={item._id}
                                className={`${colSpan} group break-inside-avoid pb-5 ${idx !== paginatedNews.length - 1 ? 'border-b md:border-b-0' : ''
                                    }`}
                            >
                                <div className="h-full -m-4 rounded transition-colors hover:bg-black/5">
                                    <article id={`article-${item._id}`} className="h-full flex flex-col p-4 relative">
                                        {/* Download Cutting Button - Visible on mobile, hover on desktop */}
                                        <button 
                                            onClick={() => downloadNewsCutting(item._id, item.title)}
                                            className="cutting-btn absolute top-2 right-2 z-10 bg-white/90 border border-gray-300 text-gray-700 text-[10px] px-2 py-1 rounded shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center gap-1 hover:bg-red-50 hover:text-red-700 font-bold"
                                            title="न्यूज़ की कटिंग डाउनलोड करें"
                                        >
                                            ✂️ कटिंग लें
                                        </button>

                                        {/* category stripe */}
                                        <div className="mb-2 flex items-center gap-2 pr-20">
                                        <span className="text-[10px] font-black uppercase bg-black text-white px-2 py-0.5 tracking-wider">
                                            {catHindi}
                                        </span>
                                        {style === 'headline' && (
                                            <span className="text-[10px] font-bold text-red-800 border-l-2 border-red-800 pl-2">
                                                विशेष संवाददाता
                                            </span>
                                        )}
                                    </div>

                                    {/* Headline */}
                                    <h2
                                        className={`font-black leading-snug pb-1 mb-2 hover:text-red-700 transition ${style === 'headline'
                                                ? 'text-4xl md:text-5xl'
                                                : style === 'double-column'
                                                    ? 'text-2xl md:text-3xl'
                                                    : 'text-xl'
                                            }`}
                                    >
                                        <Link to={`/news/${item.slug || item._id}`}>{item.title}</Link>
                                    </h2>

                                    {/* Byline */}
                                    <div className="text-[11px] font-mono text-gray-600 uppercase border-b border-dotted border-gray-400 self-start mb-3">
                                        नई दिल्ली • हमारे संवाददाता
                                    </div>

                                    {/* Image – only if not text-only and exists */}
                                    {item.image && (
                                        <div className="mb-3 overflow-hidden border border-black/10 bg-white shadow-sm">
                                            {item.image && !item.image.includes('chatgpt.com') ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full aspect-[16/9] object-cover transition duration-500 grayscale group-hover:grayscale-0"
                                                    loading="lazy"
                                                    crossOrigin="anonymous"
                                                />
                                            ) : (
                                                <img
                                                    src={item.image}
                                                    alt={item.title}
                                                    className="w-full aspect-[16/9] object-cover transition duration-500 grayscale group-hover:grayscale-0"
                                                    loading="lazy"
                                                />
                                            )}
                                            {style === 'headline' && (
                                                <p className="text-[9px] font-mono bg-gray-100 p-1 text-center border-t border-black/10">
                                                    📸 सांकेतिक तस्वीर | फोटो: HBN News 24
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Article text with real dropcap on headline */}
                                    <div className={`text-gray-800 text-left md:text-justify break-words flex-1 flex flex-col ${style === 'double-column' ? 'mb-4' : ''}`}>
                                        <p
                                            className={`text-sm leading-relaxed break-words ${style === 'headline'
                                                    ? 'first-letter:text-6xl first-letter:font-black first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-red-900 first-letter:leading-[0.8] line-clamp-[25]'
                                                    : style === 'double-column'
                                                    ? 'line-clamp-[16]'
                                                    : 'line-clamp-[14]'
                                                }`}
                                        >
                                            {plainText}
                                        </p>
                                    </div>

                                    {/* Auto-filler Game for empty space on right side */}
                                    {style === 'double-column' && <NewspaperGame />}
                                </article>
                                </div>
                            </div>
                        );
                    })}
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

                {/* Footer imprint */}
                <div className="text-xs font-sans font-medium text-center border-t border-black/20 py-4 text-gray-700 tracking-wide">
                    प्रकाशक: HBN News 24 मीडिया | यह ई-पेपर मूल मुद्रित संस्करण के समान प्रमाणिक है।
                </div>
            </div>
        </div>
    );
}
