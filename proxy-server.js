import http from 'http';
import url from 'url';

// API 핸들러 로드
import searchHandler from './api/search.js';
import rentStatusHandler from './api/rent-status.js';
import bookInfoHandler from './api/book-info.js';

const PORT = 3001;

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    req.query = parsedUrl.query; // Vercel 환경과 유사하게 query 객체 추가

    // Express.js 스타일 헬퍼 메서드 추가
    res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
    };
    
    res.status = (statusCode) => {
        res.statusCode = statusCode;
        return res; // 체이닝을 위해 res 반환
    };

    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    try {
        if (parsedUrl.pathname.startsWith('/api/search')) {
            await searchHandler(req, res);
        } else if (parsedUrl.pathname.startsWith('/api/rent-status')) {
            await rentStatusHandler(req, res);
        } else if (parsedUrl.pathname.startsWith('/api/book-info')) {
            await bookInfoHandler(req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found' }));
        }
    } catch (error) {
        console.error('Server Error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error', details: error.message }));
    }
});

server.listen(PORT, () => {
    console.log(`
✅ 로컬 개발 서버가 http://localhost:${PORT} 에서 실행 중입니다.

- 웹 페이지: http://localhost:8000 (또는 index.html을 직접 여세요)
- 검색 API: http://localhost:${PORT}/api/search?keyword=여행
- 대출상태 API: http://localhost:${PORT}/api/rent-status?key=12345
    `);
});
