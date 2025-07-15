// api/rent-status.js

export default async function handler(req, res) {
    // CORS 헤더 설정 (필요 시)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { key } = req.query;

    if (!key) {
        return res.status(400).json({ error: 'A key parameter is required.' });
    }

    try {
        const response = await fetch(`https://www.jeju.go.kr/tool/lib/rent-stat.jsp?key=${key}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // total이 0이면 "대출중", 1 이상이면 "대출가능"
        const status = data.total === 0 ? '대출중' : '대출가능';

        res.status(200).json({ status });

    } catch (error) {
        console.error('Error fetching rent status:', error);
        res.status(500).json({ error: 'Failed to fetch rent status', details: error.message });
    }
}