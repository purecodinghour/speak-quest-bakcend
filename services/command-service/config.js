// config.js

module.exports = {
    // MongoDB 연결 URI
    MONGODB_URI: 'mongodb://localhost:27017/speakquest', // MongoDB URI 형식에 맞게 수정
  
    // 서버 포트 설정
    PORT: 3005, // 필요한 경우 다른 포트로 변경 가능
    
    // JWT 토큰 비밀키 설정 (필요한 경우)
    JWT_SECRET: 'your_jwt_secret', // JWT 토큰 서명에 사용할 비밀키
    
    // 기타 설정 (추가 필요 시 여기에 작성)
  };
  