// api/book-info.js

export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    const { isbn } = req.query;

    if (!isbn) {
        return res.status(400).json({ error: 'ISBN parameter is required.' });
    }

    try {
        // ISBN에서 실제 검색할 번호 추출 (세트 형태 처리)
        let searchableISBN = isbn.trim();
        if (isbn.includes('세트 ')) {
            const parts = isbn.split('세트 ');
            if (parts.length > 1) {
                searchableISBN = parts[1].trim();
            }
        }

        const bookInfoUrl = `https://www.jeju.go.kr/tool/lib/book-info.jsp?isbn=${encodeURIComponent(searchableISBN)}`;
        
        console.log(`책 정보 API 호출: ${searchableISBN}`);
        console.log(`URL: ${bookInfoUrl}`);
        
        const response = await fetch(bookInfoUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'ko-KR,ko;q=0.9,en;q=0.8',
                'Referer': 'https://www.jeju.go.kr/'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('제주도서관 책 정보 응답:', data);
        
        // 결과 반환
        res.status(200).json({
            success: true,
            isbn: searchableISBN,
            originalISBN: isbn,
            data: data
        });

    } catch (error) {
        console.error('책 정보 조회 오류:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch book info', 
            details: error.message,
            isbn: isbn
        });
    }
}