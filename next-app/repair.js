const fs = require('fs');
let content = fs.readFileSync('src/pages/Epaper.jsx', 'utf8');

const startIdx = content.indexOf('export default function Epaper() {');
const before = content.slice(0, startIdx);

const newFunctionStart = `export default function Epaper() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [cuttingModalData, setCuttingModalData] = useState(null);
    const [suvicharText, setSuvicharText] = useState('मंजिलें क्या हैं, रास्ता क्या है? हौसला हो तो फासला क्या है?');
    const [panchangData, setPanchangData] = useState(() => {
        const daysInHindi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
        const todayHindi = daysInHindi[new Date().getDay()];
        return {
            tithi: "लोड हो रहा है...",
            samvat: "विक्रम संवत 2083 • " + todayHindi
        };
    });
    const itemsPerPage = 11; // 11 stories per page to allow the last one to be wide

    useEffect(() => {
        const fetchSuvichar = async () => {
            try {
                const res = await fetch('/api/suvichar');
                if (res.ok) {
                    const dataArray = await res.json();
                    const data = Array.isArray(dataArray) ? dataArray[0] : dataArray;
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
                const res = await fetch('/api/panchang');
                if (res.ok) {
                    const dataArray = await res.json();
                    const data = Array.isArray(dataArray) ? dataArray[0] : dataArray;
                    if (data && data.tithi) {
                        const daysInHindi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
                        const todayHindi = daysInHindi[new Date().getDay()];
                        let samvatText = data.samvat || '';
                        if (samvatText.includes('•')) {
                            samvatText = samvatText.split('•')[0].trim() + ' • ' + todayHindi;
                        } else {
                            samvatText = samvatText + ' • ' + todayHindi;
                        }
                        setPanchangData({ tithi: data.tithi, samvat: samvatText });
                    }
                }
            } catch (error) {
                console.error('Error fetching panchang:', error);
            }
        };
        fetchPanchang();

        const fetchEpaperNews = async () => {
            try {
                const res = await fetch('/api/news');
                if (res.ok) {
                    const data = await res.json();

                    // Get all e-paper news sorted by newest
                    const allEpaperNews = data
                        .filter(item => item.isEpaper)`;

const sortIdx = content.indexOf('.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));');
const after = content.slice(sortIdx);

fs.writeFileSync('src/pages/Epaper.jsx', before + newFunctionStart + after);
console.log('Fixed Epaper.jsx!');
