const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 간단한 메모리 캐시
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5분

app.get('/api/search', async (req, res) => {
    const startTime = Date.now();
    
    try {
        const { keyword, lib } = req.query;
        
        if (!keyword) {
            return res.status(400).json({ error: '검색어가 필요합니다' });
        }

        // 도서관 코드 기본값 설정
        const libraryCode = lib || 'MJ';

        // 캐시 키에 도서관 코드 포함
        const cacheKey = `${keyword.toLowerCase()}_${libraryCode}`;
        const cachedResult = cache.get(cacheKey);
        
        if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
            console.log(`캐시 히트: ${keyword} (${libraryCode}) (${Date.now() - startTime}ms)`);
            return res.json({
                success: true,
                data: cachedResult.data,
                cached: true,
                responseTime: Date.now() - startTime
            });
        }

        // 제주도 도서관 검색 URL 사용
        const searchUrl = `https://www.jeju.go.kr/tool/lib/search.jsp?lib=${libraryCode}&q=${encodeURIComponent(keyword)}`;
        
        console.log(`API 호출 시작: ${keyword} (도서관 코드: ${libraryCode})`);
        console.log(`검색 URL: ${searchUrl}`);
        
        const response = await fetch(searchUrl, {
            timeout: 10000, // 10초 타임아웃
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        const data = await response.text();
        
        // 캐시에 저장
        cache.set(cacheKey, {
            data: data,
            timestamp: Date.now()
        });
        
        // 캐시 크기 제한 (100개)
        if (cache.size > 100) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
        }
        
        const responseTime = Date.now() - startTime;
        console.log(`API 응답 완료: ${keyword} (${libraryCode}) (${responseTime}ms)`);
        
        res.json({ 
            success: true, 
            data: data,
            cached: false,
            responseTime: responseTime
        });
        
    } catch (error) {
        console.error('프록시 오류:', error);
        res.status(500).json({ 
            error: '검색 중 오류가 발생했습니다',
            message: error.message,
            responseTime: Date.now() - startTime
        });
    }
});

app.listen(PORT, () => {
    console.log(`프록시 서버가 http://localhost:${PORT} 에서 실행 중입니다`);
});