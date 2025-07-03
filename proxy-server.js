const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// 도서관 코드에 따른 도서관 이름 반환
function getLibraryName(libraryCode) {
    const libraries = {
        'MJ': '한라도서관',
        'MK': '우당도서관',
        'ML': '탐라도서관',
        'MM': '제주 기적의도서관',
        'MP': '애월도서관'
    };
    return libraries[libraryCode] || '제주도서관';
}

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

        // 제주도 도서관 API 엔드포인트 (JSON 응답)
        const searchUrl = `https://www.jeju.go.kr/tool/lib/search.jsp?lib=${libraryCode}&q=${encodeURIComponent(keyword)}&format=json`;
        
        console.log(`API 호출 시작: ${keyword} (도서관 코드: ${libraryCode})`);
        console.log(`검색 URL: ${searchUrl}`);
        
        const response = await fetch(searchUrl, {
            timeout: 10000, // 10초 타임아웃
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
        
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // HTML 응답일 경우 텍스트로 받아서 처리
            const htmlText = await response.text();
            
            // 간단한 HTML 파싱으로 도서 정보 추출 (실제 사용 시에는 더 정교한 파싱 필요)
            const mockData = {
                Result: { ResultCode: 'Y' },
                Contents: {
                    LibraryName: getLibraryName(libraryCode),
                    TotalCount: 0,
                    LibraryDataSearchList: []
                }
            };
            
            // HTML에서 도서 정보가 있는지 확인
            if (htmlText.includes('검색결과') || htmlText.includes('도서')) {
                mockData.Contents.TotalCount = 1;
                mockData.Contents.LibraryDataSearchList = [{
                    BookTitle: `"${keyword}" 검색 결과`,
                    BookAuthor: '검색 결과 확인 필요',
                    BookPublisher: '출판사 정보 없음',
                    BookPublisherYear: '연도 정보 없음',
                    BookISBN: 'ISBN 정보 없음',
                    LibraryBookLocationRoom: '위치 정보 없음',
                    BookWorkingStatus: '상태 확인 필요',
                    BookThumbnailURL: '',
                    LibrarySearchDetailURL: searchUrl.replace('&format=json', '')
                }];
            }
            
            data = mockData;
        }
        
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