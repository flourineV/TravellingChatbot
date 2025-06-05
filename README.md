# 🧳 Travel Chatbot

Chatbot du lịch thông minh sử dụng AI để cung cấp thông tin về nhà hàng, khách sạn, điểm tham quan, thời tiết và phương tiện di chuyển.

## ✨ Tính năng

- 🤖 **AI-powered**: Google Gemini + LangChain
- 🧠 **Memory**: Nhớ ngữ cảnh cuộc hội thoại
- � **Smart Cache**: Cache responses, request tracing
- �🔍 **Real-time Search**: Thông tin cập nhật với Tavily
- 🌐 **RESTful API**: Dễ tích hợp
- 🇻🇳 **Vietnamese**: Hỗ trợ tiếng Việt

## 🚀 Quick Start

### 1. Setup
```bash
git clone <your-repo>
cd Chatbot
npm install
```

### 2. API Keys
Tạo file `.env`:
```env
GEMINI_API_KEY=your_key_here
TAVILY_API_KEY=your_key_here
```

**Get FREE API keys:**
- Gemini: https://makersuite.google.com/app/apikey
- Tavily: https://tavily.com

### 3. Start
```bash
npm start
```

**Test:** Open http://localhost:5000

## 🧪 Testing

### Web Interface
Open http://localhost:5000 and try:
- "Nhà hàng phở ngon ở Hà Nội"
- "Khách sạn gần chợ Bến Thành"
- "Thời tiết Đà Lạt hôm nay"

### API Testing
```bash
# Basic test
npm test

# API test
npm run test:api

# Memory test
npm run test:memory
```

### Manual API Test
```bash
# Health check (includes cache stats)
curl http://localhost:5000/api/health

# Chat
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Nhà hàng ngon ở Sài Gòn", "sessionId": "test"}'

# Cache stats
curl http://localhost:5000/api/cache/stats

# Session analytics
curl http://localhost:5000/api/session/test/analytics

# Session history
curl http://localhost:5000/api/session/test/history
```

## 🔧 Integration

### JavaScript
```javascript
const response = await fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Nhà hàng ngon ở TP.HCM',
    sessionId: 'user-123'
  })
});
const data = await response.json();
console.log(data.response);
```

### Python
```python
import requests
response = requests.post('http://localhost:5000/api/chat', json={
    'message': 'Thời tiết Đà Lạt hôm nay',
    'sessionId': 'user-456'
})
print(response.json()['response'])
```

### API Response
```json
{
  "success": true,
  "response": "Câu trả lời của chatbot...",
  "metadata": {
    "category": "food",
    "location": "TP.HCM",
    "sessionId": "user-123",
    "contextUsed": false,
    "followUpDetected": false
  }
}
```

## 📝 License

MIT License

---

**Happy coding! 🚀**
